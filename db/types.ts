export type Language = 'es' | 'en' | 'pt';

export type DietaryTag = 'sin_tacc' | 'vegano' | 'sin_lactosa';

export type AllergenTag = 'tacc' | 'lacteos' | 'frutos_secos' | 'huevo';

export interface LocalizedString {
  es: string;
  en: string;
  pt: string;
}

export interface ProductModifier {
  id: string;
  name: LocalizedString;
  price: number;
  invalidatesDietary?: DietaryTag[];
  allergens?: AllergenTag[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number;
  available: boolean;
  imageUrl?: string;
  dietary?: DietaryTag[];
  allergens?: AllergenTag[];
  modifiers?: ProductModifier[];
}

export interface MenuCategory {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  order: number;
}

export interface WeeklyDish {
  dayName: LocalizedString;
  dayNumber: number; // 1 = Lunes ... 5 = Viernes
  title: LocalizedString;
  description: LocalizedString;
  imageUrl: string;
  priceDineIn: number;
  priceTakeAway: number;
  dietary?: DietaryTag[];
  allergens?: AllergenTag[];
}

export interface StoreSettings {
  whatsappNumber: string;
  wifiSSID: string;
  wifiPassword: string;
  groupMenuPricePerPerson: number;
}
