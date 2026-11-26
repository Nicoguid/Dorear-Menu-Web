import React from 'react';
import { DietaryTag, Language } from '../../db/types';
import { WheatOff, Leaf, MilkOff, LucideIcon } from 'lucide-react';
import { useDragScroll } from '../layout/useDragScroll';

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
    iconColor: 'text-gold-dark',
    label: { es: 'Sin TACC', en: 'Gluten-free', pt: 'Sem glúten' },
  },
  {
    id: 'vegano',
    icon: Leaf,
    iconColor: 'text-emerald-800',
    label: { es: 'Vegano', en: 'Vegan', pt: 'Vegano' },
  },
  {
    id: 'sin_lactosa',
    icon: MilkOff,
    iconColor: 'text-wine',
    label: { es: 'Sin lactosa', en: 'Dairy-free', pt: 'Sem lactose' },
  },
];

export const DietaryFilters: React.FC<DietaryFiltersProps> = ({
  currentLang,
  activeFilter,
  onSelectFilter,
}) => {
  // Misma fila deslizable que las categorías (dedo, mouse y ruedita, sin mover la página).
  const { ref, wasDrag, handlers } = useDragScroll<HTMLDivElement>();
  return (
    <div className="w-full px-4">
      <div
        role="group"
        aria-label={
          currentLang === 'es'
            ? 'Filtros dietarios'
            : currentLang === 'en'
            ? 'Dietary filters'
            : 'Filtros alimentares'
        }
        ref={ref}
        {...handlers}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 -my-1.5 -mx-4 px-4 select-none"
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
              onClick={() => {
                if (!wasDrag()) onSelectFilter(f.id);
              }}
              className={`shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[13px] font-sans ${
                isSelected ? 'liquid-ink font-medium' : 'liquid text-muted hover:text-ink'
              }`}
            >
              {IconComponent && (
                <IconComponent
                  size={13}
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
