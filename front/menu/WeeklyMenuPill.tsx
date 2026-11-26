import React, { useId, useState } from 'react';
import { DietaryTag, Language, WeeklyDish } from '../../db/types';
import { ChevronRight, X } from 'lucide-react';
import { DietaryIcons } from './DietaryIcons';
import { ModalDialog } from '../modals/ModalDialog';
import { getBuenosAiresNow } from '../utils/buenosAiresTime';
import { formatArsPrice, formatDishTitle } from '../utils/securityAndFormat';
import { trackWeeklySheetOpen } from '../utils/analytics';

interface WeeklyMenuPillProps {
  dishes: WeeklyDish[];
  currentLang: Language;
  onSelectDish: (dish: WeeklyDish) => void;
  overrideDay?: number | null;
  activeDietaryFilter?: DietaryTag | null;
}

const T = {
  titleCap: {
    es: 'Menú Ejecutivo del Mediodía',
    en: 'Executive Lunch Menu',
    pt: 'Menu Executivo do Almoço',
  },
  title: {
    es: 'Menú ejecutivo del mediodía',
    en: 'Executive lunch menu',
    pt: 'Menu executivo do almoço',
  },
  today: { es: 'Hoy', en: 'Today', pt: 'Hoje' },
  weekend: {
    es: 'Plato sugerido del finde',
    en: 'Weekend suggestion',
    pt: 'Prato sugerido do fim de semana',
  },
  days: { es: 'Lunes a viernes', en: 'Monday to Friday', pt: 'Segunda a sexta' },
  daysShort: { es: 'Lun a vie', en: 'Mon–Fri', pt: 'Seg a sex' },
  includes: {
    es: 'Incluye bebida y café a elección',
    en: 'Drink and coffee included',
    pt: 'Inclui bebida e café',
  },
  chef: {
    es: 'Sugerencias de la chef Mariela Martínez',
    en: "Chef Mariela Martínez's suggestions",
    pt: 'Sugestões da chef Mariela Martínez',
  },
  dineIn: { es: 'Salón', en: 'Dine in', pt: 'Salão' },
  takeAway: { es: 'Para llevar', en: 'Take away', pt: 'Para levar' },
  seeWeek: { es: 'Ver la semana', en: 'See the week', pt: 'Ver a semana' },
  close: { es: 'Cerrar', en: 'Close', pt: 'Fechar' },
};

