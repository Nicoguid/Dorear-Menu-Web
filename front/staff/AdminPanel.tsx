import React, { useState, useEffect } from 'react';
import {
  MenuCategory,
  MenuItem,
  WeeklyDish,
  StoreSettings,
} from '../../db/types';
import { DietaryIcons } from '../menu/DietaryIcons';
import { parseArsPrice } from '../utils/securityAndFormat';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import { ItemFormModal } from './ItemFormModal';
import { WeeklyDishFormModal } from './WeeklyDishFormModal';
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
  Settings,
  MessageSquare,
  Wifi,
  Users,
  Radio,
} from 'lucide-react';

interface AdminPanelProps {
  categories: MenuCategory[];
  items: MenuItem[];
  weeklyDishes: WeeklyDish[];
  weeklyOverrideDay: number | null;
  isLiveSync?: boolean;
  onSetWeeklyOverrideDay: (day: number | null) => void;
  onUpdateItemPrice: (itemId: string, newPrice: number) => void;
  onToggleAvailability: (itemId: string) => void;
  onAddItem: (newItem: MenuItem) => void;
  onUpdateItem: (updatedItem: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateWeeklyDish: (updatedDish: WeeklyDish) => void;
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onResetDefaults: () => void;
  onExit: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  categories,
  items,
  weeklyDishes,
  weeklyOverrideDay,
  isLiveSync = true,
  onSetWeeklyOverrideDay,
  onUpdateItemPrice,
  onToggleAvailability,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateWeeklyDish,
  settings,
  onUpdateSettings,
  onResetDefaults,
  onExit,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>(categories[0]?.id || 'cat-0');
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [editingWeeklyDish, setEditingWeeklyDish] = useState<WeeklyDish | null>(null);

  const showFeedback = (msg: string) => {
    setErrorMsg(null);
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2800);
  };

  const showError = (msg: string) => {
    setFeedbackMsg(null);
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = localSettings.whatsappNumber.replace(/\D/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 16) {
      showError('Ingresá un número de WhatsApp válido con código de país (ej. 5492364351445).');
      return;
    }
    if (localSettings.groupMenuPricePerPerson <= 0) {
      showError('El precio de Merienda Degustación debe ser mayor a $0.');
      return;
    }
    onUpdateSettings({
      ...localSettings,
      whatsappNumber: cleanPhone,
      wifiSSID: localSettings.wifiSSID.trim() || 'dorear',
      wifiPassword: localSettings.wifiPassword.trim(),
    });
    showFeedback('Configuración del local guardada y sincronizada.');
  };

  const currentCatItems = items.filter((i) => i.categoryId === selectedCat);

