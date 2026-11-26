import { Language, LocalizedString } from '../../db/types';

/** "Café con LECHE" → "cafe con leche": sin tildes ni mayúsculas, para comparar. */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Coincide si TODAS las palabras buscadas aparecen en el nombre o la descripción
 * (en el idioma elegido o en castellano, porque mucha gente busca "medialuna" aunque
 * tenga la carta en inglés). Así "torta chocolate" encuentra "Torta de chocolate y nuez".
 */
export function matchesSearch(
  query: string,
  lang: Language,
  ...fields: (LocalizedString | undefined)[]
): boolean {
  // Plural simple: "pastas" → "pasta", "budines" → "budin", "tortas" → "tort".
  const words = normalizeForSearch(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length > 4 ? w.replace(/(es|s)$/, '') : w));
  if (words.length === 0) return true;
  const haystack = normalizeForSearch(
    fields
      .filter((f): f is LocalizedString => Boolean(f))
      .map((f) => `${f[lang] || ''} ${f.es || ''}`)
      .join(' ')
  );
  return words.every((w) => haystack.includes(w));
}
