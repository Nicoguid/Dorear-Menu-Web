import React, { useState } from 'react';
import { DietaryTag, Language, WeeklyDish } from '../../db/types';
import { ChevronDown, Utensils, ShoppingBag, ChefHat } from 'lucide-react';
import { DietaryIcons } from './DietaryIcons';
import { getBuenosAiresNow } from '../utils/buenosAiresTime';
import { formatArsPrice, formatDishTitle } from '../utils/securityAndFormat';
import { getOptimizedImageUrl } from '../utils/imageUrl';

interface WeeklyMenuPillProps {
  dishes: WeeklyDish[];
  currentLang: Language;
  onSelectDish: (dish: WeeklyDish) => void;
  overrideDay?: number | null;
  activeDietaryFilter?: DietaryTag | null;
}

export const WeeklyMenuPill: React.FC<WeeklyMenuPillProps> = ({
  dishes,
  currentLang,
  onSelectDish,
  overrideDay,
  activeDietaryFilter = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculatedDay =
    overrideDay !== undefined && overrideDay !== null
      ? overrideDay
      : getBuenosAiresNow().weekday;

  const isWeekend = calculatedDay === 0 || calculatedDay === 6;
  const todayDish = dishes.find((d) => d.dayNumber === calculatedDay) || dishes[0];

  return (
    <section className="w-full max-w-xl mx-auto px-4 my-3.5 select-none animate-fade-in" aria-label="Menú Ejecutivo Semanal">
      <div className="bg-gradient-to-b from-paper to-cream/90 rounded-3xl border-2 border-gold/35 shadow-soft overflow-hidden transition-all duration-300 relative">
        <div className="bg-wine text-white px-4 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-medium tracking-wide min-w-0">
            <ChefHat size={15} className="text-gold-light shrink-0" />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 leading-tight">
              <span className="font-serif italic text-sm tracking-normal">
                {currentLang === 'es' && 'Menú Ejecutivo del Mediodía'}
                {currentLang === 'en' && 'Executive Lunch Special'}
                {currentLang === 'pt' && 'Menu Executivo do Almoço'}
              </span>
              <span className="text-[11px] font-sans font-normal text-gold-light/95">
                {currentLang === 'es' && 'Sugerencias de la chef: Mariela Martínez'}
                {currentLang === 'en' && "Chef's suggestions: Mariela Martínez"}
                {currentLang === 'pt' && 'Sugestões da chef: Mariela Martínez'}
              </span>
            </div>
          </div>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-gold-light shrink-0">
            {currentLang === 'es' && 'Lunes a Viernes'}
            {currentLang === 'en' && 'Mon to Fri'}
            {currentLang === 'pt' && 'Seg a Sex'}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] uppercase font-sans font-bold tracking-wider px-2.5 py-1 rounded-full bg-gold/20 text-gold-dark border border-gold/30">
                {isWeekend
                  ? currentLang === 'es'
                    ? 'Plato Sugerido del Finde'
                    : currentLang === 'en'
                    ? 'Weekend Highlight'
                    : 'Prato do Fim de Semana'
                  : `${currentLang === 'es' ? 'Plato de Hoy' : currentLang === 'en' ? "Today's Dish" : 'Prato de Hoje'} · ${todayDish.dayName[currentLang]}`}
              </span>

              {todayDish.dietary && todayDish.dietary.length > 0 && (
                <DietaryIcons tags={todayDish.dietary} currentLang={currentLang} size="sm" />
              )}
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="text-xs text-muted font-sans">
                {currentLang === 'es' && 'Salón:'}
                {currentLang === 'en' && 'Dine In:'}
                {currentLang === 'pt' && 'Salão:'}
              </span>
              <span className="font-serif text-2xl font-bold text-wine tracking-tight">
                {formatArsPrice(todayDish.priceDineIn)}
              </span>
              <span className="text-[11px] text-muted font-medium bg-cream px-2 py-0.5 rounded-md border border-line">
                Take Away: {formatArsPrice(todayDish.priceTakeAway)}
              </span>
            </div>
          </div>

          <div
            onClick={() => onSelectDish(todayDish)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectDish(todayDish);
              }
            }}
            className="group flex items-center gap-3.5 bg-paper/90 hover:bg-paper p-2.5 rounded-2xl border border-line/80 hover:border-gold/60 cursor-pointer transition-all shadow-2xs"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-cream shrink-0 border border-line/60 relative">
              <img
                src={getOptimizedImageUrl(todayDish.imageUrl, 160, 80)}
                width={80}
                height={80}
                decoding="async"
                alt={todayDish.title[currentLang]}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h3 className="font-serif text-lg sm:text-xl font-medium text-ink leading-snug group-hover:text-wine transition-colors">
                {formatDishTitle(todayDish.title[currentLang])}
              </h3>
              <p className="text-xs text-muted leading-relaxed line-clamp-2 mt-0.5">
                {todayDish.description[currentLang]}
              </p>
              <span className="inline-block text-[11px] font-sans font-medium text-gold hover:underline mt-1">
                {currentLang === 'es' && 'Ver detalle & bebida incluida ↗'}
                {currentLang === 'en' && 'View details & included drink ↗'}
                {currentLang === 'pt' && 'Ver detalhes e bebida inclusa ↗'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-line/70 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-sans font-semibold text-wine flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
              {currentLang === 'es' && 'Incluye bebida y café a elección'}
              {currentLang === 'en' && 'Includes choice of drink and coffee'}
              {currentLang === 'pt' && 'Inclui bebida e café à escolha'}
            </span>

            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream hover:bg-paper text-wine text-xs font-semibold border border-line/80 hover:border-wine transition-all"
            >
              <span>
                {isExpanded
                  ? currentLang === 'es'
                    ? 'Ocultar otros días'
                    : currentLang === 'en'
                    ? 'Hide full week'
                    : 'Ocultar outros dias'
                  : currentLang === 'es'
                  ? 'Ver la carta de toda la semana'
                  : currentLang === 'en'
                  ? 'View full week menu'
                  : 'Ver cardápio da semana'}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 text-gold ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-line p-4 bg-cream/40 space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-muted pb-1 border-b border-line/60">
              <span className="font-serif italic text-gold-dark font-medium text-sm">
                {currentLang === 'es' && 'Nuestros 5 Platos Caseros de la Semana'}
                {currentLang === 'en' && 'Our 5 Homemade Weekly Specials'}
                {currentLang === 'pt' && 'Nossos 5 Pratos Caseiros da Semana'}
              </span>
              <span className="text-[11px]">
                {currentLang === 'es' && 'Tocá cualquier plato para ordenar'}
                {currentLang === 'en' && 'Tap any dish to inspect'}
                {currentLang === 'pt' && 'Toque para detalhes'}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {dishes.map((dish) => {
                const isToday = !isWeekend && dish.dayNumber === calculatedDay;
                const matchesFilter =
                  !activeDietaryFilter || Boolean(dish.dietary?.includes(activeDietaryFilter));

                return (
                  <button
                    key={dish.dayNumber}
                    type="button"
                    onClick={() => onSelectDish(dish)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isToday
                        ? 'bg-paper border-wine ring-1 ring-wine/30 shadow-xs'
                        : 'bg-paper/80 border-line hover:border-gold/60 hover:bg-paper'
                    } ${!matchesFilter ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream shrink-0 border border-line">
                        <img
                          src={getOptimizedImageUrl(dish.imageUrl, 140, 75)}
                          width={56}
                          height={56}
                          decoding="async"
                          loading="lazy"
                          alt={dish.title[currentLang]}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded-full ${
                              isToday
                                ? 'bg-wine text-white'
                                : 'bg-cream text-muted border border-line'
                            }`}
                          >
                            {dish.dayName[currentLang]}
                          </span>
                          <h4 className="font-serif text-base font-medium text-ink truncate">
                            {formatDishTitle(dish.title[currentLang])}
                          </h4>
                          {dish.dietary && dish.dietary.length > 0 && (
                            <DietaryIcons
                              tags={dish.dietary}
                              currentLang={currentLang}
                              size="sm"
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted truncate mt-0.5">
                          {dish.description[currentLang]}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1 text-sm font-bold text-wine">
                        <Utensils size={11} className="text-gold" />
                        <span>{formatArsPrice(dish.priceDineIn)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[11px] text-muted font-medium">
                        <ShoppingBag size={11} className="text-muted" />
                        <span>Take Away: {formatArsPrice(dish.priceTakeAway)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
