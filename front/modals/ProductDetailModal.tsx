import React, { useState, useEffect, useId } from 'react';
import { getFixedUsdPrice } from '../../db/fixedPrices';
import { DietaryTag, Language, MenuItem, ProductModifier } from '../../db/types';
import { X, Check, AlertTriangle } from 'lucide-react';
import { DietaryIcons } from '../menu/DietaryIcons';
import { ModalDialog } from './ModalDialog';
import {
  evaluateDishDietarySafety,
  formatArsPrice,
  formatUsdPrice,
  formatDishTitle,
  formatSignedPriceDelta,
} from '../utils/securityAndFormat';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '../utils/imageUrl';

interface ProductDetailModalProps {
  item: MenuItem | null;
  currentLang: Language;
  activeDietaryFilter?: DietaryTag | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  currentLang,
  activeDietaryFilter = null,
  onClose,
}) => {
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [imgFailed, setImgFailed] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setSelectedModifiers([]);
    setImgFailed(false);
  }, [item?.id]);

  if (!item) return null;

  // Obras de arte: precio fijo en dólares definido en db/fixedPrices.ts.
  const fixedUsd = getFixedUsdPrice(item);

  const toggleModifier = (modId: string) => {
    setSelectedModifiers((prev) => (prev.includes(modId) ? [] : [modId]));
  };

  const calculateTotalPrice = () => {
    let total = item.price;
    if (item.modifiers) {
      item.modifiers.forEach((m) => {
        if (selectedModifiers.includes(m.id)) {
          total += m.price;
        }
      });
    }
    return Math.max(0, total);
  };

  const safety = evaluateDishDietarySafety(item, selectedModifiers, activeDietaryFilter);
  const hasTreeNuts = safety.activeAllergens.includes('frutos_secos');
  const isWeeklyDish = item.categoryId === 'weekly';

  const optimizedSrc = getOptimizedImageUrl(item.imageUrl, 720, 80);
  const responsiveSrcSet = getResponsiveImageSrcSet(item.imageUrl);
  const closeAriaLabel =
    currentLang === 'es'
      ? 'Cerrar detalle'
      : currentLang === 'en'
      ? 'Close detail'
      : 'Fechar detalhe';

  return (
    <ModalDialog isOpen={Boolean(item)} onClose={onClose} ariaLabelledBy={titleId}>
      {item.imageUrl && !imgFailed ? (
        <div className="relative w-full aspect-[4/3] max-h-72 bg-cream shrink-0 overflow-hidden">
          <img
            src={optimizedSrc}
            srcSet={responsiveSrcSet}
            sizes="(max-width: 640px) 100vw, 448px"
            width={720}
            height={480}
            decoding="async"
            onError={() => setImgFailed(true)}
            alt={item.name[currentLang]}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" aria-hidden="true" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-11 h-11 inline-flex items-center justify-center bg-white/30 hover:bg-white/45 border border-white/50 text-white rounded-full backdrop-blur-md transition-colors"
            aria-label={closeAriaLabel}
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div className="p-4 border-b border-line flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 -m-2 inline-flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-cream"
            aria-label={closeAriaLabel}
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="p-5 pb-7 overflow-y-auto flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id={titleId}
              className="font-serif text-[2rem] text-ink font-medium leading-tight"
            >
              {formatDishTitle(item.name[currentLang])}
            </h2>

            {safety.effectiveDietary.length > 0 && (
              <div className="mt-2.5">
                <DietaryIcons
                  tags={safety.effectiveDietary}
                  currentLang={currentLang}
                  size="md"
                  showLabels={true}
                />
              </div>
            )}

            {hasTreeNuts && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/10 text-gold-dark border border-gold/30 text-sm font-sans font-medium">
                <AlertTriangle size={11} />
                <span>
                  {currentLang === 'es' && 'Contiene frutos secos (nueces / almendras)'}
                  {currentLang === 'en' && 'Contains tree nuts (walnuts / pecans / almonds)'}
                  {currentLang === 'pt' && 'Contém castanhas / nozes / amêndoas'}
                </span>
              </div>
            )}
          </div>

          <div className="text-right shrink-0">
            <span className="font-sans text-xl font-semibold text-gold-dark tabular">
              {fixedUsd ? formatUsdPrice(fixedUsd) : formatArsPrice(calculateTotalPrice())}
            </span>
            {!item.available && (
              <div className="text-sm font-semibold text-wine mt-0.5">
                {currentLang === 'es' && 'Agotado'}
                {currentLang === 'en' && 'Sold out'}
                {currentLang === 'pt' && 'Esgotado'}
              </div>
            )}
          </div>
        </div>

        {safety.warnings.length > 0 && (
          <div
            role="alert"
            className="mt-3.5 p-3 rounded-xl bg-wine/10 border border-wine/30 text-wine text-sm space-y-1"
          >
            {safety.warnings.map((w, idx) => (
              <p key={idx} className="flex items-start gap-2 font-medium leading-snug">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{w[currentLang]}</span>
              </p>
            ))}
          </div>
        )}

        {item.description[currentLang] && (
          <p className="text-base text-muted leading-relaxed mt-4 pt-3.5 border-t border-line/60">
            {item.description[currentLang]}
          </p>
        )}

        {item.modifiers && item.modifiers.length > 0 && (
          <div className="mt-5 pt-4 border-t border-line">
            <span className="block text-sm font-medium text-ink mb-2.5">
              {isWeeklyDish ? (
                <>
                  {currentLang === 'es' && 'Modalidad'}
                  {currentLang === 'en' && 'Service'}
                  {currentLang === 'pt' && 'Modalidade'}
                </>
              ) : (
                <>
                  {currentLang === 'es' && 'Opciones y adicionales (elegí una)'}
                  {currentLang === 'en' && 'Options and extras (choose one)'}
                  {currentLang === 'pt' && 'Opções e adicionais (escolha uma)'}
                </>
              )}
            </span>

            <div className="space-y-2">
              {item.modifiers.map((mod: ProductModifier) => {
                const isChecked = selectedModifiers.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    aria-pressed={isChecked}
                    onClick={() => toggleModifier(mod.id)}
                    className={`w-full min-h-[48px] flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-base transition-colors text-left ${
                      isChecked
                        ? 'bg-wine/5 border-wine text-wine font-medium'
                        : 'bg-cream/60 border-line text-muted hover:border-gold/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border ${
                          isChecked
                            ? 'bg-wine text-white border-wine'
                            : 'border-muted/40 bg-white'
                        }`}
                      >
                        {isChecked && <Check size={10} strokeWidth={3} />}
                      </div>
                      <span>{mod.name[currentLang]}</span>
                    </div>
                    <span
                      className={`font-semibold shrink-0 ${
                        mod.price < 0 ? 'text-emerald-700' : 'text-gold-dark'
                      }`}
                    >
                      {formatSignedPriceDelta(mod.price, currentLang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  );
};
