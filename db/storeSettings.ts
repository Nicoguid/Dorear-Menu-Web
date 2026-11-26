import { StoreSettings } from './types';

export const CURRENT_STATE_VERSION = 13;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  whatsappNumber: '5492364351445',
  wifiSSID: 'dorear',
  wifiPassword: '12345678',
  groupMenuPricePerPerson: 25000,
};

export const STORAGE_KEYS = {
  ITEMS: 'dorear_menu_items_v13',
  CATEGORIES: 'dorear_categories_v13',
  WEEKLY: 'dorear_weekly_dishes_v13',
  OVERRIDE: 'dorear_weekly_override_v13',
  SETTINGS: 'dorear_store_settings_v13',
  UPDATED_AT: 'dorear_state_updated_at_v13',
} as const;

export const BROADCAST_CHANNEL_NAME = 'dorear_realtime_sync_v13';

// Los PINs del personal ya no están en el código: se guardan (hasheados) en la tabla
// privada dorear_staff_pins de Supabase y se verifican con la función dorear_staff_role.
// Para cambiarlos: ver db/migrations/2026-11-24_01_pin_en_servidor.sql (dorear_set_pin).
