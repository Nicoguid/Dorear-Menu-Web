import { getSupabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { MenuCategory, MenuItem, StoreSettings, WeeklyDish } from '../../db/types';
import {
  BROADCAST_CHANNEL_NAME,
  CURRENT_STATE_VERSION,
  STORAGE_KEYS,
} from '../../db/storeSettings';
import { CATEGORIES } from '../../db/menuData';
import {
  DorearSharedState,
  isValidCategoryArray,
  isValidMenuItemArray,
  isValidStoreSettings,
  isValidWeeklyDishArray,
  validateSharedStatePayload,
} from '../../db/stateValidation';

export type { DorearSharedState };

export type StaffRole = 'admin' | 'barista';

/** Resultado de un guardado: si falla, `error` trae un texto para mostrarle a la dueña. */
export type SaveResult = { ok: true } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Sesión del personal
// ---------------------------------------------------------------------------
// El PIN queda solo en memoria (no en sessionStorage): se pierde al recargar, igual que
// el modo personal. La base de datos lo vuelve a verificar en cada guardado.
let staffPin = '';

export function setStaffSessionPin(pin: string): void {
  staffPin = pin;
}

export function clearStaffSession(): void {
  staffPin = '';
}

const RPC_ERRORS: Record<string, string> = {
  pin: 'El PIN ya no es válido. Salí del panel y volvé a entrar.',
  forbidden: 'Este PIN no tiene permiso para hacer ese cambio.',
  invalid: 'La carta tiene datos inválidos y no se guardó.',
  empty: 'Todavía no hay una carta guardada en la base.',
};

async function callStaffRpc(fn: string, args: Record<string, unknown>): Promise<SaveResult> {
  const supabase = await getSupabase();
  if (!supabase) return { ok: false, error: 'No hay conexión con la base de datos.' };
  try {
    const { data, error } = await supabase.rpc(fn, args);
    if (error) return { ok: false, error: error.message || 'No se pudo guardar.' };
    const result = data as { ok?: boolean; error?: string } | null;
    if (!result?.ok) {
      return { ok: false, error: RPC_ERRORS[result?.error || ''] || 'No se pudo guardar.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Sin conexión: el cambio quedó solo en este dispositivo.' };
  }
}

/**
 * Verifica el PIN en la base de datos (función dorear_staff_role). La base lleva la
 * cuenta de intentos fallidos por IP, así que el límite no se saltea recargando.
 */
export async function verifyStaffPin(
  pin: string
): Promise<{ role: StaffRole | null; error?: string }> {
  const supabase = await getSupabase();
  if (!supabase) return { role: null, error: 'No hay conexión con la base de datos.' };
  try {
    const { data, error } = await supabase.rpc('dorear_staff_role', { p_pin: pin });
    if (error) return { role: null, error: error.message };
    return { role: data === 'admin' || data === 'barista' ? data : null };
  } catch {
    return { role: null, error: 'Sin conexión. Probá de nuevo en un momento.' };
  }
}

// ---------------------------------------------------------------------------
// Copia local (para abrir la carta al instante y sin señal)
// ---------------------------------------------------------------------------

export function loadValidatedLocalState(defaults: {
  categories?: MenuCategory[];
  items: MenuItem[];
  weeklyDishes: WeeklyDish[];
  storeSettings: StoreSettings;
}): DorearSharedState {
  let categories = defaults.categories || CATEGORIES;
  let items = defaults.items;
  let weeklyDishes = defaults.weeklyDishes;
  let weeklyOverrideDay: number | null = null;
  let storeSettings = defaults.storeSettings;
  let updatedAt = 0;

  const read = (key: string): unknown => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? undefined : JSON.parse(raw);
    } catch {
      return undefined;
    }
  };

  const rawCategories = read(STORAGE_KEYS.CATEGORIES);
  if (isValidCategoryArray(rawCategories)) categories = rawCategories;
  const rawItems = read(STORAGE_KEYS.ITEMS);
  if (isValidMenuItemArray(rawItems)) items = rawItems;
  const rawWeekly = read(STORAGE_KEYS.WEEKLY);
  if (isValidWeeklyDishArray(rawWeekly)) weeklyDishes = rawWeekly;
  const rawOverride = read(STORAGE_KEYS.OVERRIDE);
  if (typeof rawOverride === 'number' && Number.isInteger(rawOverride) && rawOverride >= 1 && rawOverride <= 5) {
    weeklyOverrideDay = rawOverride;
  }
  const rawSettings = read(STORAGE_KEYS.SETTINGS);
  if (isValidStoreSettings(rawSettings)) storeSettings = rawSettings;
  const rawUpdated = Number(read(STORAGE_KEYS.UPDATED_AT));
  if (Number.isFinite(rawUpdated) && rawUpdated > 0) updatedAt = rawUpdated;

  return {
    version: CURRENT_STATE_VERSION,
    updatedAt,
    categories,
    items,
    weeklyDishes,
    weeklyOverrideDay,
    storeSettings,
  };
}

