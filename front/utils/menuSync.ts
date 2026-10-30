import { MenuItem, StoreSettings, WeeklyDish } from '../../db/types';
import { BROADCAST_CHANNEL_NAME, STORAGE_KEYS } from '../../db/storeSettings';
import {
  DorearSharedState,
  isValidMenuItemArray,
  isValidStoreSettings,
  isValidWeeklyDishArray,
  validateSharedStatePayload,
} from '../../db/stateValidation';

export type { DorearSharedState };
export {
  isValidMenuItemArray,
  isValidWeeklyDishArray,
  isValidStoreSettings,
  validateSharedStatePayload,
};

export function loadValidatedLocalState(defaults: {
  items: MenuItem[];
  weeklyDishes: WeeklyDish[];
  storeSettings: StoreSettings;
}): DorearSharedState {
  let items = defaults.items;
  let weeklyDishes = defaults.weeklyDishes;
  let weeklyOverrideDay: number | null = null;
  let storeSettings = defaults.storeSettings;
  let updatedAt = 0;

  try {
    const rawItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (rawItems) {
      const parsed = JSON.parse(rawItems);
      if (isValidMenuItemArray(parsed)) items = parsed;
    }
  } catch {
    // Fallback to default items
  }

  try {
    const rawWeekly = localStorage.getItem(STORAGE_KEYS.WEEKLY);
    if (rawWeekly) {
      const parsed = JSON.parse(rawWeekly);
      if (isValidWeeklyDishArray(parsed)) weeklyDishes = parsed;
    }
  } catch {
    // Fallback to default weekly dishes
  }

  try {
    const rawOverride = localStorage.getItem(STORAGE_KEYS.OVERRIDE);
    if (rawOverride !== null) {
      const parsed = JSON.parse(rawOverride);
      if (typeof parsed === 'number' && Number.isInteger(parsed) && parsed >= 1 && parsed <= 5) {
        weeklyOverrideDay = parsed;
      }
    }
  } catch {
    // Fallback to null
  }

  try {
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (isValidStoreSettings(parsed)) storeSettings = parsed;
    }
  } catch {
    // Fallback to default settings
  }

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
    version: 10,
    updatedAt,
    items,
    weeklyDishes,
    weeklyOverrideDay,
    storeSettings,
  };
}

export function saveLocalStateSnapshot(state: DorearSharedState): void {
  try {
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
    localStorage.removeItem('dorear_menu_items_v9');
    localStorage.removeItem('dorear_weekly_dishes_v9');
    localStorage.removeItem('dorear_weekly_override');
    localStorage.removeItem('dorear_store_settings_v1');
  } catch (e) {
    console.error('Error clearing localStorage', e);
  }
}

export function broadcastStateChange(
  state: DorearSharedState | { reset: true },
  role: 'customer' | 'barista' | 'admin' = 'admin'
): void {
  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage(state);
      bc.close();
    }
  } catch {
    // Ignore if BroadcastChannel is restricted
  }

  const staffPin = role === 'admin' ? '8888' : role === 'barista' ? '1234' : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (staffPin) {
    headers['X-Dorear-Pin'] = staffPin;
  }

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
    .catch(() => {
      // Offline or static-only host fallback
    });
}

export function subscribeToRealtimeSync(
  onReceiveState: (state: DorearSharedState) => void,
  onReset: () => void,
  onSyncStatusChange?: (isLive: boolean) => void
): () => void {
  let bc: BroadcastChannel | null = null;
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
        } catch {
          // Ignore malformed event
        }
      };
    }
  } catch {
    // Fallback if SSE is unavailable
  }

  try {
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => {
        handlePayload(event.data);
      };
    }
  } catch {
    // Ignore
  }

  return () => {
    if (bc) bc.close();
    if (eventSource) eventSource.close();
  };
}
