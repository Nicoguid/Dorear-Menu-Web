import { StoreSettings } from './types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  whatsappNumber: '5491136458899',
  wifiSSID: 'dorear',
  wifiPassword: '12345678',
  groupMenuPricePerPerson: 14500,
};

export const STORAGE_KEYS = {
  ITEMS: 'dorear_menu_items_v10',
  WEEKLY: 'dorear_weekly_dishes_v10',
  OVERRIDE: 'dorear_weekly_override_v10',
  SETTINGS: 'dorear_store_settings_v10',
  UPDATED_AT: 'dorear_state_updated_at_v10',
} as const;

export const BROADCAST_CHANNEL_NAME = 'dorear_realtime_sync_v10';
