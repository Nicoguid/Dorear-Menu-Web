import type { Language, MenuCategory } from './types';

/** "Tortas y Budines" → "tortas-y-budines". Se usa en ?cat= para enlazar una categoría. */
export function categorySlug(category: MenuCategory): string {
  return category.name.es
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 48);
}

/** Ruta de cada idioma: / (español), /en/ y /pt/. */
export const LANGUAGE_PATHS: Record<Language, string> = { es: '/', en: '/en/', pt: '/pt/' };

export function languageFromPath(pathname: string): Language | null {
  if (/^\/en(\/|$)/.test(pathname)) return 'en';
  if (/^\/pt(\/|$)/.test(pathname)) return 'pt';
  return null;
}
