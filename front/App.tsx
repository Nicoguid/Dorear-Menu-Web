import { useState, useEffect, lazy, Suspense, useCallback, useMemo, useRef } from 'react';
import {
  Language,
  DietaryTag,
  MenuCategory,
  MenuItem,
  WeeklyDish,
  StoreSettings,
} from '../db/types';
import { CATEGORIES, INITIAL_MENU_ITEMS } from '../db/menuData';
import { WEEKLY_MENU_DISHES } from '../db/weeklyMenu';
import { CURRENT_STATE_VERSION, DEFAULT_STORE_SETTINGS } from '../db/storeSettings';
import { categorySlug, LANGUAGE_PATHS, languageFromPath } from '../db/urlState';
import { getFixedUsdPrice } from '../db/fixedPrices';
import { WheatOff, Leaf, MilkOff, MessageSquare, WifiOff } from 'lucide-react';

import { Header } from './layout/Header';
import { CategoryNav } from './layout/CategoryNav';
import { GroupReservationCard } from './layout/GroupReservationCard';
import { GoogleReviewSection } from './layout/GoogleReviewSection';
import { Footer } from './layout/Footer';

import { WeeklyMenuPill } from './menu/WeeklyMenuPill';
import { DietaryFilters } from './menu/DietaryFilters';
import { MenuItemCard } from './menu/MenuItemCard';
import { TakeAwayPill } from './menu/TakeAwayPill';
import { SearchBar } from './menu/SearchBar';
import { matchesSearch } from './utils/menuSearch';
import { formatArsPrice, formatDishTitle } from './utils/securityAndFormat';

import { ProductDetailModal } from './modals/ProductDetailModal';
import { StaffModal } from './modals/StaffModal';
import { WifiCardModal } from './modals/WifiCardModal';
import { GroupReservationModal } from './modals/GroupReservationModal';

import {
  clearLocalStateSnapshot,
  clearStaffSession,
  DorearSharedState,
  loadValidatedLocalState,
  removeLegacyLocalKeys,
  resetSharedState,
  saveAvailability,
  saveFullState,
  SaveResult,
  saveLocalStateSnapshot,
  subscribeToRealtimeSync,
} from './utils/menuSync';
import { openWhatsAppChat } from './utils/securityAndFormat';
import {
  trackCategoryChange,
  trackDietaryFilterChange,
  trackLanguageChange,
  trackProductClick,
  trackWeeklyDishClick,
  trackWhatsAppClick,
  trackWifiModalOpen,
  trackSearch,
  trackGroupModalOpen,
  stopRecordingForStaff,
} from './utils/analytics';

