import React from 'react';
import { Language, MenuItem } from '../../db/types';
import { DietaryIcons } from './DietaryIcons';
import { formatArsPrice, formatDishTitle, formatUsdPrice } from '../utils/securityAndFormat';
import { getFixedUsdPrice } from '../../db/fixedPrices';

interface MenuItemCardProps {
  item: MenuItem;
  currentLang: Language;
  onOpenDetail: (item: MenuItem) => void;
}

const SOLD_OUT: Record<Language, string> = { es: 'Agotado', en: 'Sold out', pt: 'Esgotado' };

/**
 * Un plato de la carta. Semántica: <article> con su <h3>; dentro del título va un
 * <button> real que abre el detalle. Una capa invisible (after:inset-0) estira el
 * botón a toda la tarjeta, así se puede tocar en cualquier parte y el lector de
 * pantalla anuncia "Ristretto, botón" seguido de la descripción y el precio.
 */
export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, currentLang, onOpenDetail }) => {
  const formattedName = formatDishTitle(item.name[currentLang]);
  const description = item.description[currentLang];
  const fixedUsd = getFixedUsdPrice(item);

  return (
    <article
      className={`group relative py-3 border-b border-line/70 last:border-b-0 flex justify-between items-start gap-4 active:bg-paper hover:bg-paper/60 transition-colors px-5 -mx-5 focus-within:bg-paper/60 ${
        item.available ? '' : 'opacity-60'
      }`}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-[1.25rem] text-ink font-semibold leading-tight text-pretty">
          <button
            type="button"
            onClick={() => onOpenDetail(item)}
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-gold focus-visible:after:-outline-offset-2"
          >
            {formattedName}
          </button>
          {item.dietary && item.dietary.length > 0 && (
            <span className="ml-2 inline-flex align-[1px]">
              <DietaryIcons tags={item.dietary} currentLang={currentLang} plain />
            </span>
          )}
        </h3>

        {description && (
          <p className="text-[15px] text-muted leading-snug mt-0.5">{description}</p>
        )}
      </div>

      <div className="text-right shrink-0 pt-1">
        {item.available ? (
          <>
            <span className="block font-sans text-[15px] font-semibold text-gold-dark tabular whitespace-nowrap">
              {fixedUsd ? formatUsdPrice(fixedUsd) : formatArsPrice(item.price)}
            </span>
          </>
        ) : (
          <span className="inline-block text-[13px] font-semibold text-wine bg-wine/10 border border-wine/25 px-2 py-0.5 rounded-full whitespace-nowrap">
            {SOLD_OUT[currentLang]}
          </span>
        )}
      </div>
    </article>
  );
};
