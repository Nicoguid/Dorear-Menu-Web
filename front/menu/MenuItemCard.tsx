import React from 'react';
import { Language, MenuItem } from '../../db/types';
import { DietaryIcons } from './DietaryIcons';
import { formatArsPrice } from '../utils/securityAndFormat';

interface MenuItemCardProps {
  item: MenuItem;
  currentLang: Language;
  onOpenDetail: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  currentLang,
  onOpenDetail,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenDetail(item);
    }
  };

  const soldOutLabel =
    currentLang === 'es' ? 'Agotado' : currentLang === 'en' ? 'Sold Out' : 'Esgotado';
  const statusLabel = item.available ? formatArsPrice(item.price) : soldOutLabel;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${item.name[currentLang]} · ${statusLabel}`}
      onClick={() => onOpenDetail(item)}
      onKeyDown={handleKeyDown}
      className="group min-h-[48px] py-4 border-b border-line/70 flex justify-between items-start gap-4 cursor-pointer hover:bg-paper/40 transition-colors px-2 rounded-xl -mx-2"
    >
      <div className="flex-1 min-w-0 pr-1">
        <h3 className="font-serif text-2xl sm:text-3xl text-ink font-medium leading-snug group-hover:text-gold transition-colors inline-flex items-center gap-2 flex-wrap">
          <span>{item.name[currentLang]}</span>
          {item.dietary && item.dietary.length > 0 && (
            <DietaryIcons tags={item.dietary} currentLang={currentLang} size="md" />
          )}
        </h3>

        {item.description[currentLang] && (
          <p className="text-sm sm:text-base text-muted leading-relaxed mt-1">
            {item.description[currentLang]}
          </p>
        )}
      </div>

      <div className="text-right shrink-0 pt-0.5">
        {item.available ? (
          <span className="font-sans text-base sm:text-lg font-bold text-gold tracking-tight whitespace-nowrap">
            {formatArsPrice(item.price)}
          </span>
        ) : (
          <span className="inline-block text-xs font-semibold text-wine bg-wine/10 border border-wine/30 px-2.5 py-1 rounded-full whitespace-nowrap">
            {soldOutLabel}
          </span>
        )}
      </div>
    </article>
  );
};
