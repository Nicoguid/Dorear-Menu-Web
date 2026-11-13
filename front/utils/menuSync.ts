import { supabase } from './supabaseClient';
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

  try {
    const rawCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (rawCategories) {
      const parsed = JSON.parse(rawCategories);
      if (isValidCategoryArray(parsed)) categories = parsed;
    }
  } catch {}

  try {
    const rawItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (rawItems) {
      const parsed = JSON.parse(rawItems);
      if (isValidMenuItemArray(parsed)) items = parsed;
    }
  } catch {}

  try {
    const rawWeekly = localStorage.getItem(STORAGE_KEYS.WEEKLY);
    if (rawWeekly) {
      const parsed = JSON.parse(rawWeekly);
      if (isValidWeeklyDishArray(parsed)) weeklyDishes = parsed;
    }
  } catch {}

  try {
    const rawOverride = localStorage.getItem(STORAGE_KEYS.OVERRIDE);
    if (rawOverride !== null) {
      const parsed = JSON.parse(rawOverride);
      if (typeof parsed === 'number' && Number.isInteger(parsed) && parsed >= 1 && parsed <= 5) {
        weeklyOverrideDay = parsed;
      }
    }
  } catch {}

  try {
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (isValidStoreSettings(parsed)) storeSettings = parsed;
    }
  } catch {}

  try {
    const rawUpdated = localStorage.getItem(STORAGE_KEYS.UPDATED_AT);
    if (rawUpdated) {
      const parsed = Number(rawUpdated);
      if (Number.isFinite(parsed) && parsed > 0) updatedAt = parsed;
    }
  } catch {
    updatedAt = 0;
  }

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
  } catch (e) {
    console.error('Error persisting state to localStorage', e);
  }
}

export function clearLocalStateSnapshot(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    const legacyKeys = [
      'dorear_menu_items_v9',
      'dorear_weekly_dishes_v9',
      'dorear_weekly_override',
      'dorear_store_settings_v1',
      'dorear_menu_items_v10',
      'dorear_weekly_dishes_v10',
      'dorear_weekly_override_v10',
      'dorear_store_settings_v10',
      'dorear_state_updated_at_v10',
      'dorear_menu_items_v11',
      'dorear_weekly_dishes_v11',
      'dorear_weekly_override_v11',
      'dorear_store_settings_v11',
      'dorear_state_updated_at_v11',
      'dorear_menu_items_v12',
      'dorear_weekly_dishes_v12',
      'dorear_weekly_override_v12',
      'dorear_store_settings_v12',
      'dorear_state_updated_at_v12',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Error clearing localStorage', e);
  }
}

export function broadcastStateChange(
  state: DorearSharedState | { reset: true }
): void {
  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage(state);
      bc.close();
    }
  } catch {}

  let staffPin = '';
  try {
    staffPin = sessionStorage.getItem('dorear_session_pin') || '';
  } catch {}
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (staffPin) {
    headers['X-Dorear-Pin'] = staffPin;
  }

  if (supabase) {
    if ('reset' in state && state.reset) {
      Promise.resolve(
        supabase
          .from('dorear_state')
          .delete()
          .eq('id', 'current')
      ).catch(() => {});
    } else {
      const fullState = state as DorearSharedState;
      Promise.resolve(
        supabase
          .from('dorear_state')
          .upsert({
            id: 'current',
            state: fullState,
            updated_at: fullState.updatedAt || Date.now(),
          })
      )
        .then((res) => {
          if (res?.error) console.warn('Supabase sync warning:', res.error.message);
        })
        .catch(() => {});
    }
  } else {
    fetch('/api/menu-state', {
      method: 'POST',
      headers,
      body: JSON.stringify(state),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return;
        const data = await res.json();
        if (data && data.state) {
          const validated = validateSharedStatePayload(data.state);
          if (validated) {
            saveLocalStateSnapshot(validated);
          }
        }
      })
      .catch(() => {});
  }
}

export function subscribeToRealtimeSync(
  onReceiveState: (state: DorearSharedState) => void,
  onReset: () => void,
  onSyncStatusChange?: (isLive: boolean) => void
): () => void {
  let bc: BroadcastChannel | null = null;
  let supabaseChannel: RealtimeChannel | null = null;
  let eventSource: EventSource | null = null;

  const handlePayload = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return;
    const data = payload as Record<string, unknown>;
    if (data.reset === true) {
      onReset();
      return;
    }
    const validated = validateSharedStatePayload(data);
    if (validated) {
      onReceiveState(validated);
    }
  };

  if (supabase) {
    const client = supabase;
    Promise.resolve(
      client
        .from('dorear_state')
        .select('state, updated_at')
        .eq('id', 'current')
        .maybeSingle()
    )
      .then((res) => {
        if (!res?.error && res?.data && res.data.state) {
          onSyncStatusChange?.(true);
          handlePayload(res.data.state);
        }
      })
      .catch(() => {});

    supabaseChannel = client
      .channel('dorear_realtime_menu')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dorear_state',
          filter: 'id=eq.current',
        },
        (payload) => {
          onSyncStatusChange?.(true);
          if (payload.eventType === 'DELETE') {
            onReset();
            return;
          }
          const row = payload.new as { state?: unknown } | null;
          if (row && row.state) {
            handlePayload(row.state);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          onSyncStatusChange?.(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          onSyncStatusChange?.(false);
        }
      });
  } else {
    fetch('/api/menu-state', { cache: 'no-store' })
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          onSyncStatusChange?.(true);
          return res.json();
        }
        onSyncStatusChange?.(false);
        return null;
      })
      .then((data) => {
        if (data && data.state) {
          handlePayload(data.state);
        }
      })
      .catch(() => {
        onSyncStatusChange?.(false);
      });

    try {
      if ('EventSource' in window) {
        eventSource = new EventSource('/api/menu-stream');
        eventSource.onopen = () => {
          onSyncStatusChange?.(true);
        };
        eventSource.onerror = () => {
          onSyncStatusChange?.(false);
        };
        eventSource.onmessage = (event) => {
          try {
            handlePayload(JSON.parse(event.data));
          } catch {}
        };
      }
    } catch {}
  }

  try {
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => {
        handlePayload(event.data);
      };
    }
  } catch {}

  return () => {
    if (bc) bc.close();
    if (eventSource) eventSource.close();
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}
