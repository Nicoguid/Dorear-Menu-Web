import React, { useState, useId } from 'react';
import { AllergenTag, DietaryTag, Language, WeeklyDish } from '../../db/types';
import { Globe, X } from 'lucide-react';
import { ModalDialog } from '../modals/ModalDialog';
import {
  buildLocalizedString,
  isSafeImageUrl,
  parseArsPrice,
} from '../utils/securityAndFormat';
import { LanguageTabs } from './ItemFormModal';

interface WeeklyDishFormModalProps {
  dish: WeeklyDish;
  onClose: () => void;
  onSave: (updatedDish: WeeklyDish) => void;
}

export const WeeklyDishFormModal: React.FC<WeeklyDishFormModalProps> = ({
  dish,
  onClose,
  onSave,
}) => {
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<Language>('es');

  const [titles, setTitles] = useState<Record<Language, string>>({
    es: dish.title.es,
    en: dish.title.en,
    pt: dish.title.pt,
  });
  const [descs, setDescs] = useState<Record<Language, string>>({
    es: dish.description.es,
    en: dish.description.en,
    pt: dish.description.pt,
  });

  const [priceDineIn, setPriceDineIn] = useState(dish.priceDineIn.toString());
  const [priceTakeAway, setPriceTakeAway] = useState(dish.priceTakeAway.toString());
  const [imageUrl, setImageUrl] = useState(dish.imageUrl);

  const [isSinTacc, setIsSinTacc] = useState(dish.dietary?.includes('sin_tacc') || false);
  const [isVegano, setIsVegano] = useState(dish.dietary?.includes('vegano') || false);
  const [isSinLactosa, setIsSinLactosa] = useState(
    dish.dietary?.includes('sin_lactosa') || false
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dineIn = parseArsPrice(priceDineIn);
    const takeAway = parseArsPrice(priceTakeAway);

    if (!titles.es.trim()) {
      setActiveTab('es');
      setFormError('Ingresá el título del plato en Español.');
      return;
    }
    if (dineIn === null || takeAway === null) {
      setFormError('Los precios de Salón y Take Away deben ser válidos y mayores a $0.');
      return;
    }
    if (!isSafeImageUrl(imageUrl)) {
      setFormError('La URL de la foto debe comenzar con https://.');
      return;
    }

    const dietary: DietaryTag[] = [];
    if (isSinTacc) dietary.push('sin_tacc');
    if (isVegano) dietary.push('vegano');
    if (isSinLactosa) dietary.push('sin_lactosa');

    const allergensSet = new Set<AllergenTag>(dish.allergens || []);
    if (isSinTacc) {
      allergensSet.delete('tacc');
    } else {
      allergensSet.add('tacc');
    }
    if (isSinLactosa) {
      allergensSet.delete('lacteos');
    }
    if (isVegano) {
      allergensSet.delete('lacteos');
      allergensSet.delete('huevo');
    }

    onSave({
      ...dish,
      title: buildLocalizedString(titles.es, dish.title, titles.en, titles.pt),
      description: buildLocalizedString(descs.es, dish.description, descs.en, descs.pt),
      priceDineIn: dineIn,
      priceTakeAway: takeAway,
      imageUrl: imageUrl.trim() || dish.imageUrl,
      dietary,
      allergens: Array.from(allergensSet),
    });
  };

  const titleLabels: Record<Language, string> = {
    es: 'Plato del día (Español) *',
    en: 'Dish of the Day (English — opcional)',
    pt: 'Prato do Dia (Português — opcional)',
  };

  const descLabels: Record<Language, string> = {
    es: 'Descripción / Opciones (Español)',
    en: 'Description (English)',
    pt: 'Descrição (Português)',
  };

  return (
    <ModalDialog
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy={titleId}
      backdropClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      panelClassName="w-full max-w-md bg-paper rounded-3xl border border-line p-5 shadow-modal max-h-[90vh] overflow-y-auto"
    >
      <div className="flex justify-between items-center pb-3 border-b border-line mb-3">
        <h3 id={titleId} className="font-serif text-xl font-medium text-ink">
          Editar Menú del {dish.dayName.es}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center text-muted hover:text-ink rounded-full"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted flex items-center gap-1">
              <Globe size={12} className="text-gold" />
              <span>Idioma del plato del día:</span>
            </span>
            <span className="text-[10px] text-muted">Fallback inteligente activo</span>
          </div>
          <LanguageTabs activeLang={activeTab} onSelectLang={setActiveTab} />
        </div>

        <div className="space-y-3 animate-fade-in">
          <div>
            <label className="block text-muted font-medium mb-1">
              {titleLabels[activeTab]}
            </label>
            <input
              type="text"
              required={activeTab === 'es'}
              value={titles[activeTab]}
              onChange={(e) => setTitles({ ...titles, [activeTab]: e.target.value })}
              placeholder={titles.es || 'Ej: Risotto milanés con azafrán'}
              className="w-full min-h-[38px] bg-cream border border-line rounded-xl px-3 py-2 text-ink focus:border-wine focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">
              {descLabels[activeTab]}
            </label>
            <textarea
              rows={2}
              value={descs[activeTab]}
              onChange={(e) => setDescs({ ...descs, [activeTab]: e.target.value })}
              placeholder={descs.es || 'Ej: Malfatti · Ravioli · Canelones...'}
              className="w-full bg-cream border border-line rounded-xl px-3 py-2 text-ink focus:border-wine focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">Precio Salón ($) *</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={priceDineIn}
              onChange={(e) => setPriceDineIn(e.target.value)}
              className="w-full min-h-[38px] bg-cream border border-line rounded-xl px-3 py-2 text-ink font-semibold focus:border-wine focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Precio Take Away ($) *</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={priceTakeAway}
              onChange={(e) => setPriceTakeAway(e.target.value)}
              className="w-full min-h-[38px] bg-cream border border-line rounded-xl px-3 py-2 text-ink font-semibold focus:border-wine focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-muted font-medium mb-1">URL de la foto del plato</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full min-h-[38px] bg-cream border border-line rounded-xl px-3 py-2 text-ink focus:border-wine focus:outline-none"
          />
        </div>

        <div className="pt-2 border-t border-line/60">
          <span className="block text-muted font-medium mb-2">Etiquetas dietarias:</span>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isSinTacc}
                onChange={(e) => setIsSinTacc(e.target.checked)}
                className="rounded text-wine focus:ring-wine"
              />
              <span>Sin TACC</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isVegano}
                onChange={(e) => setIsVegano(e.target.checked)}
                className="rounded text-wine focus:ring-wine"
              />
              <span>Vegano</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isSinLactosa}
                onChange={(e) => setIsSinLactosa(e.target.checked)}
                className="rounded text-wine focus:ring-wine"
              />
              <span>Sin Lactosa</span>
            </label>
          </div>
        </div>

        {formError && (
          <div role="alert" className="p-2.5 rounded-xl bg-wine/10 text-wine font-medium">
            {formError}
          </div>
        )}

        <div className="pt-3 border-t border-line flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-4 py-2 rounded-xl border border-line text-muted hover:text-ink"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="min-h-[38px] px-5 py-2 rounded-xl bg-wine hover:bg-wine-dark text-white font-medium shadow-xs"
          >
            Guardar Día
          </button>
        </div>
      </form>
    </ModalDialog>
  );
};
