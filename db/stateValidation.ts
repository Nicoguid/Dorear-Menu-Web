import {
  AllergenTag,
  DietaryTag,
  LocalizedString,
  MenuItem,
  ProductModifier,
  StoreSettings,
  WeeklyDish,
} from './types';
import { CURRENT_STATE_VERSION } from './storeSettings';

export interface DorearSharedState {
  version: number;
  updatedAt: number;
  items: MenuItem[];
  weeklyDishes: WeeklyDish[];
  weeklyOverrideDay: number | null;
  storeSettings: StoreSettings;
}

const VALID_DIETARY_TAGS = new Set<string>(['sin_tacc', 'vegano', 'sin_lactosa']);
const VALID_ALLERGEN_TAGS = new Set<string>(['tacc', 'lacteos', 'frutos_secos', 'huevo']);

export function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed.length > 2048) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '0.0.0.0' ||
      host === '[::1]' ||
      host.startsWith('127.') ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function isValidLocalizedString(val: unknown): val is LocalizedString {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  return (
    typeof obj.es === 'string' &&
    obj.es.length <= 1000 &&
    typeof obj.en === 'string' &&
    obj.en.length <= 1000 &&
    typeof obj.pt === 'string' &&
    obj.pt.length <= 1000
  );
}

export function isValidDietaryArray(val: unknown): val is DietaryTag[] {
  if (!Array.isArray(val) || val.length > 10) return false;
  return val.every((tag) => typeof tag === 'string' && VALID_DIETARY_TAGS.has(tag));
}

export function isValidAllergenArray(val: unknown): val is AllergenTag[] {
  if (!Array.isArray(val) || val.length > 10) return false;
  return val.every((tag) => typeof tag === 'string' && VALID_ALLERGEN_TAGS.has(tag));
}

export function isValidModifierArray(val: unknown): val is ProductModifier[] {
  if (!Array.isArray(val) || val.length > 25) return false;
  return val.every((mod) => {
    if (!mod || typeof mod !== 'object') return false;
    const m = mod as Record<string, unknown>;
    return (
      typeof m.id === 'string' &&
      m.id.trim().length > 0 &&
      m.id.length <= 128 &&
      isValidLocalizedString(m.name) &&
      typeof m.price === 'number' &&
      Number.isFinite(m.price) &&
      Math.abs(m.price) <= 10_000_000 &&
      (m.invalidatesDietary === undefined || isValidDietaryArray(m.invalidatesDietary)) &&
      (m.allergens === undefined || isValidAllergenArray(m.allergens))
    );
  });
}

export function isValidMenuItemArray(data: unknown): data is MenuItem[] {
  if (!Array.isArray(data) || data.length === 0 || data.length > 500) return false;
  return data.every((raw) => {
    if (!raw || typeof raw !== 'object') return false;
    const item = raw as Record<string, unknown>;
    return (
      typeof item.id === 'string' &&
      item.id.trim().length > 0 &&
      item.id.length <= 128 &&
      typeof item.categoryId === 'string' &&
      item.categoryId.trim().length > 0 &&
      item.categoryId.length <= 128 &&
      typeof item.price === 'number' &&
      Number.isFinite(item.price) &&
      item.price > 0 &&
      item.price <= 10_000_000 &&
      typeof item.available === 'boolean' &&
      isValidLocalizedString(item.name) &&
      item.name.es.trim().length > 0 &&
      isValidLocalizedString(item.description) &&
      (item.imageUrl === undefined ||
        (typeof item.imageUrl === 'string' && isSafeImageUrl(item.imageUrl))) &&
      (item.dietary === undefined || isValidDietaryArray(item.dietary)) &&
      (item.allergens === undefined || isValidAllergenArray(item.allergens)) &&
      (item.modifiers === undefined || isValidModifierArray(item.modifiers))
    );
  });
}

export function isValidWeeklyDishArray(data: unknown): data is WeeklyDish[] {
  if (!Array.isArray(data) || data.length === 0 || data.length > 14) return false;
  return data.every((raw) => {
    if (!raw || typeof raw !== 'object') return false;
    const dish = raw as Record<string, unknown>;
    return (
      typeof dish.dayNumber === 'number' &&
      Number.isInteger(dish.dayNumber) &&
      dish.dayNumber >= 1 &&
      dish.dayNumber <= 7 &&
      isValidLocalizedString(dish.dayName) &&
      typeof dish.priceDineIn === 'number' &&
      Number.isFinite(dish.priceDineIn) &&
      dish.priceDineIn > 0 &&
      dish.priceDineIn <= 10_000_000 &&
      typeof dish.priceTakeAway === 'number' &&
      Number.isFinite(dish.priceTakeAway) &&
      dish.priceTakeAway > 0 &&
      dish.priceTakeAway <= 10_000_000 &&
      isValidLocalizedString(dish.title) &&
      dish.title.es.trim().length > 0 &&
      isValidLocalizedString(dish.description) &&
      typeof dish.imageUrl === 'string' &&
      isSafeImageUrl(dish.imageUrl) &&
      (dish.dietary === undefined || isValidDietaryArray(dish.dietary)) &&
      (dish.allergens === undefined || isValidAllergenArray(dish.allergens))
    );
  });
}

export function isValidStoreSettings(data: unknown): data is StoreSettings {
  if (!data || typeof data !== 'object') return false;
  const s = data as Record<string, unknown>;
  return (
    typeof s.whatsappNumber === 'string' &&
    /^\d{8,16}$/.test(s.whatsappNumber.replace(/\D/g, '')) &&
    typeof s.wifiSSID === 'string' &&
    s.wifiSSID.trim().length > 0 &&
    s.wifiSSID.length <= 64 &&
    typeof s.wifiPassword === 'string' &&
    s.wifiPassword.length <= 128 &&
    typeof s.groupMenuPricePerPerson === 'number' &&
    Number.isFinite(s.groupMenuPricePerPerson) &&
    s.groupMenuPricePerPerson > 0 &&
    s.groupMenuPricePerPerson <= 10_000_000
  );
}

export function validateSharedStatePayload(payload: unknown): DorearSharedState | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  if (
    !isValidMenuItemArray(data.items) ||
    !isValidWeeklyDishArray(data.weeklyDishes) ||
    !isValidStoreSettings(data.storeSettings)
  ) {
    return null;
  }

  const override =
    typeof data.weeklyOverrideDay === 'number' &&
    Number.isInteger(data.weeklyOverrideDay) &&
    data.weeklyOverrideDay >= 1 &&
    data.weeklyOverrideDay <= 5
      ? data.weeklyOverrideDay
      : null;

  return {
    version: CURRENT_STATE_VERSION,
    updatedAt:
      typeof data.updatedAt === 'number' && Number.isFinite(data.updatedAt) && data.updatedAt > 0
        ? data.updatedAt
        : Date.now(),
    items: data.items,
    weeklyDishes: data.weeklyDishes,
    weeklyOverrideDay: override,
    storeSettings: data.storeSettings,
  };
}
