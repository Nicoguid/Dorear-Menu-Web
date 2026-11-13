import React, { useState, useId } from 'react';
import { Language, MenuCategory } from '../../db/types';
import { FolderPlus, X } from 'lucide-react';
import { ModalDialog } from '../modals/ModalDialog';
import { LanguageTabs } from './ItemFormModal';
import { buildLocalizedString } from '../utils/securityAndFormat';

interface CategoryFormModalProps {
  existingCategories: MenuCategory[];
  onClose: () => void;
  onSave: (category: MenuCategory) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 32);
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  existingCategories,
  onClose,
  onSave,
}) => {
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<Language>('es');

  const [names, setNames] = useState<Record<Language, string>>({
    es: '',
    en: '',
    pt: '',
  });

  const [descs, setDescs] = useState<Record<Language, string>>({
    es: '',
    en: '',
    pt: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEsName = names.es.trim();
    if (!cleanEsName) {
      setFormError('Ingresá el nombre de la categoría en español.');
      setActiveTab('es');
      return;
    }

    const nameExists = existingCategories.some(
      (c) => c.name.es.trim().toLowerCase() === cleanEsName.toLowerCase()
    );
    if (nameExists) {
      setFormError(`Ya existe una categoría llamada "${cleanEsName}".`);
      setActiveTab('es');
      return;
    }

    const baseSlug = slugify(cleanEsName) || 'categoria';
    const uniqueSuffix = Date.now().toString(36).slice(-4);
    const newId = `cat-${baseSlug}-${uniqueSuffix}`;

    const maxOrder = existingCategories.reduce(
      (max, c) => Math.max(max, c.order || 0),
      0
    );

    const cleanEsDesc = descs.es.trim();

    const newCategory: MenuCategory = {
      id: newId,
      order: maxOrder + 1,
      name: buildLocalizedString(
        cleanEsName,
        undefined,
        names.en.trim() || undefined,
        names.pt.trim() || undefined
      ),
      description: buildLocalizedString(
        cleanEsDesc,
        undefined,
        descs.en.trim() || undefined,
        descs.pt.trim() || undefined
      ),
    };

    onSave(newCategory);
  };

  return (
    <ModalDialog isOpen={true} onClose={onClose} ariaLabelledBy={titleId}>
      <div className="flex items-center justify-between p-4 border-b border-line bg-paper sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold">
            <FolderPlus size={18} />
          </div>
          <div>
            <h3 id={titleId} className="font-serif font-semibold text-ink text-base">
              Nueva Categoría
            </h3>
            <p className="text-[11px] text-muted">
              Creá una nueva sección para organizar la carta
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-cream text-muted hover:text-ink transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
        {formError && (
          <div
            role="alert"
            className="p-3 bg-wine/10 border border-wine/30 rounded-xl text-wine text-xs font-medium animate-fade-in"
          >
            ⚠ {formError}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            Idioma del contenido:
          </label>
          <LanguageTabs activeLang={activeTab} onSelectLang={setActiveTab} />
          <p className="text-[10px] text-muted mt-1">
            {activeTab === 'es'
              ? 'Español es el idioma base principal.'
              : `Traducción al ${activeTab === 'en' ? 'inglés' : 'portugués'} (opcional: si queda vacía, se usará el texto en español).`}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Nombre de la categoría {activeTab === 'es' && <span className="text-wine">*</span>}
          </label>
          <input
            type="text"
            required={activeTab === 'es'}
            value={names[activeTab]}
            onChange={(e) => {
              setNames({ ...names, [activeTab]: e.target.value });
              if (formError) setFormError(null);
            }}
            placeholder={
              activeTab === 'es'
                ? 'Ej. Brunch & Especiales, Mocktails, Vinos...'
                : activeTab === 'en'
                ? 'e.g. Brunch & Specials, Mocktails, Wines...'
                : 'Ex. Brunch & Especiais, Mocktails, Vinhos...'
            }
            className="w-full min-h-[42px] bg-cream border border-line rounded-xl px-3 py-2 text-xs text-ink focus:border-wine focus:outline-none transition-colors"
          />
          <span className="text-[10px] text-muted">
            Este nombre aparecerá en las pestañas de navegación para los clientes.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Descripción o frase de la sección (opcional)
          </label>
          <textarea
            rows={2}
            value={descs[activeTab]}
            onChange={(e) => setDescs({ ...descs, [activeTab]: e.target.value })}
            placeholder={
              activeTab === 'es'
                ? 'Ej. Pequeños placeres para acompañar tu pausa.'
                : activeTab === 'en'
                ? 'e.g. Delicious treats to pair with your break.'
                : 'Ex. Delícias para acompanhar sua pausa.'
            }
            className="w-full bg-cream border border-line rounded-xl p-3 text-xs text-ink focus:border-wine focus:outline-none resize-none transition-colors"
          />
          <span className="text-[10px] text-muted">
            Subtítulo cálido que se muestra debajo del encabezado al entrar en la categoría.
          </span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-4 py-2 border border-line rounded-xl text-xs font-medium text-muted hover:text-ink hover:bg-cream transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="min-h-[40px] px-5 py-2 bg-wine hover:bg-wine-dark text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FolderPlus size={15} />
            <span>Crear Categoría</span>
          </button>
        </div>
      </form>
    </ModalDialog>
  );
};
