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
  WEEKLY: 'dorear_weekly_dishes_v13',
  OVERRIDE: 'dorear_weekly_override_v13',
  SETTINGS: 'dorear_store_settings_v13',
  UPDATED_AT: 'dorear_state_updated_at_v13',
} as const;

export const BROADCAST_CHANNEL_NAME = 'dorear_realtime_sync_v13';

export const PIN_SALT = 'dorear_sec_2026_';
export const HASH_BARISTA = '5cb739bd8f2da1e12de0defd98467fffa765215a852dc04be0b7aad6e09b1ea9';
export const HASH_ADMIN = '4b38af39c2fc4b9f01003f06e798bfe90ba7fa9b315665c489713a55ead2306a';
