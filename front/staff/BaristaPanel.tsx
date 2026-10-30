import React, { useState } from 'react';
import { MenuCategory, MenuItem } from '../../db/types';
import { ArrowLeft, Search, Coffee, CheckCircle2, XCircle, Radio } from 'lucide-react';
import { DietaryIcons } from '../menu/DietaryIcons';

interface BaristaPanelProps {
  categories: MenuCategory[];
  items: MenuItem[];
  isLiveSync?: boolean;
  onToggleAvailability: (itemId: string) => void;
  onExit: () => void;
}

export const BaristaPanel: React.FC<BaristaPanelProps> = ({
  categories,
  items,
  isLiveSync = true,
  onToggleAvailability,
  onExit,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.es.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || item.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-cream text-ink font-sans pb-16">
      <div className="sticky top-0 z-40 bg-paper border-b border-line px-4 py-3 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="min-h-[40px] px-2 -ml-2 rounded-lg flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Volver al Menú</span>
          </button>
          <div className="flex items-center gap-2 text-wine font-serif font-semibold text-lg">
            <Coffee size={18} />
            <span>Control de Barra</span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full border ${
                isLiveSync
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : 'text-amber-800 bg-amber-50 border-amber-200'
              }`}
              title={
                isLiveSync
                  ? 'Sincronización en vivo activa'
                  : 'Modo local activo (sincronización entre pestañas)'
              }
            >
              <Radio
                size={10}
                className={isLiveSync ? 'animate-pulse text-emerald-600' : 'text-amber-600'}
              />
              <span>{isLiveSync ? 'En vivo' : 'Local'}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4">
        <div className="bg-paper rounded-2xl border border-line p-3.5 mb-4 shadow-soft">
          <p className="text-xs text-muted mb-2">
            Tocá el switch para marcar un producto como <strong>Agotado</strong> o{' '}
            <strong>Disponible</strong> en tiempo real para todos los dispositivos.
          </p>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full min-h-[40px] bg-cream border border-line rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:border-wine focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
            <button
              type="button"
              aria-pressed={selectedCat === 'all'}
              onClick={() => setSelectedCat('all')}
              className={`min-h-[34px] px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                selectedCat === 'all'
                  ? 'bg-wine text-white font-medium'
                  : 'bg-cream text-muted border border-line'
              }`}
            >
              Todos ({items.length})
            </button>
            {categories.map((c) => {
              const count = items.filter((i) => i.categoryId === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selectedCat === c.id}
                  onClick={() => setSelectedCat(c.id)}
                  className={`min-h-[34px] px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                    selectedCat === c.id
                      ? 'bg-wine text-white font-medium'
                      : 'bg-cream text-muted border border-line'
                  }`}
                >
                  {c.name.es} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.available}
              onClick={() => onToggleAvailability(item.id)}
              className={`w-full text-left min-h-[56px] p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer select-none transition-all ${
                item.available
                  ? 'bg-paper border-line hover:border-gold/50'
                  : 'bg-wine/5 border-wine/30'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-serif text-lg font-medium text-ink leading-tight">
                    {item.name.es}
                  </h4>
                  {item.dietary && item.dietary.length > 0 && (
                    <DietaryIcons tags={item.dietary} currentLang="es" size="sm" />
                  )}
                </div>
                <p className="text-[11px] text-muted truncate mt-0.5">
                  {item.description.es || 'Sin descripción adicional'}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                {item.available ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-2xs">
                    <CheckCircle2 size={14} />
                    <span>Disponible</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-wine bg-wine/10 border border-wine/30 px-3 py-1.5 rounded-full shadow-2xs">
                    <XCircle size={14} />
                    <span>AGOTADO</span>
                  </span>
                )}
              </div>
            </button>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-10 text-xs text-muted">
              No se encontraron productos con ese filtro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