const BaristaPanel = lazy(() =>
  import('./staff/BaristaPanel').then((m) => ({ default: m.BaristaPanel }))
);
const AdminPanel = lazy(() =>
  import('./staff/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);

/**
 * Idioma inicial: 1) la ruta (/en/, /pt/), 2) ?lang=, 3) el idioma del celular
 * (un turista brasileño que escanea el QR ve la carta en portugués), 4) español.
 */
function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'es';
  const fromPath = languageFromPath(window.location.pathname);
  if (fromPath) return fromPath;
  const param = new URLSearchParams(window.location.search).get('lang');
  if (param === 'es' || param === 'en' || param === 'pt') return param;
  const preferred = (navigator.languages || [navigator.language || 'es']).map((l) => l.toLowerCase());
  for (const code of preferred) {
    if (code.startsWith('es')) return 'es';
    if (code.startsWith('pt')) return 'pt';
    if (code.startsWith('en')) return 'en';
  }
  return 'es';
}

const HTML_LANG: Record<Language, string> = { es: 'es-AR', en: 'en', pt: 'pt-BR' };

const byOrder = (a: MenuCategory, b: MenuCategory) => a.order - b.order;

/** La tarjeta "¿Querés encargar una torta entera?" va en la categoría de tortas. */
const isCakeCategory = (cat: MenuCategory) => cat.id === 'cat-2' || /torta/.test(categorySlug(cat));

function buildDefaultState(): DorearSharedState {
  return {
    version: CURRENT_STATE_VERSION,
    updatedAt: Date.now(),
    categories: CATEGORIES,
    items: INITIAL_MENU_ITEMS,
    weeklyDishes: WEEKLY_MENU_DISHES,
    weeklyOverrideDay: null,
    storeSettings: DEFAULT_STORE_SETTINGS,
  };
}

export function App() {
  const [currentLang, setCurrentLang] = useState<Language>(detectInitialLanguage);
  // Vacío = "la primera categoría de la carta" (se resuelve abajo con las categorías reales).
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<DietaryTag | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const [sharedState, setSharedState] = useState<DorearSharedState>(() =>
    loadValidatedLocalState({
      categories: CATEGORIES,
      items: INITIAL_MENU_ITEMS,
      weeklyDishes: WEEKLY_MENU_DISHES,
      storeSettings: DEFAULT_STORE_SETTINGS,
    })
  );

  const {
    categories: rawCategories = CATEGORIES,
    items,
    weeklyDishes,
    weeklyOverrideDay,
    storeSettings,
  } = sharedState;
  // Siempre en el orden que eligió la dueña (campo `order`), en la carta y en los paneles.
  const categories = useMemo(() => [...rawCategories].sort(byOrder), [rawCategories]);
  // Último estado, para calcular cada cambio sin disparar el guardado dentro de setState
  // (React puede ejecutar dos veces esas funciones y se guardaría dos veces).
  const stateRef = useRef(sharedState);
  stateRef.current = sharedState;

  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [wifiModalOpen, setWifiModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<'customer' | 'barista' | 'admin'>('customer');
  const [isLiveSync, setIsLiveSync] = useState<boolean>(false);
  // Último guardado del personal que falló (se muestra en el panel hasta que uno salga bien).
  const [saveError, setSaveError] = useState<string | null>(null);
  const menuTopRef = useRef<HTMLDivElement>(null);

  // ?cat=tortas-y-budines abre directamente esa categoría (links compartidos, Google, IA).
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('cat');
    if (!slug) return;
    const match = categories.find((c) => categorySlug(c) === slug);
    if (match) setActiveCategoryId(match.id);
    // Solo al cargar y cuando llegan las categorías reales.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  // La dirección refleja idioma y categoría (/en/?cat=...), y <html lang> sigue al idioma.
  useEffect(() => {
    if (currentRole !== 'customer') return;
    document.documentElement.lang = HTML_LANG[currentLang];
    const firstCategoryId = categories[0]?.id;
    const active = categories.find((c) => c.id === activeCategoryId);
    const query = active && active.id !== firstCategoryId ? `?cat=${categorySlug(active)}` : '';
    const next = `${LANGUAGE_PATHS[currentLang]}${query}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(null, '', next + window.location.hash);
    }
  }, [currentLang, activeCategoryId, categories, currentRole]);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const menuToolsRef = useRef<HTMLDivElement>(null);

  // Guarda en CSS la altura real de la barra fija y de su parte de herramientas,
  // para el scroll-margin del ancla y para la barra compacta en pantallas bajas.
  useEffect(() => {
    const bar = menuBarRef.current;
    const tools = menuToolsRef.current;
    if (!bar || !tools || typeof ResizeObserver === 'undefined') return;
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty('--menu-bar-h', `${bar.offsetHeight}px`);
      root.style.setProperty('--menu-tools-h', `${tools.offsetHeight}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    observer.observe(tools);
    return () => observer.disconnect();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const isSearching = searchQuery.trim().length > 0;

  // Al empezar a buscar desde abajo de la carta, subimos al principio de los resultados.
  useEffect(() => {
    if (!isSearching) return;
    const anchor = menuTopRef.current;
    if (anchor && anchor.getBoundingClientRect().top < 0) {
      anchor.scrollIntoView({ block: 'start' });
    }
  }, [isSearching]);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    removeLegacyLocalKeys();
    const unsubscribe = subscribeToRealtimeSync(
      (incomingState) => {
        saveLocalStateSnapshot(incomingState);
        setSharedState(incomingState);
      },
      () => {
        clearLocalStateSnapshot();
        setSharedState(buildDefaultState());
      },
      (live) => {
        setIsLiveSync(live);
      }
    );
    return unsubscribe;
  }, []);

  const reportSave = useCallback((pending: Promise<SaveResult>) => {
    pending.then((result) => setSaveError(result.ok ? null : result.error));
  }, []);

  /**
   * Aplica un cambio de la dueña: se ve al instante en este dispositivo y se guarda en
   * la base. Si la base lo rechaza, el panel lo avisa (no queda "guardado" en falso).
   */
  const applyLocally = useCallback((nextState: DorearSharedState) => {
    stateRef.current = nextState;
    saveLocalStateSnapshot(nextState);
    setSharedState(nextState);
  }, []);

  const commitStateUpdate = useCallback(
    (updater: (prev: DorearSharedState) => Omit<DorearSharedState, 'version' | 'updatedAt'>) => {
      const nextState: DorearSharedState = {
        ...updater(stateRef.current),
        version: CURRENT_STATE_VERSION,
        updatedAt: Date.now(),
      };
      applyLocally(nextState);
      reportSave(saveFullState(nextState));
    },
    [applyLocally, reportSave]
  );

  const handleOpenTakeAwayWhatsApp = () => {
    trackWhatsAppClick('takeaway_order');
    const msg =
      currentLang === 'es'
        ? '¡Hola Dorear! 👋 Quiero hacer un pedido para retirar.'
        : currentLang === 'en'
        ? 'Hello Dorear! 👋 I would like to place an order for pickup.'
        : 'Olá Dorear! 👋 Gostaria de fazer um pedido para retirada.';
    openWhatsAppChat(storeSettings.whatsappNumber, msg);
  };

  const handleOpenCakesWhatsApp = () => {
    trackWhatsAppClick('whole_cake_inquiry');
    const msg =
      currentLang === 'es'
        ? '¡Hola Dorear! 👋 Quiero consultar para encargar una torta entera para festejo.'
        : currentLang === 'en'
        ? 'Hello Dorear! 👋 I would like to inquire about ordering a whole celebration cake.'
        : 'Olá Dorear! 👋 Gostaria de consultar sobre a encomenda de um bolo inteiro para comemoração.';
    openWhatsAppChat(storeSettings.whatsappNumber, msg);
  };

  // Agotado / disponible: manda solo ese producto (lo puede hacer la barra).
  const handleToggleAvailability = (itemId: string) => {
    const prev = stateRef.current;
    const target = prev.items.find((item) => item.id === itemId);
    if (!target) return;
    const available = !target.available;
    const nextState: DorearSharedState = {
      ...prev,
      updatedAt: Date.now(),
      items: prev.items.map((item) => (item.id === itemId ? { ...item, available } : item)),
    };
    applyLocally(nextState);
    reportSave(saveAvailability(nextState, itemId, available));
  };

  const handleUpdateItemPrice = (itemId: string, newPrice: number) => {
    commitStateUpdate((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, price: newPrice } : item
      ),
    }));
  };

  const handleAddItem = (newItem: MenuItem) => {
    commitStateUpdate((prev) => ({
      ...prev,
      items: [newItem, ...prev.items],
    }));
  };

  const handleUpdateItem = (updatedItem: MenuItem) => {
    commitStateUpdate((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    commitStateUpdate((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleAddCategory = (newCategory: MenuCategory) => {
    commitStateUpdate((prev) => ({
      ...prev,
      categories: [...(prev.categories || CATEGORIES), newCategory],
    }));
  };

  const handleUpdateCategory = (updatedCategory: MenuCategory) => {
    commitStateUpdate((prev) => ({
      ...prev,
      categories: (prev.categories || CATEGORIES).map((c) =>
        c.id === updatedCategory.id ? updatedCategory : c
      ),
    }));
  };

  const handleDeleteCategory = (categoryId: string, moveItemsTo?: string) => {
    commitStateUpdate((prev) => ({
      ...prev,
      categories: (prev.categories || CATEGORIES).filter((c) => c.id !== categoryId),
      items: moveItemsTo
        ? prev.items.map((i) => (i.categoryId === categoryId ? { ...i, categoryId: moveItemsTo } : i))
        : prev.items.filter((i) => i.categoryId !== categoryId),
    }));
    if (activeCategoryId === categoryId) {
      setActiveCategoryId(moveItemsTo || '');
    }
  };

  /**
   * El orden de los platos en la carta es el orden del array `items`. Para mover uno
   * dentro de su categoría, reordenamos solo los de esa categoría y los volvemos a
   * poner en los mismos "huecos" del array, sin tocar el resto.
   */
  const handleReorderItem = (itemId: string, targetPosition: number) => {
    commitStateUpdate((prev) => {
      const moving = prev.items.find((i) => i.id === itemId);
      if (!moving) return prev;
      const sameCategory = prev.items.filter((i) => i.categoryId === moving.categoryId);
      const from = sameCategory.findIndex((i) => i.id === itemId);
      const to = Math.max(0, Math.min(sameCategory.length - 1, targetPosition));
      if (from === to) return prev;
      const reordered = [...sameCategory];
      reordered.splice(from, 1);
      reordered.splice(to, 0, moving);
      let slot = 0;
      return {
        ...prev,
        items: prev.items.map((i) => (i.categoryId === moving.categoryId ? reordered[slot++] : i)),
      };
    });
  };

  const handleUpdateWeeklyDish = (updatedDish: WeeklyDish) => {
    commitStateUpdate((prev) => ({
      ...prev,
      weeklyDishes: prev.weeklyDishes.map((dish) =>
        dish.dayNumber === updatedDish.dayNumber ? updatedDish : dish
      ),
    }));
  };

  const handleSetWeeklyOverrideDay = (day: number | null) => {
    commitStateUpdate((prev) => ({
      ...prev,
      weeklyOverrideDay: day,
    }));
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    commitStateUpdate((prev) => ({
      ...prev,
      storeSettings: newSettings,
    }));
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        '¿Seguro que querés restaurar todos los platos, categorías, precios originales y fotos de Dorear en todos los dispositivos?'
      )
    ) {
      clearLocalStateSnapshot();
      setSharedState(buildDefaultState());
      reportSave(resetSharedState());
    }
  };

  const handleExitStaff = () => {
    clearStaffSession();
    setSaveError(null);
    setCurrentRole('customer');
  };

  const handleSelectWeeklyDish = (dish: WeeklyDish) => {
    trackWeeklyDishClick(dish, currentLang);
    setSelectedDetailItem({
      id: `weekly-${dish.dayNumber}`,
      categoryId: 'weekly',
      name: dish.title,
      description: {
        es: `${dish.description.es} (Incluye bebida y café a elección)`,
        en: `${dish.description.en} (Includes choice of drink and coffee)`,
        pt: `${dish.description.pt} (Inclui bebida e café à escolha)`,
      },
      price: dish.priceDineIn,
      available: true,
      imageUrl: dish.imageUrl,
      dietary: dish.dietary || [],
      allergens: dish.allergens || [],
      modifiers: [
        {
          id: 'takeaway',
          name: {
            es: 'Modalidad Take Away (Para retirar)',
            en: 'Take Away Option (Pickup)',
            pt: 'Opção Take Away (Para viagem)',
          },
          price: dish.priceTakeAway - dish.priceDineIn,
        },
      ],
    });
  };

  const handleOpenProductDetail = (item: MenuItem) => {
    trackProductClick(item, currentLang);
    setSelectedDetailItem(item);
  };

  const handleSelectCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      trackCategoryChange(cat.id, cat.name[currentLang] || cat.name.es);
    }
    setActiveCategoryId(catId);
    setSearchQuery('');
    // Si la persona ya bajó por la carta, la llevamos al principio de la categoría nueva
    // (justo debajo de la barra fija) en vez de dejarla en el medio de una lista distinta.
    const anchor = menuTopRef.current;
    if (anchor && anchor.getBoundingClientRect().top < 0) {
      anchor.scrollIntoView({ block: 'start' });
    }
  };

  const handleSelectDietaryFilter = (filter: DietaryTag | null) => {
    trackDietaryFilterChange(filter);
    setActiveDietaryFilter(filter);
  };

  const handleSelectLang = (lang: Language) => {
    trackLanguageChange(lang);
    setCurrentLang(lang);
  };

  const handleOpenWifiModal = () => {
    trackWifiModalOpen();
    setWifiModalOpen(true);
  };

  // Hooks de la búsqueda: van antes de los return de los paneles (barra / dueña) para que
  // React siempre ejecute la misma cantidad de hooks.
  const searchResultCountRef = useRef(0);
  // Registra la búsqueda cuando la persona deja de tipear (1,2 s), no en cada letra.
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) return;
    const timer = setTimeout(() => trackSearch(query, searchResultCountRef.current), 1200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (currentRole === 'barista') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-cream flex items-center justify-center text-sm text-muted">
            Cargando panel de barra...
          </div>
        }
      >
        <BaristaPanel
          categories={categories}
          items={items}
          isLiveSync={isLiveSync}
          saveError={saveError}
          onToggleAvailability={handleToggleAvailability}
          onExit={handleExitStaff}
        />
      </Suspense>
    );
  }

  if (currentRole === 'admin') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-cream flex items-center justify-center text-sm text-muted">
            Cargando panel de gestión...
          </div>
        }
      >
        <AdminPanel
          categories={categories}
          items={items}
          weeklyDishes={weeklyDishes}
          weeklyOverrideDay={weeklyOverrideDay}
          isLiveSync={isLiveSync}
          saveError={saveError}
          onSetWeeklyOverrideDay={handleSetWeeklyOverrideDay}
          onUpdateItemPrice={handleUpdateItemPrice}
          onToggleAvailability={handleToggleAvailability}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderItem={handleReorderItem}
          onUpdateWeeklyDish={handleUpdateWeeklyDish}
          settings={storeSettings}
          onUpdateSettings={handleUpdateSettings}
          onResetDefaults={handleResetDefaults}
          onExit={handleExitStaff}
        />
      </Suspense>
    );
  }

  // Si la categoría elegida ya no existe (la borraron), se muestra la primera.
  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) || categories[0] || CATEGORIES[0];
  const categoryItems = items.filter((item) => {
    const matchesCat = item.categoryId === activeCategory.id;
    const matchesDietary =
      !activeDietaryFilter ||
      (item.dietary && item.dietary.includes(activeDietaryFilter));
    return matchesCat && matchesDietary;
  });

  // Búsqueda: recorre TODA la carta (no solo la categoría elegida) y respeta el filtro dietario.
  const searchGroups = isSearching
    ? categories
        .map((cat) => ({
          category: cat,
          items: items.filter(
            (item) =>
              item.categoryId === cat.id &&
              (!activeDietaryFilter || item.dietary?.includes(activeDietaryFilter)) &&
              (matchesSearch(searchQuery, currentLang, item.name, item.description) ||
                matchesSearch(searchQuery, currentLang, cat.name))
          ),
        }))
        .filter((group) => group.items.length > 0)
    : [];
  const weeklyMatches = isSearching
    ? weeklyDishes.filter(
        (dish) =>
          (!activeDietaryFilter || dish.dietary?.includes(activeDietaryFilter)) &&
          matchesSearch(searchQuery, currentLang, dish.title, dish.description, dish.dayName)
      )
    : [];
  const hasUsdPrices = items.some((item) => getFixedUsdPrice(item) !== undefined);
  const searchResultCount =
    searchGroups.reduce((total, group) => total + group.items.length, 0) + weeklyMatches.length;
  searchResultCountRef.current = searchResultCount;

  return (
    <div className="min-h-screen bg-cream text-ink font-sans selection:bg-gold/20 selection:text-ink relative">
      {isOffline && (
        <div
          role="status"
          className="bg-wine text-white text-[13px] py-1.5 px-4 text-center flex items-center justify-center gap-1.5 font-medium"
        >
          <WifiOff size={12} />
          <span>
            {currentLang === 'es' &&
              'Modo sin señal activo · Estás viendo la carta guardada en tu teléfono'}
            {currentLang === 'en' &&
              'Offline mode active · Viewing cached menu on your phone'}
            {currentLang === 'pt' &&
              'Modo offline ativo · Visualizando o cardápio salvo no seu celular'}
          </span>
        </div>
      )}

      <Header
        currentLang={currentLang}
        onSelectLang={handleSelectLang}
        onOpenStaffModal={() => {
          stopRecordingForStaff();
          setStaffModalOpen(true);
        }}
        onOpenWifiModal={handleOpenWifiModal}
      />

      <WeeklyMenuPill
        dishes={weeklyDishes}
        overrideDay={weeklyOverrideDay}
        currentLang={currentLang}
        activeDietaryFilter={activeDietaryFilter}
        onSelectDish={handleSelectWeeklyDish}
      />

      {/* Barra fija. En pantallas bajas (celular horizontal) el buscador y los filtros
          se van con el scroll y queda fija solo la fila de categorías: ver .menu-bar en index.css. */}
      <div ref={menuBarRef} className="menu-bar sticky top-0 z-30 glass-bar">
        <div className="max-w-xl mx-auto pb-2.5">
          <div ref={menuToolsRef} className="pt-2.5 pb-2 space-y-2">
            <SearchBar value={searchQuery} currentLang={currentLang} onChange={setSearchQuery} />
            <DietaryFilters
              currentLang={currentLang}
              activeFilter={activeDietaryFilter}
              onSelectFilter={handleSelectDietaryFilter}
            />
          </div>
          <CategoryNav
            categories={categories}
            activeCategoryId={isSearching ? '' : activeCategory.id}
            currentLang={currentLang}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      </div>

      <div ref={menuTopRef} className="menu-anchor" aria-hidden="true" />

      <main id="carta" className="max-w-xl mx-auto px-5 pt-5">
        {isSearching ? (
          <div>
            <h2 className="font-serif text-[1.45rem] text-ink font-medium leading-tight">
              {currentLang === 'es' && `Resultados para “${searchQuery.trim()}”`}
              {currentLang === 'en' && `Results for “${searchQuery.trim()}”`}
              {currentLang === 'pt' && `Resultados para “${searchQuery.trim()}”`}
            </h2>
            <p className="text-base text-muted mt-0.5" role="status">
              {searchResultCount === 0
                ? currentLang === 'es'
                  ? 'No encontramos nada con esa palabra. Probá con otra o sacá el filtro.'
                  : currentLang === 'en'
                  ? 'Nothing matches that word. Try another one or clear the filter.'
                  : 'Nada encontrado com essa palavra. Tente outra ou tire o filtro.'
                : `${searchResultCount} ${
                    searchResultCount === 1
                      ? { es: 'opción', en: 'item', pt: 'opção' }[currentLang]
                      : { es: 'opciones', en: 'items', pt: 'opções' }[currentLang]
                  }`}
            </p>
            <div className="section-rule mt-3 mb-1" aria-hidden="true" />

            {weeklyMatches.length > 0 && (
              <section className="mt-5">
                <h3 className="font-serif italic text-base text-gold-dark">
                  {currentLang === 'es' && 'Menú ejecutivo del mediodía'}
                  {currentLang === 'en' && 'Executive lunch menu'}
                  {currentLang === 'pt' && 'Menu executivo do almoço'}
                </h3>
                {weeklyMatches.map((dish) => (
                  <button
                    key={dish.dayNumber}
                    type="button"
                    onClick={() => handleSelectWeeklyDish(dish)}
                    className="w-full text-left py-3 border-b border-line/70 flex justify-between items-start gap-4 hover:bg-paper/60 px-5 -mx-5"
                    style={{ width: 'calc(100% + 2.5rem)' }}
                  >
                    <span>
                      <span className="block text-sm text-muted">{dish.dayName[currentLang]}</span>
                      <span className="block font-serif text-[1.25rem] text-ink font-medium leading-tight">
                        {formatDishTitle(dish.title[currentLang])}
                      </span>
                    </span>
                    <span className="text-base font-semibold text-wine tabular whitespace-nowrap pt-5">
                      {formatArsPrice(dish.priceDineIn)}
                    </span>
                  </button>
                ))}
              </section>
            )}

            {searchGroups.map((group) => (
              <section key={group.category.id} className="mt-5">
                <h3 className="font-serif italic text-base text-gold-dark">
                  {group.category.name[currentLang] || group.category.name.es}
                </h3>
                {group.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    currentLang={currentLang}
                    onOpenDetail={handleOpenProductDetail}
                  />
                ))}
              </section>
            ))}
          </div>
        ) : (
          <>
          <div className="mb-1">
            <h2 className="font-serif text-[1.6rem] text-ink font-semibold leading-tight text-balance">
              {activeCategory.name[currentLang] || activeCategory.name.es}
            </h2>
            {(activeCategory.description[currentLang] || activeCategory.description.es) && (
              <p className="font-serif italic text-base text-muted leading-snug mt-0.5">
                {activeCategory.description[currentLang] || activeCategory.description.es}
              </p>
            )}
            {/* Línea dorada: marca dónde arrancan los productos */}
            <div className="section-rule mt-3" aria-hidden="true" />
          </div>

          <div>
            {categoryItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                currentLang={currentLang}
                onOpenDetail={handleOpenProductDetail}
              />
            ))}

            {categoryItems.length === 0 && (
              <div className="py-12 text-center text-base text-muted">
                {currentLang === 'es' && 'No hay opciones con este filtro en esta categoría. Probá con otra categoría o tocá "Todos".'}
                {currentLang === 'en' && 'No items match this filter in this category. Try another category or tap "All".'}
                {currentLang === 'pt' && 'Nenhuma opção com este filtro nesta categoria. Tente outra categoria ou toque em "Todos".'}
              </div>
            )}
          </div>

          </>
        )}

        {!isSearching && isCakeCategory(activeCategory) && (
          <div className="glass mt-5 p-5 rounded-[22px] animate-fade-in">
            <h3 className="font-serif text-[1.25rem] text-ink font-medium leading-snug">
              {currentLang === 'es' && '¿Querés encargar una torta entera?'}
              {currentLang === 'en' && 'Order a whole cake for your celebration'}
              {currentLang === 'pt' && 'Encomende um bolo inteiro'}
            </h3>
            <p className="text-base text-muted leading-relaxed mt-1">
              {currentLang === 'es' &&
                'Hacemos nuestras tortas enteras para llevar con 48 hs de anticipación. Consultá sabores por WhatsApp.'}
              {currentLang === 'en' &&
                'We make our whole cakes for pickup with 48 hours notice. Ask about flavors on WhatsApp.'}
              {currentLang === 'pt' &&
                'Preparamos nossos bolos inteiros para levar com 48 h de antecedência. Consulte sabores pelo WhatsApp.'}
            </p>
            <button
              type="button"
              onClick={handleOpenCakesWhatsApp}
              className="mt-4 w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 rounded-2xl bg-wine hover:bg-wine-dark text-white text-base font-semibold transition-colors"
            >
              <MessageSquare size={17} aria-hidden="true" />
              <span>
                {currentLang === 'es' && 'Consultar torta por WhatsApp'}
                {currentLang === 'en' && 'Ask on WhatsApp'}
                {currentLang === 'pt' && 'Consultar pelo WhatsApp'}
              </span>
            </button>
          </div>
        )}

        <div className="mt-7 pt-4 border-t border-line/60 flex items-center justify-center gap-x-5 gap-y-2 text-sm text-muted flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gold/15 text-gold-dark border border-gold/40 inline-flex items-center justify-center">
              <WheatOff size={11} strokeWidth={2.2} />
            </span>
            <span>{currentLang === 'en' ? 'Gluten-free' : currentLang === 'pt' ? 'Sem glúten' : 'Sin TACC'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-900/10 text-emerald-800 border border-emerald-800/30 inline-flex items-center justify-center">
              <Leaf size={11} strokeWidth={2.2} />
            </span>
            <span>{currentLang === 'en' ? 'Vegan' : 'Vegano'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-wine/10 text-wine border border-wine/30 inline-flex items-center justify-center">
              <MilkOff size={11} strokeWidth={2.2} />
            </span>
            <span>{currentLang === 'en' ? 'Dairy-free' : currentLang === 'pt' ? 'Sem lactose' : 'Sin lactosa'}</span>
          </span>
        </div>

        <p className="text-center text-sm text-muted leading-relaxed mt-3">
          {currentLang === 'es' &&
            `Precios en pesos argentinos (ARS)${hasUsdPrices ? ', salvo las obras de arte, en dólares (USD)' : ''}. Si tenés alguna alergia, avisanos antes de pedir.`}
          {currentLang === 'en' &&
            `Prices in Argentine pesos (ARS)${hasUsdPrices ? ', except artworks, priced in US dollars (USD)' : ''}. Please tell our staff about any food allergy before ordering.`}
          {currentLang === 'pt' &&
            `Preços em pesos argentinos (ARS)${hasUsdPrices ? ', exceto as obras de arte, em dólares (USD)' : ''}. Se tiver alguma alergia, avise nossa equipe antes de pedir.`}
        </p>
      </main>

      <GroupReservationCard
        currentLang={currentLang}
        onOpenModal={() => {
          trackGroupModalOpen();
          setGroupModalOpen(true);
        }}
      />

      <GoogleReviewSection currentLang={currentLang} />

      <Footer currentLang={currentLang} hasUsdPrices={hasUsdPrices} />

      <TakeAwayPill currentLang={currentLang} onClick={handleOpenTakeAwayWhatsApp} />

      <ProductDetailModal
        item={selectedDetailItem}
        currentLang={currentLang}
        activeDietaryFilter={activeDietaryFilter}
        onClose={() => setSelectedDetailItem(null)}
      />

      <StaffModal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        onLoginSuccess={(role) => setCurrentRole(role)}
      />

      <WifiCardModal
        isOpen={wifiModalOpen}
        onClose={() => setWifiModalOpen(false)}
        currentLang={currentLang}
        wifiSSID={storeSettings.wifiSSID}
        wifiPassword={storeSettings.wifiPassword}
      />

      <GroupReservationModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        currentLang={currentLang}
        settings={storeSettings}
      />
    </div>
  );
}

export default App;
