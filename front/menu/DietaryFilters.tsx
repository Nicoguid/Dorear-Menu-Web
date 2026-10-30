import React from 'react';
import { DietaryTag, Language } from '../../db/types';
import { WheatOff, Leaf, MilkOff, LucideIcon } from 'lucide-react';

interface DietaryFiltersProps {
  currentLang: Language;
  activeFilter: DietaryTag | null;
  onSelectFilter: (tag: DietaryTag | null) => void;
}

const FILTERS: {
  id: DietaryTag | null;
  icon?: LucideIcon;
  iconColor?: string;
  label: Record<Language, string>;
}[] = [
  {
    id: null,
    label: { es: 'Todos', en: 'All', pt: 'Todos' },
  },
  {
    id: 'sin_tacc',
    icon: WheatOff,
    iconColor: 'text-gold',
    label: { es: 'Sin TACC', en: 'Gluten-Free', pt: 'Sem Glúten' },
  },
  {
    id: 'vegano',
    icon: Leaf,
    iconColor: 'text-emerald-800',
    label: { es: 'Vegano', en: 'Plant-Based', pt: 'Vegano' },
  },
  {
    id: 'sin_lactosa',
    icon: MilkOff,
    iconColor: 'text-wine',
    label: { es: 'Sin Lactosa', en: 'Dairy-Free', pt: 'Sem Lactose' },
  },
];

export const DietaryFilters: React.FC<DietaryFiltersProps> = ({
  currentLang,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 my-2">
      <div
        role="group"
        aria-label={
          currentLang === 'es'
            ? 'Filtros dietarios'
            : currentLang === 'en'
            ? 'Dietary filters'
            : 'Filtros alimentares'
        }
        onWheel={(e) => {
          if (e.deltaY !== 0 && e.deltaX === 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {FILTERS.map((f) => {
          const isSelected = activeFilter === f.id;
          const IconComponent = f.icon;
          return (
            <button
              key={f.id || 'all'}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectFilter(f.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-sans transition-all border ${
                isSelected
                  ? 'bg-ink text-cream border-ink font-medium shadow-2xs'
                  : 'bg-paper text-muted border-line hover:border-gold/60 hover:text-ink'
              }`}
            >
              {IconComponent && (
                <IconComponent
                  size={11}
                  strokeWidth={2.2}
                  className={isSelected ? 'text-cream' : f.iconColor}
                />
              )}
              <span>{f.label[currentLang]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
