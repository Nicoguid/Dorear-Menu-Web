import {
  AllergenTag,
  DietaryTag,
  Language,
  LocalizedString,
  MenuItem,
  ProductModifier,
} from '../../db/types';
import { isSafeImageUrl } from '../../db/stateValidation';

export { isSafeImageUrl };

export function formatArsPrice(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatSignedPriceDelta(delta: number, lang: Language = 'es'): string {
  if (delta === 0) {
    return lang === 'es' ? 'Sin cargo' : lang === 'en' ? 'No extra charge' : 'Sem custo';
  }
  const absFormatted = formatArsPrice(Math.abs(delta));
  return delta > 0 ? `+${absFormatted}` : `-${absFormatted}`;
}

export function parseArsPrice(rawInput: string): number | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  let cleaned = trimmed.replace(/[$\s]/g, '');

  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  } else if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    const lastPart = parts[parts.length - 1];
    if (parts.length > 2 || lastPart.length === 3) {
      cleaned = cleaned.replace(/\./g, '');
    }
  }

  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    return null;
  }

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 10_000_000) {
    return null;
  }

  return Math.round(parsed);
}

export function sanitizeWhatsAppInput(input: string, maxLen = 160): string {
  return input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function openWhatsAppChat(whatsappNumber: string, message: string): void {
  const rawDigits = whatsappNumber.replace(/\D/g, '');
  const normalizedNumber =
    rawDigits.length === 10 && !rawDigits.startsWith('54')
      ? `549${rawDigits}`
      : rawDigits;
  const url = `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function formatDishTitle(rawTitle: string): string {
  const trimmed = rawTitle.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  return trimmed
    .toLocaleLowerCase('es-AR')
    .replace(/(^|[\s(/\-"¿¡])(\p{L})/gu, (_match, prefix: string, letter: string) =>
      `${prefix}${letter.toLocaleUpperCase('es-AR')}`
    );
}

export function buildLocalizedString(
  esInput: string,
  previous?: LocalizedString,
  enInput?: string,
  ptInput?: string
): LocalizedString {
  const cleanEs = esInput.trim();
  const cleanEn = enInput !== undefined ? enInput.trim() : '';
  const cleanPt = ptInput !== undefined ? ptInput.trim() : '';

  const esChanged = previous ? previous.es.trim() !== cleanEs : true;
  const enUnchangedFromPrev = previous ? cleanEn === previous.en.trim() : false;
  const ptUnchangedFromPrev = previous ? cleanPt === previous.pt.trim() : false;

  return {
    es: cleanEs,
    en:
      cleanEn && !(esChanged && enUnchangedFromPrev)
        ? cleanEn
        : !esChanged && previous?.en
        ? previous.en
        : cleanEs,
    pt:
      cleanPt && !(esChanged && ptUnchangedFromPrev)
        ? cleanPt
        : !esChanged && previous?.pt
        ? previous.pt
        : cleanEs,
  };
}

export interface DietaryEvaluationResult {
  effectiveDietary: DietaryTag[];
  invalidatedTags: DietaryTag[];
  activeAllergens: AllergenTag[];
  conflictsWithActiveFilter: boolean;
  warnings: LocalizedString[];
}

export function evaluateDishDietarySafety(
  item: MenuItem,
  selectedModifierIds: string[],
  activeDietaryFilter: DietaryTag | null
): DietaryEvaluationResult {
  const baseDietary = item.dietary || [];
  const invalidated = new Set<DietaryTag>();
  const allergens = new Set<AllergenTag>(item.allergens || []);
  const warnings: LocalizedString[] = [];

  const selectedMods: ProductModifier[] = (item.modifiers || []).filter((m) =>
    selectedModifierIds.includes(m.id)
  );

  for (const mod of selectedMods) {
    if (mod.allergens) {
      mod.allergens.forEach((a) => allergens.add(a));
    }
    if (mod.invalidatesDietary) {
      for (const tag of mod.invalidatesDietary) {
        invalidated.add(tag);

        if (
          tag === 'sin_tacc' &&
          (baseDietary.includes('sin_tacc') || activeDietaryFilter === 'sin_tacc')
        ) {
          warnings.push({
            es: `Atención: "${mod.name.es}" contiene avena (TACC) y NO es apta para celíacos (Ley 26.588).`,
            en: `Notice: "${mod.name.en}" contains oats (gluten/TACC) and is not suitable for celiacs.`,
            pt: `Atenção: "${mod.name.pt}" contém aveia (TACC/glúten) e não é apto para celíacos.`,
          });
        }
        if (
          tag === 'vegano' &&
          (baseDietary.includes('vegano') || activeDietaryFilter === 'vegano')
        ) {
          warnings.push({
            es: `Atención: "${mod.name.es}" contiene derivados lácteos y anula la condición Vegano.`,
            en: `Notice: "${mod.name.en}" contains dairy derivatives and is not vegan.`,
            pt: `Atenção: "${mod.name.pt}" contém derivados lácteos e não é vegano.`,
          });
        }
        if (
          tag === 'sin_lactosa' &&
          (baseDietary.includes('sin_lactosa') || activeDietaryFilter === 'sin_lactosa')
        ) {
          warnings.push({
            es: `Atención: "${mod.name.es}" contiene derivados lácteos (suero/lactosa).`,
            en: `Notice: "${mod.name.en}" contains dairy protein/lactose.`,
            pt: `Atenção: "${mod.name.pt}" contém proteína láctea/lactose.`,
          });
        }
      }
    }
  }

  const effectiveDietary = baseDietary.filter((tag) => !invalidated.has(tag));
  const conflictsWithActiveFilter =
    activeDietaryFilter !== null && !effectiveDietary.includes(activeDietaryFilter);

  return {
    effectiveDietary,
    invalidatedTags: Array.from(invalidated),
    activeAllergens: Array.from(allergens),
    conflictsWithActiveFilter,
    warnings,
  };
}