export const WeeklyMenuPill: React.FC<WeeklyMenuPillProps> = ({
  dishes,
  currentLang,
  onSelectDish,
  overrideDay,
  activeDietaryFilter = null,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const titleId = useId();

  const calculatedDay =
    overrideDay !== undefined && overrideDay !== null
      ? overrideDay
      : getBuenosAiresNow().weekday;

  const isWeekend = calculatedDay === 0 || calculatedDay === 6;
  const todayDish = dishes.find((d) => d.dayNumber === calculatedDay) || dishes[0];
  if (!todayDish) return null;

  const lead = isWeekend
    ? T.weekend[currentLang]
    : `${T.today[currentLang]}, ${
        currentLang === 'en'
          ? todayDish.dayName.en
          : todayDish.dayName[currentLang].toLocaleLowerCase(currentLang)
      }`;

  const handlePickDish = (dish: WeeklyDish) => {
    setIsSheetOpen(false);
    onSelectDish(dish);
  };

  return (
    <section className="relative w-full max-w-xl mx-auto px-4 pb-3" aria-label={T.title[currentLang]}>
      <button
        type="button"
        onClick={() => {
          trackWeeklySheetOpen();
          setIsSheetOpen(true);
        }}
        aria-haspopup="dialog"
        className="weekly-card glass w-full rounded-[22px] overflow-hidden text-left transition-colors hover:border-wine/30"
      >
        {/* Encabezado: qué es, de quién y cuándo. Va sobre una franja más oscura
            (.weekly-card-head) para separarlo del plato del día. */}
        <span className="weekly-card-head flex items-start justify-between gap-3 px-3.5 pt-2 pb-1.5">
          <span className="min-w-0">
            <span className="block font-serif italic text-[1.05rem] leading-tight text-wine">
              {T.titleCap[currentLang]}
            </span>
            <span className="block font-serif italic text-[0.85rem] leading-tight text-gold-dark">
              {T.chef[currentLang]}
            </span>
          </span>
          <span className="shrink-0 mt-0.5 rounded-full border border-wine/25 bg-white/70 px-2 py-0.5 text-xs font-medium text-wine/90">
            {T.daysShort[currentLang]}
          </span>
        </span>

        {/* Plato de hoy */}
        {/* Dos columnas del mismo alto: arriba el día/plato y los precios; abajo, en la
            misma línea, "Incluye bebida…" y "Ver la semana". */}
        <span className="flex items-stretch gap-3 px-3.5 pt-2 pb-2">
          <span className="flex-1 min-w-0">
            <span className="liquid-wine inline-flex items-center rounded-full px-2 h-5 text-xs font-medium">
              {lead}
            </span>
            <span className="block font-serif text-[1.15rem] font-semibold leading-tight text-ink mt-1 line-clamp-2">
              {formatDishTitle(todayDish.title[currentLang])}
            </span>
            <span className="block text-[13px] text-muted leading-tight mt-0.5">{T.includes[currentLang]}</span>
          </span>
          <span className="shrink-0 flex flex-col items-end justify-between gap-1">
            <span className="flex flex-col items-end">
              <span className="font-sans text-base font-semibold text-wine tabular leading-tight">
                {formatArsPrice(todayDish.priceDineIn)}
              </span>
              {todayDish.priceTakeAway > 0 && (
                <span className="text-xs text-muted tabular leading-tight">
                  {T.takeAway[currentLang]} {formatArsPrice(todayDish.priceTakeAway)}
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[13px] font-medium text-gold-dark leading-tight">
              {T.seeWeek[currentLang]}
              <ChevronRight size={14} aria-hidden="true" className="-my-0.5" />
            </span>
          </span>
        </span>
      </button>

      <ModalDialog
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        ariaLabelledBy={titleId}
      >
        <div className="px-5 pt-3 pb-4 border-b border-line/70">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="font-serif text-[1.45rem] leading-tight text-ink">
                {T.title[currentLang]}
              </h2>
              <p className="text-sm text-muted mt-1">
                {T.days[currentLang]} · {T.includes[currentLang]}
              </p>
              <p className="font-serif italic text-base text-gold-dark mt-0.5">
                {T.chef[currentLang]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSheetOpen(false)}
              className="w-10 h-10 -mr-2 inline-flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-cream"
              aria-label={T.close[currentLang]}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <ul className="overflow-y-auto px-3 py-2">
          {dishes.map((dish) => {
            const isToday = !isWeekend && dish.dayNumber === calculatedDay;
            const matchesFilter =
              !activeDietaryFilter || Boolean(dish.dietary?.includes(activeDietaryFilter));
            return (
              <li key={dish.dayNumber}>
                <button
                  type="button"
                  onClick={() => handlePickDish(dish)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start justify-between gap-3 transition-colors ${
                    isToday ? 'bg-wine/[0.06] ring-1 ring-wine/25' : 'hover:bg-cream'
                  } ${matchesFilter ? '' : 'opacity-45'}`}
                >
                  <span className="min-w-0">
                    <span
                      className={`block text-sm ${
                        isToday ? 'text-wine font-semibold' : 'text-muted'
                      }`}
                    >
                      {dish.dayName[currentLang]}
                      {isToday && ` · ${T.today[currentLang]}`}
                    </span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-serif text-[1.05rem] leading-snug text-ink">
                        {formatDishTitle(dish.title[currentLang])}
                      </span>
                      {dish.dietary && dish.dietary.length > 0 && (
                        <DietaryIcons tags={dish.dietary} currentLang={currentLang} plain />
                      )}
                    </span>
                    <span className="block text-sm text-muted leading-snug mt-0.5 line-clamp-2">
                      {dish.description[currentLang]}
                    </span>
                  </span>
                  <span className="text-right shrink-0 pt-4">
                    <span className="block text-base font-semibold text-wine tabular">
                      {T.dineIn[currentLang]} {formatArsPrice(dish.priceDineIn)}
                    </span>
                    <span className="block text-sm text-muted tabular">
                      {T.takeAway[currentLang]} {formatArsPrice(dish.priceTakeAway)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </ModalDialog>
    </section>
  );
};