  const handlePriceInputChange = (itemId: string, value: string) => {
    setEditingPrices((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleSavePrice = (itemId: string) => {
    const rawVal = editingPrices[itemId];
    if (rawVal !== undefined) {
      const parsed = parseArsPrice(rawVal);
      if (parsed !== null) {
        onUpdateItemPrice(itemId, parsed);
        setEditingPrices((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        showFeedback('Precio actualizado con éxito.');
      } else {
        showError('Ingresá un precio válido mayor a $0 (ej. 6200 o 12.500).');
      }
    }
  };

  const handleDeleteItemClick = (item: MenuItem) => {
    if (window.confirm(`¿Segura que deseás eliminar "${item.name.es}" de la carta?`)) {
      onDeleteItem(item.id);
      showFeedback(`"${item.name.es}" fue eliminado.`);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ink font-sans pb-24">
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
          <div className="flex items-center gap-2 text-gold font-serif font-semibold text-lg">
            <UtensilsCrossed size={18} />
            <span>Gestión Dueña (Dorear)</span>
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
        {feedbackMsg && (
          <div
            role="status"
            className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium animate-fade-in"
          >
            ✓ {feedbackMsg}
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-wine/10 border border-wine/30 text-wine text-xs text-center font-medium animate-fade-in"
          >
            ⚠ {errorMsg}
          </div>
        )}

        <div className="bg-paper rounded-2xl border border-line p-4 mb-6 shadow-soft">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-wine font-serif font-medium text-lg">
              <Calendar size={18} />
              <span>Menú Semanal Ejecutivo</span>
            </div>
          </div>
          <p className="text-xs text-muted mb-3">
            Platos caseros del mediodía de Lunes a Viernes. Tocá el lápiz para editar el plato, sus traducciones o precios:
          </p>

          <div className="mb-4 p-3 bg-cream/70 rounded-xl border border-line">
            <label className="block text-xs font-semibold text-ink mb-1">
              Plato destacado hoy en la carta:
            </label>
            <select
              value={weeklyOverrideDay === null ? 'auto' : weeklyOverrideDay.toString()}
              onChange={(e) => {
                const val = e.target.value;
                onSetWeeklyOverrideDay(val === 'auto' ? null : parseInt(val, 10));
                showFeedback('Configuración del día actualizada.');
              }}
              className="w-full min-h-[38px] bg-white border border-line rounded-lg px-3 py-2 text-xs font-medium text-ink focus:border-wine focus:outline-none"
            >
              <option value="auto">Automático por calendario (Hora Buenos Aires)</option>
              {weeklyDishes.map((d) => (
                <option key={d.dayNumber} value={d.dayNumber.toString()}>
                  Fijar {d.dayName.es}: {d.title.es}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted mt-1">
              Si un feriado o evento querés mostrar otro plato, podés fijarlo aquí.
            </p>
          </div>

          <div className="space-y-2.5">
            {weeklyDishes.map((dish) => (
              <div
                key={dish.dayNumber}
                className="p-3 bg-cream rounded-xl border border-line flex items-center justify-between gap-3"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-paper shrink-0 border border-line">
                  <img
                    src={getOptimizedImageUrl(dish.imageUrl, 120, 75)}
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                    alt={dish.title.es}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-wine uppercase tracking-wider">
                      {dish.dayName.es}
                    </span>
                    <span className="text-xs font-medium text-ink truncate">
                      {dish.title.es}
                    </span>
                    {dish.dietary && dish.dietary.length > 0 && (
                      <DietaryIcons tags={dish.dietary} currentLang="es" size="sm" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted truncate mt-0.5">
                    {dish.description.es}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold">
                    <span className="text-gold">
                      Salón: ${dish.priceDineIn.toLocaleString('es-AR')}
                    </span>
                    <span className="text-line">•</span>
                    <span className="text-wine">
                      Take Away: ${dish.priceTakeAway.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingWeeklyDish(dish)}
                  className="min-w-[38px] min-h-[38px] p-2 rounded-lg bg-paper border border-line hover:border-gold text-muted hover:text-ink transition-colors shrink-0 flex items-center justify-center"
                  title="Editar plato de este día"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-paper rounded-2xl border border-line p-4 mb-4 shadow-soft">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Platos de la Carta ({items.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingItem(true)}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-wine text-white text-xs font-medium flex items-center gap-1 hover:bg-wine-dark transition-all shadow-xs"
              >
                <Plus size={14} />
                <span>Nuevo plato</span>
              </button>
              <button
                type="button"
                onClick={onResetDefaults}
                className="min-w-[36px] min-h-[36px] p-1.5 rounded-lg border border-line text-muted hover:text-wine transition-colors flex items-center justify-center"
                title="Restaurar toda la carta original"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((c) => {
              const count = items.filter((i) => i.categoryId === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selectedCat === c.id}
                  onClick={() => setSelectedCat(c.id)}
                  className={`min-h-[34px] px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                    selectedCat === c.id
                      ? 'bg-wine text-white font-medium shadow-xs'
                      : 'bg-cream text-muted border border-line hover:border-gold/60'
                  }`}
                >
                  {c.name.es} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2.5">
          {currentCatItems.map((item) => {
            const currentVal =
              editingPrices[item.id] !== undefined
                ? editingPrices[item.id]
                : item.price.toString();

            return (
              <div
                key={item.id}
                className={`bg-paper rounded-xl border p-3.5 flex items-center justify-between gap-3 shadow-2xs transition-colors ${
                  item.available ? 'border-line' : 'border-wine/30 bg-wine/5'
                }`}
              >
                {item.imageUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream shrink-0 border border-line">
                    <img
                      src={getOptimizedImageUrl(item.imageUrl, 120, 75)}
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      alt={item.name.es}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-serif text-lg font-medium text-ink leading-tight truncate">
                      {item.name.es}
                    </h4>
                    {item.dietary && item.dietary.length > 0 && (
                      <DietaryIcons tags={item.dietary} currentLang="es" size="sm" />
                    )}
                    {!item.available && (
                      <span className="text-[10px] bg-wine/10 text-wine px-1.5 py-0.5 rounded-sm font-sans font-medium shrink-0">
                        Agotado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted truncate mt-0.5">
                    {item.description.es || 'Sin descripción en ES'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-xs text-muted font-bold">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label={`Precio de ${item.name.es}`}
                      value={currentVal}
                      onChange={(e) => handlePriceInputChange(item.id, e.target.value)}
                      className="w-20 min-h-[34px] bg-cream border border-line rounded-lg pl-5 pr-1.5 py-1 text-xs font-semibold text-ink text-right focus:border-wine focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSavePrice(item.id)}
                    className="min-w-[34px] min-h-[34px] bg-wine hover:bg-wine-dark text-white p-1.5 rounded-lg transition-colors flex items-center justify-center"
                    title="Guardar precio rápido"
                  >
                    <Save size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleAvailability(item.id)}
                    className={`min-w-[34px] min-h-[34px] p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
                      item.available
                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'border-wine/30 text-wine bg-wine/10 hover:bg-wine/20'
                    }`}
                    title={item.available ? 'Marcar como agotado' : 'Marcar como disponible'}
                  >
                    {item.available ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="min-w-[34px] min-h-[34px] p-1.5 rounded-lg border border-line text-muted hover:text-ink hover:border-gold transition-colors flex items-center justify-center"
                    title="Editar datos y traducciones del plato"
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItemClick(item)}
                    className="min-w-[34px] min-h-[34px] p-1.5 rounded-lg border border-line text-muted hover:text-wine hover:border-wine/40 transition-colors flex items-center justify-center"
                    title="Eliminar plato de la carta"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {currentCatItems.length === 0 && (
            <div className="text-center py-12 text-xs text-muted bg-paper rounded-xl border border-line">
              No hay platos en esta categoría.{' '}
              <button
                type="button"
                onClick={() => setIsCreatingItem(true)}
                className="text-wine font-medium hover:underline"
              >
                Agregar el primero
              </button>
            </div>
          )}
        </div>

        <div className="bg-paper rounded-2xl border border-line p-4 mt-6 mb-6 shadow-soft">
          <div className="flex items-center gap-2 text-wine font-serif font-medium text-lg mb-2">
            <Settings size={18} />
            <span>Configuración del Local (WhatsApp & Wi-Fi)</span>
          </div>
          <p className="text-xs text-muted mb-4">
            Ajustá el número donde recibís los pedidos de Take Away y reservas de mesas grandes, y los datos del Wi-Fi de clientes:
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-emerald-600" />
                WhatsApp del Local (con código de país, sin espacios ni signos):
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={localSettings.whatsappNumber}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })
                }
                placeholder="5492364351445"
                className="w-full min-h-[40px] bg-cream border border-line rounded-xl px-3 py-2 font-mono text-ink focus:border-wine focus:outline-none"
              />
              <span className="text-[10px] text-muted">
                Ejemplo para CABA: 54911 + 8 dígitos (ej. 5492364351445)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1 flex items-center gap-1.5">
                  <Wifi size={14} className="text-gold" />
                  Nombre de Red Wi-Fi (SSID):
                </label>
                <input
                  type="text"
                  maxLength={64}
                  value={localSettings.wifiSSID}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, wifiSSID: e.target.value })
                  }
                  placeholder="dorear"
                  className="w-full min-h-[40px] bg-cream border border-line rounded-xl px-3 py-2 text-ink focus:border-wine focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">
                  Contraseña de Wi-Fi:
                </label>
                <input
                  type="text"
                  maxLength={128}
                  value={localSettings.wifiPassword}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, wifiPassword: e.target.value })
                  }
                  placeholder="12345678"
                  className="w-full min-h-[40px] bg-cream border border-line rounded-xl px-3 py-2 font-mono text-wine font-semibold focus:border-wine focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Users size={14} className="text-gold" />
                Precio Merienda Degustación Grupos ($ por persona):
              </label>
              <input
                type="number"
                min={1}
                value={localSettings.groupMenuPricePerPerson}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    groupMenuPricePerPerson: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full min-h-[40px] bg-cream border border-line rounded-xl px-3 py-2 font-mono text-ink focus:border-wine focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="min-h-[40px] inline-flex items-center gap-2 bg-wine hover:bg-wine-dark text-white px-4 py-2 rounded-xl font-medium shadow-xs text-xs transition-colors"
              >
                <Save size={14} />
                <span>Guardar Configuración</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {(isCreatingItem || editingItem) && (
        <ItemFormModal
          categories={categories}
          initialCategory={selectedCat}
          item={editingItem}
          onClose={() => {
            setIsCreatingItem(false);
            setEditingItem(null);
          }}
          onSave={(itemData) => {
            if (editingItem) {
              onUpdateItem(itemData);
              showFeedback(`"${itemData.name.es}" actualizado.`);
            } else {
              onAddItem(itemData);
              showFeedback(`"${itemData.name.es}" agregado a la carta.`);
            }
            setIsCreatingItem(false);
            setEditingItem(null);
          }}
        />
      )}

      {editingWeeklyDish && (
        <WeeklyDishFormModal
          dish={editingWeeklyDish}
          onClose={() => setEditingWeeklyDish(null)}
          onSave={(updatedDish) => {
            onUpdateWeeklyDish(updatedDish);
            showFeedback(`Menú del ${updatedDish.dayName.es} actualizado.`);
            setEditingWeeklyDish(null);
          }}
        />
      )}
    </div>
  );
};
