import React, { useState, useId } from 'react';
import {
  AllergenTag,
  DietaryTag,
  Language,
  MenuCategory,
  MenuItem,
} from '../../db/types';
import { Globe, X } from 'lucide-react';
import { ModalDialog } from '../modals/ModalDialog';
import {
  buildLocalizedString,
  isSafeImageUrl,
  parseArsPrice,
} from '../utils/securityAndFormat';

export interface LanguageTabsProps {
  activeLang: Language;
  onSelectLang: (lang: Language) => void;
}

const TABS: { id: Language; label: string }[] = [
  { id: 'es', label: '🇦🇷 Español (Base)' },
  { id: 'en', label: '🇺🇸 English' },
  { id: 'pt', label: '🇧🇷 Português' },
];

export const LanguageTabs: React.FC<LanguageTabsProps> = ({ activeLang, onSelectLang }) => (
  <div className="bg-cream/80 p-1 rounded-xl border border-line flex items-center gap-1">
    {TABS.map((tab) => {
      const isActive = activeLang === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          aria-pressed={isActive}
          onClick={() => onSelectLang(tab.id)}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
            isActive ? 'bg-wine text-white shadow-2xs' : 'text-muted hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

interface ItemFormModalProps {
  categories: MenuCategory[];
  initialCategory: string;
  item: MenuItem | null;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  categories,
  initialCategory,
  item,
  onClose,
  onSave,
}) => {
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<Language>('es');

  const [names, setNames] = useState<Record<Language, string>>({
    es: item?.name.es || '',
    en: item?.name.en || '',
    pt: item?.name.pt || '',
  });
  const [descs, setDescs] = useState<Record<Language, string>>({
    es: item?.description.es || '',
    en: item?.description.en || '',
    pt: item?.description.pt || '',
  });

  const [price, setPrice] = useState(item ? item.price.toString() : '');
  const [categoryId, setCategoryId] = useState(item ? item.categoryId : initialCategory);
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '');
  const [isAvailable, setIsAvailable] = useState(item?.available ?? true);

  const [isSinTacc, setIsSinTacc] = useState(item?.dietary?.includes('sin_tacc') || false);
  const [isVegano, setIsVegano] = useState(item?.dietary?.includes('vegano') || false);
  const [isSinLactosa, setIsSinLactosa] = useState(
    item?.dietary?.includes('sin_lactosa') || false
  );
  const [hasTreeNuts, setHasTreeNuts] = useState(
    item?.allergens?.includes('frutos_secos') || false
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrice = parseArsPrice(price);
    if (!names.es.trim()) {
      setActiveTab('es');
      setFormError('Por favor ingresá el nombre del plato en Español.');
      return;
    }
    if (cleanPrice === null) {
      setFormError('El precio debe ser un número válido mayor a $0 (ej. 6200 o 12.500).');
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

    const allergensSet = new Set<AllergenTag>(item?.allergens || []);
    if (hasTreeNuts) {
      allergensSet.add('frutos_secos');
    } else {
      allergensSet.delete('frutos_secos');
    }
    if (isSinTacc) allergensSet.delete('tacc');
    if (isSinLactosa) allergensSet.delete('lacteos');
    if (isVegano) {
      allergensSet.delete('lacteos');
      allergensSet.delete('huevo');
    }
    const allergens = Array.from(allergensSet);

    const defaultImg =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80';

    const generatedId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? `custom-${crypto.randomUUID()}`
        : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    onSave({
      id: item ? item.id : generatedId,
      categoryId,
      name: buildLocalizedString(names.es, item?.name, names.en, names.pt),
      description: buildLocalizedString(descs.es, item?.description, descs.en, descs.pt),
      price: cleanPrice,
      available: isAvailable,
      imageUrl: defaultImg,
      dietary: dietary.length ? dietary : undefined,
      allergens: allergens.length ? allergens : undefined,
      modifiers: item?.modifiers,
    });
  };

  const nameLabels: Record<Language, string> = {
    es: 'Nombre del plato (Español) *',
    en: 'Dish Name (English — opcional, usa Español si se deja vacío)',
    pt: 'Nome do Prato (Português — opcional, usa Espanhol se vazio)',
  };

  const descLabels: Record<Language, string> = {
    es: 'Descripción (Español)',
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
          {item ? 'Editar Plato' : 'Nuevo Plato'}
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
              <span>Idioma de textos del plato:</span>
            </span>
            <span className="text-[10px] text-muted">
              Fallback automático si EN/PT quedan vacíos
            </span>
          </div>
          <LanguageTabs activeLang={activeTab} onSelectLang={setActiveTab} />
        </div>

        <div className="space-y-3 animate-fade-in">
          <div>
            <label className="block text-muted font-medium mb-1">
              {nameLabels[activeTab]}
            </label>
            <input
              type="text"
              required={activeTab === 'es'}
              value={names[activeTab]}
              onChange={(e) => setNames({ ...names, [activeTab]: e.target.value })}
              placeholder={names.es || 'Ej: Croissant de pistacho'}
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
              placeholder={descs.es || 'Ingredientes principales...'}
              className="w-full bg-cream border border-line rounded-xl px-3 py-2 text-ink focus:border-wine focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">Precio ($ ARS) *</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ej: 5500"
              className="w-full min-h-[38px] bg-cream border border-line rounded-xl px-3 py-2 text-ink font-semibold focus:border-wine focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Categoría *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full min-h-[38px] bg-cream border border-line rounded-xl px-3 py-2 text-ink focus:border-wine focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.es}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-muted font-medium mb-1">URL de la foto gourmet</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full min-h-[38px] bg-cream border border-line rounded-xl px-3 py-2 text-ink focus:border-wine focus:outline-none"
          />
        </div>

        <div className="pt-2 border-t border-line/60">
          <span className="block text-muted font-medium mb-2">
            Etiquetas dietarias y alérgenos:
          </span>
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

            <label className="flex items-center gap-1.5 cursor-pointer text-amber-900 font-medium">
              <input
                type="checkbox"
                checked={hasTreeNuts}
                onChange={(e) => setHasTreeNuts(e.target.checked)}
                className="rounded text-amber-800 focus:ring-amber-800"
              />
              <span>Contiene Frutos Secos</span>
            </label>
          </div>
        </div>

        <div className="pt-2 border-t border-line/60">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="rounded text-wine focus:ring-wine"
            />
            <span>Plato disponible en salón (Desmarcar si está agotado)</span>
          </label>
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
            {item ? 'Guardar Cambios' : 'Agregar a la Carta'}
          </button>
        </div>
      </form>
    </ModalDialog>
  );
};