export function saveLocalStateSnapshot(state: DorearSharedState): void {
  try {
    if (state.categories) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories));
    }
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(state.items));
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(state.weeklyDishes));
    if (state.weeklyOverrideDay === null) {
      localStorage.removeItem(STORAGE_KEYS.OVERRIDE);
    } else {
      localStorage.setItem(STORAGE_KEYS.OVERRIDE, JSON.stringify(state.weeklyOverrideDay));
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.storeSettings));
    localStorage.setItem(STORAGE_KEYS.UPDATED_AT, String(state.updatedAt));
  } catch {
    // Sin espacio o en modo privado: la carta sigue andando, solo no queda copia local.
  }
}

export function clearLocalStateSnapshot(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignorar
  }
}

/**
 * Borra las copias de versiones viejas de la carta (claves _v9 a _v12) que pueden
 * haber quedado en celulares de clientes frecuentes. Se corre una vez al abrir.
 */
export function removeLegacyLocalKeys(): void {
  try {
    const current = new Set<string>(Object.values(STORAGE_KEYS));
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dorear_') && !current.has(key) && !key.startsWith('dorear_pin_')) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignorar
  }
}

// ---------------------------------------------------------------------------
// Guardar cambios del personal
// ---------------------------------------------------------------------------

function notifyOtherTabs(payload: DorearSharedState | { reset: true }): void {
  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage(payload);
      bc.close();
    }
  } catch {
    // ignorar
  }
}

/** Guarda la carta completa (solo la dueña). */
export function saveFullState(state: DorearSharedState): Promise<SaveResult> {
  notifyOtherTabs(state);
  return callStaffRpc('dorear_save_state', { p_pin: staffPin, p_state: state });
}

/**
 * Marca un producto como agotado o disponible. Manda solo ese cambio, así dos
 * personas tocando la barra a la vez no se pisan la carta entre sí.
 */
export function saveAvailability(
  state: DorearSharedState,
  itemId: string,
  available: boolean
): Promise<SaveResult> {
  notifyOtherTabs(state);
  return callStaffRpc('dorear_set_availability', {
    p_pin: staffPin,
    p_item_id: itemId,
    p_available: available,
  });
}

/** Restaura la carta original del código en todos los dispositivos (solo la dueña). */
export function resetSharedState(): Promise<SaveResult> {
  notifyOtherTabs({ reset: true });
  return callStaffRpc('dorear_reset_state', { p_pin: staffPin });
}

// ---------------------------------------------------------------------------
// Recibir cambios en vivo
// ---------------------------------------------------------------------------

export function subscribeToRealtimeSync(
  onReceiveState: (state: DorearSharedState) => void,
  onReset: () => void,
  onSyncStatusChange?: (isLive: boolean) => void
): () => void {
  let bc: BroadcastChannel | null = null;
  let supabaseChannel: RealtimeChannel | null = null;
  let cancelled = false;
  let supabaseClient: Awaited<ReturnType<typeof getSupabase>> = null;

  const handlePayload = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return;
    const data = payload as Record<string, unknown>;
    if (data.reset === true) {
      onReset();
      return;
    }
    const validated = validateSharedStatePayload(data);
    if (validated) onReceiveState(validated);
  };

  getSupabase().then((client) => {
    if (!client || cancelled) return;
    supabaseClient = client;
    Promise.resolve(
      client.from('dorear_state').select('state, updated_at').eq('id', 'current').maybeSingle()
    )
      .then((res) => {
        if (!res?.error && res?.data?.state) {
          onSyncStatusChange?.(true);
          handlePayload(res.data.state);
        }
      })
      .catch(() => onSyncStatusChange?.(false));

    supabaseChannel = client
      .channel('dorear_realtime_menu')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dorear_state', filter: 'id=eq.current' },
        (payload) => {
          onSyncStatusChange?.(true);
          if (payload.eventType === 'DELETE') {
            onReset();
            return;
          }
          const row = payload.new as { state?: unknown } | null;
          if (row?.state) handlePayload(row.state);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') onSyncStatusChange?.(true);
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') onSyncStatusChange?.(false);
      });
  });

  try {
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => handlePayload(event.data);
    }
  } catch {
    // ignorar
  }

  return () => {
    cancelled = true;
    bc?.close();
    if (supabaseChannel && supabaseClient) supabaseClient.removeChannel(supabaseChannel);
  };
}
