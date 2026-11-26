import React, { useState, useEffect } from 'react';
import {
  MenuCategory,
  MenuItem,
  WeeklyDish,
  StoreSettings,
} from '../../db/types';
import { DietaryIcons } from '../menu/DietaryIcons';
import { formatDishTitle, parseArsPrice } from '../utils/securityAndFormat';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import { ItemFormModal } from './ItemFormModal';
import { WeeklyDishFormModal } from './WeeklyDishFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { useDragScroll } from '../layout/useDragScroll';
import { getFixedUsdPrice } from '../../db/fixedPrices';
import { formatUsdPrice } from '../utils/securityAndFormat';
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
  FolderPlus,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X,
} from 'lucide-react';

interface AdminPanelProps {
  categories: MenuCategory[];
  items: MenuItem[];
  weeklyDishes: WeeklyDish[];
  weeklyOverrideDay: number | null;
  isLiveSync?: boolean;
  /** Texto del último guardado que falló, o null si todo se guardó bien. */
  saveError?: string | null;
  onSetWeeklyOverrideDay: (day: number | null) => void;
  onUpdateItemPrice: (itemId: string, newPrice: number) => void;
  onToggleAvailability: (itemId: string) => void;
  onAddItem: (newItem: MenuItem) => void;
  onUpdateItem: (updatedItem: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddCategory: (newCategory: MenuCategory) => void;
  onUpdateCategory?: (category: MenuCategory) => void;
  /** Si `moveItemsTo` viene, los platos pasan a esa categoría; si no, se borran con ella. */
  onDeleteCategory?: (categoryId: string, moveItemsTo?: string) => void;
  /** Mueve un plato a otra posición (0 = primero) dentro de su categoría. */
  onReorderItem?: (itemId: string, targetPosition: number) => void;
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
  saveError = null,
  onSetWeeklyOverrideDay,
  onUpdateItemPrice,
  onToggleAvailability,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderItem,
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

  useEffect(() => {
    if (!categories.some((c) => c.id === selectedCat)) {
      if (categories[0]) {
        setSelectedCat(categories[0].id);
      }
    }
  }, [categories, selectedCat]);

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingWeeklyDish, setEditingWeeklyDish] = useState<WeeklyDish | null>(null);
  const [isWeeklyOpen, setIsWeeklyOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const categoryScroller = useDragScroll<HTMLDivElement>();
  const [deletingCategory, setDeletingCategory] = useState<MenuCategory | null>(null);
  const [moveTargetId, setMoveTargetId] = useState<string>('');

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

  const currentCategory = categories.find((c) => c.id === selectedCat) || categories[0];
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

  const finishCategoryDelete = (cat: MenuCategory, message: string) => {
    const remaining = categories.filter((c) => c.id !== cat.id);
    if (remaining.length > 0) setSelectedCat(remaining[0].id);
    setDeletingCategory(null);
    setIsReordering(false);
    showFeedback(message);
  };

  const handleDeleteCategoryClick = (cat: MenuCategory) => {
    if (categories.length <= 1) {
      showError('No podés eliminar la única categoría existente.');
      return;
    }
    const count = items.filter((i) => i.categoryId === cat.id).length;
    if (count === 0) {
      if (window.confirm(`¿Segura que querés eliminar la categoría vacía "${cat.name.es}"?`)) {
        onDeleteCategory?.(cat.id);
        finishCategoryDelete(cat, `Categoría "${cat.name.es}" eliminada.`);
      }
      return;
    }
    // Tiene platos: abrimos el panel para elegir si se mueven o se borran.
    const firstOther = categories.find((c) => c.id !== cat.id);
    setMoveTargetId(firstOther?.id || '');
    setDeletingCategory(cat);
  };

  const handleMoveAndDeleteCategory = () => {
    if (!deletingCategory || !moveTargetId) return;
    const target = categories.find((c) => c.id === moveTargetId);
    onDeleteCategory?.(deletingCategory.id, moveTargetId);
    finishCategoryDelete(
      deletingCategory,
      `Los platos pasaron a "${target?.name.es || 'otra categoría'}" y se eliminó "${deletingCategory.name.es}".`
    );
  };

  const handleDeleteCategoryWithItems = () => {
    if (!deletingCategory) return;
    const count = items.filter((i) => i.categoryId === deletingCategory.id).length;
    if (
      window.confirm(
        `Se van a borrar "${deletingCategory.name.es}" y sus ${count} plato(s). Esto no se puede deshacer. ¿Seguís?`
      )
    ) {
      onDeleteCategory?.(deletingCategory.id);
      finishCategoryDelete(deletingCategory, `Se eliminó "${deletingCategory.name.es}" con sus platos.`);
    }
  };

  const todayWeeklyDish =
    weeklyOverrideDay !== null
      ? weeklyDishes.find((d) => d.dayNumber === weeklyOverrideDay)
      : undefined;

  return (
    // data-clarity-mask: Clarity no graba el contenido del panel de la dueña.
    <div data-clarity-mask="true" className="min-h-screen bg-cream text-ink font-sans pb-24">
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

      {saveError && (
        <div className="max-w-xl mx-auto px-4 pt-3">
          <p role="alert" className="px-4 py-3 rounded-xl bg-wine/10 border border-wine/30 text-wine text-sm font-medium">
            No se guardó el último cambio: {saveError}
          </p>
        </div>
      )}
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
          <button
            type="button"
            onClick={() => setIsWeeklyOpen((open) => !open)}
            aria-expanded={isWeeklyOpen}
            aria-controls="weekly-editor"
            className="w-full flex items-center justify-between gap-2 text-left min-h-[44px]"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-wine font-serif font-medium text-lg">
                <Calendar size={18} />
                <span>Menú Semanal Ejecutivo</span>
              </span>
              {!isWeeklyOpen && (
                <span className="block text-xs text-muted mt-0.5 truncate">
                  {todayWeeklyDish
                    ? `Fijado: ${todayWeeklyDish.dayName.es} · ${formatDishTitle(todayWeeklyDish.title.es)}`
                    : `${weeklyDishes.length} platos · automático por día`}{' '}
                  · Tocá para editar
                </span>
              )}
            </span>
            <ChevronDown
              size={20}
              className={`text-gold shrink-0 transition-transform ${isWeeklyOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isWeeklyOpen && (
          <div id="weekly-editor" className="mt-3 animate-fade-in">
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
                      {formatDishTitle(dish.title.es)}
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
          )}
        </div>

        <div className="bg-paper rounded-2xl border border-line p-4 mb-4 shadow-soft">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Platos de la Carta ({items.length})
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsCreatingCategory(true)}
                className="min-h-[36px] px-3 py-1.5 rounded-lg border border-gold/60 bg-gold/10 hover:bg-gold/20 text-ink text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs"
                title="Crear una nueva categoría para la carta"
              >
                <FolderPlus size={14} className="text-gold" />
                <span>Nueva categoría</span>
              </button>
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
                    aria-label="Restaurar toda la carta original"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-muted mb-1.5">Deslizá para ver todas las categorías.</p>
          <div className="relative -mx-4">
            <div
              ref={categoryScroller.ref}
              {...categoryScroller.handlers}
              className={`flex gap-2 overflow-x-auto no-scrollbar px-4 py-1.5 select-none ${
                categoryScroller.isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
              role="group"
              aria-label="Categorías de la carta"
            >
              {categories.map((c) => {
                const count = items.filter((i) => i.categoryId === c.id).length;
                const isActive = selectedCat === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      if (categoryScroller.wasDrag()) return;
                      setSelectedCat(c.id);
                      setIsReordering(false);
                      setDeletingCategory(null);
                    }}
                    className={`h-10 px-4 rounded-full text-sm whitespace-nowrap shrink-0 ${
                      isActive ? 'liquid-wine font-medium' : 'liquid text-ink/85 hover:text-ink'
                    }`}
                  >
                    {c.name.es} <span className={isActive ? 'text-white/75' : 'text-muted'}>({count})</span>
                  </button>
                );
              })}
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-paper to-transparent"
            />
          </div>

          {currentCategory && (
            <div className="mt-3 pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="min-w-[45%] flex-1">
                <span className="font-serif font-semibold text-ink text-sm">
                  {currentCategory.name.es}
                </span>
                {currentCategory.description?.es && (
                  <p className="text-[11px] text-muted truncate">
                    {currentCategory.description.es}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted bg-cream px-2 py-0.5 rounded-md border border-line">
                  {currentCatItems.length} {currentCatItems.length === 1 ? 'plato' : 'platos'}
                </span>
                {onUpdateCategory && (
                  <button
                    type="button"
                    onClick={() => setEditingCategory(currentCategory)}
                    className="min-h-[34px] px-2.5 rounded-lg border border-line text-ink hover:border-gold text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    title="Cambiar el nombre o la descripción de esta categoría"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>
                )}
                {onReorderItem && currentCatItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsReordering((v) => !v)}
                    aria-pressed={isReordering}
                    className={`min-h-[34px] px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                      isReordering
                        ? 'bg-ink text-cream border-ink'
                        : 'border-line text-ink hover:border-gold'
                    }`}
                    title="Cambiar el orden en que aparecen los platos"
                  >
                    <ArrowUpDown size={13} />
                    <span>{isReordering ? 'Listo' : 'Ordenar'}</span>
                  </button>
                )}
                {onDeleteCategory && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategoryClick(currentCategory)}
                    className="min-h-[34px] px-2.5 rounded-lg border border-line text-muted hover:text-wine hover:border-wine/40 hover:bg-wine/5 text-xs inline-flex items-center gap-1.5 transition-colors"
                    title={`Eliminar la categoría "${currentCategory.name.es}"`}
                  >
                    <Trash2 size={13} />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {deletingCategory && (
          <div
            role="alertdialog"
            aria-labelledby="delete-cat-title"
            className="mb-4 p-4 rounded-2xl border border-wine/30 bg-wine/5 animate-fade-in"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 id="delete-cat-title" className="font-serif text-lg text-ink leading-snug">
                Eliminar “{deletingCategory.name.es}”
              </h3>
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="w-9 h-9 -mt-1 -mr-1 inline-flex items-center justify-center rounded-full text-muted hover:text-ink"
                aria-label="Cancelar"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted mt-1">
              Tiene {items.filter((i) => i.categoryId === deletingCategory.id).length} plato(s). ¿Qué
              hacemos con ellos?
            </p>

            <label className="block text-xs font-semibold text-ink mt-3 mb-1">
              Pasarlos a la categoría
            </label>
            <div className="flex gap-2 flex-wrap">
              <select
                value={moveTargetId}
                onChange={(e) => setMoveTargetId(e.target.value)}
                className="flex-1 min-w-[180px] min-h-[40px] bg-white border border-line rounded-lg px-3 text-sm text-ink focus:border-wine focus:outline-none"
              >
                {categories
                  .filter((c) => c.id !== deletingCategory.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.es}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleMoveAndDeleteCategory}
                className="min-h-[40px] px-3.5 rounded-lg bg-wine hover:bg-wine-dark text-white text-sm font-medium"
              >
                Mover y eliminar categoría
              </button>
            </div>

            <button
              type="button"
              onClick={handleDeleteCategoryWithItems}
              className="mt-3 min-h-[40px] px-3.5 rounded-lg border border-wine/40 text-wine text-sm font-medium hover:bg-wine/10 inline-flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Eliminar la categoría y todos sus platos</span>
            </button>
          </div>
        )}

        {isReordering && (
          <p className="mb-3 text-xs text-muted text-center">
            Usá las flechas o elegí el número de posición. El orden se ve al instante en la carta.
          </p>
        )}

        <div className="space-y-2.5">
          {currentCatItems.map((item, index) => {
            if (isReordering && onReorderItem) {
              return (
                <div
                  key={item.id}
                  className="bg-paper rounded-xl border border-line p-2.5 flex items-center gap-2.5 shadow-2xs"
                >
                  <select
                    value={index}
                    onChange={(e) => onReorderItem(item.id, parseInt(e.target.value, 10))}
                    aria-label={`Posición de ${item.name.es}`}
                    className="w-14 min-h-[40px] bg-cream border border-line rounded-lg px-1.5 text-sm font-semibold text-ink text-center focus:border-wine focus:outline-none"
                  >
                    {currentCatItems.map((_, pos) => (
                      <option key={pos} value={pos}>
                        {pos + 1}
                      </option>
                    ))}
                  </select>
                  <span className="flex-1 min-w-0 font-serif text-lg text-ink leading-tight truncate">
                    {formatDishTitle(item.name.es)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onReorderItem(item.id, index - 1)}
                    disabled={index === 0}
                    className="w-10 h-10 rounded-lg border border-line text-ink hover:border-gold disabled:opacity-30 inline-flex items-center justify-center"
                    aria-label={`Subir ${item.name.es}`}
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorderItem(item.id, index + 1)}
                    disabled={index === currentCatItems.length - 1}
                    className="w-10 h-10 rounded-lg border border-line text-ink hover:border-gold disabled:opacity-30 inline-flex items-center justify-center"
                    aria-label={`Bajar ${item.name.es}`}
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              );
            }

            const currentVal =
              editingPrices[item.id] !== undefined
                ? editingPrices[item.id]
                : item.price.toString();

            return (
              <div
                key={item.id}
                className={`bg-paper rounded-xl border p-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 shadow-2xs transition-colors ${
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

                <div className="flex-1 min-w-[60%]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-serif text-lg font-medium text-ink leading-tight">
                      {formatDishTitle(item.name.es)}
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

                <div className="flex items-center justify-end gap-1.5 w-full sm:w-auto">
                  {getFixedUsdPrice(item) ? (
                    <span
                      className="mr-auto sm:mr-0 min-h-[34px] inline-flex items-center px-2.5 rounded-lg border border-gold/40 bg-gold/10 text-xs font-semibold text-gold-dark"
                      title="Precio fijo en dólares, definido en el código (db/fixedPrices.ts)"
                    >
                      {formatUsdPrice(getFixedUsdPrice(item) as number)} · precio fijo
                    </span>
                  ) : (
                    <>
                      <div className="relative mr-auto sm:mr-0">
                        <span className="absolute left-2 top-2 text-xs text-muted font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          aria-label={`Precio de ${item.name.es}`}
                          value={currentVal}
                          onChange={(e) => handlePriceInputChange(item.id, e.target.value)}
                          className="w-24 min-h-[34px] bg-cream border border-line rounded-lg pl-5 pr-1.5 py-1 text-xs font-semibold text-ink text-right focus:border-wine focus:outline-none"
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
                    </>
                  )}

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
            <div className="text-center py-10 px-4 text-xs text-muted bg-paper rounded-xl border border-line">
              <p className="mb-3">
                No hay platos en "{currentCategory?.name.es || 'esta categoría'}".
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsCreatingItem(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-wine text-white font-medium hover:bg-wine-dark transition-colors inline-flex items-center gap-1 shadow-xs"
                >
                  <Plus size={13} />
                  <span>Agregar plato aquí</span>
                </button>
                {onDeleteCategory && currentCategory && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategoryClick(currentCategory)}
                    className="px-3 py-1.5 rounded-lg border border-line text-muted hover:text-wine hover:border-wine/40 transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    <span>Eliminar categoría</span>
                  </button>
                )}
              </div>
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

      {editingCategory && onUpdateCategory && (
        <CategoryFormModal
          existingCategories={categories}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={(updated) => {
            onUpdateCategory(updated);
            setEditingCategory(null);
            showFeedback(`Categoría "${updated.name.es}" actualizada.`);
          }}
        />
      )}

      {isCreatingCategory && (
        <CategoryFormModal
          existingCategories={categories}
          onClose={() => setIsCreatingCategory(false)}
          onSave={(newCat) => {
            onAddCategory(newCat);
            setSelectedCat(newCat.id);
            setIsCreatingCategory(false);
            showFeedback(`Categoría "${newCat.name.es}" creada.`);
          }}
        />
      )}

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
