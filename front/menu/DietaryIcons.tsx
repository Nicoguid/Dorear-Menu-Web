import React from 'react';
import { DietaryTag, Language, LocalizedString } from '../../db/types';
import { WheatOff, Leaf, MilkOff, LucideIcon } from 'lucide-react';

interface DietaryIconsProps {
  tags?: DietaryTag[];
  currentLang: Language;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  /** Íconos sueltos, sin círculo de color: para la lista, donde se repiten mucho. */
  plain?: boolean;
}

const DIETARY_META: Record<
  DietaryTag,
  {
    icon: LucideIcon;
    label: LocalizedString;
    detail: LocalizedString;
    containerClasses: string;
  }
> = {
  sin_tacc: {
    icon: WheatOff,
    label: {
      es: 'Sin TACC',
      en: 'Gluten-Free',
      pt: 'Sem Glúten',
    },
    detail: {
      es: 'Apto celíacos / Libre de gluten',
      en: 'Gluten-free recipe',
      pt: 'Livre de glúten',
    },
    containerClasses: 'bg-gold/15 text-gold-dark border-gold/40',
  },
  vegano: {
    icon: Leaf,
    label: {
      es: 'Vegano',
      en: 'Plant-Based',
      pt: 'Vegano',
    },
    detail: {
      es: '100% de origen vegetal',
      en: '100% plant-based',
      pt: '100% vegetal',
    },
    containerClasses: 'bg-emerald-900/10 text-emerald-800 border-emerald-800/30',
  },
  sin_lactosa: {
    icon: MilkOff,
    label: {
      es: 'Sin Lactosa',
      en: 'Dairy-Free',
      pt: 'Sem Lactose',
    },
    detail: {
      es: 'Sin leche ni derivados lácteos',
      en: 'Dairy-free recipe',
      pt: 'Sem leite ou derivados lácteos',
    },
    containerClasses: 'bg-wine/10 text-wine border-wine/30',
  },
};

const ICON_SIZES = { sm: 11, md: 12, lg: 14 };
const CIRCLE_SIZES = {
  sm: 'w-5 h-5',
  md: 'w-5 h-5 sm:w-5.5 sm:h-5.5',
  lg: 'w-6 h-6',
};

export const DietaryIcons: React.FC<DietaryIconsProps> = ({
  tags,
  currentLang,
  size = 'md',
  showLabels = false,
  plain = false,
}) => {
  if (!tags || tags.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 align-middle select-none">
      {tags.map((tag) => {
        const meta = DIETARY_META[tag];
        if (!meta) return null;
        const IconComponent = meta.icon;
        const localizedLabel = meta.label[currentLang];
        const localizedDetail = meta.detail[currentLang];

        if (plain) {
          return (
            <span
              key={tag}
              role="img"
              title={`${localizedLabel} (${localizedDetail})`}
              aria-label={localizedLabel}
              className="inline-flex text-muted/80"
            >
              <IconComponent size={15} strokeWidth={1.9} aria-hidden="true" />
            </span>
          );
        }

        if (showLabels) {
          return (
            <span
              key={tag}
              title={`${localizedLabel} · ${localizedDetail}`}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-sans font-medium ${meta.containerClasses}`}
            >
              <IconComponent size={ICON_SIZES[size]} strokeWidth={2.2} />
              <span>{localizedLabel}</span>
            </span>
          );
        }

        return (
          <span
            key={tag}
            title={`${localizedLabel} (${localizedDetail})`}
            aria-label={localizedLabel}
            className={`inline-flex items-center justify-center rounded-full border ${CIRCLE_SIZES[size]} ${meta.containerClasses}`}
          >
            <IconComponent size={ICON_SIZES[size]} strokeWidth={2.2} />
          </span>
        );
      })}
    </span>
  );
};
