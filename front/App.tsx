import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import {
  Language,
  DietaryTag,
  MenuItem,
  WeeklyDish,
  StoreSettings,
} from '../db/types';
import { CATEGORIES, INITIAL_MENU_ITEMS } from '../db/menuData';
import { WEEKLY_MENU_DISHES } from '../db/weeklyMenu';
import { CURRENT_STATE_VERSION, DEFAULT_STORE_SETTINGS } from '../db/storeSettings';
import { WheatOff, Leaf, MilkOff, MessageSquare, WifiOff } from 'lucide-react';

import { Header } from './layout/Header';
import { CategoryNav } from './layout/CategoryNav';
import { GroupReservationCard } from './layout/GroupReservationCard';
import { GoogleReviewSection } from './layout/GoogleReviewSection';
import { Footer } from './layout/Footer';

import { WeeklyMenuPill } from './menu/WeeklyMenuPill';
import { DietaryFilters } from './menu/DietaryFilters';
import { MenuItemCard } from './menu/MenuItemCard';

import { ProductDetailModal } from './modals/ProductDetailModal';
import { StaffModal } from './modals/StaffModal';
import { WifiCardModal } from './modals/WifiCardModal';
import { GroupReservationModal } from './modals/GroupReservationModal';

import {
  broadcastStateChange,
  clearLocalStateSnapshot,
  DorearSharedState,
  loadValidatedLocalState,
  saveLocalStateSnapshot,
  subscribeToRealtimeSync,
} from './utils/menuSync';
import { openWhatsAppChat } from './utils/securityAndFormat';

const BaristaPanel = lazy(() =>
  import('./staff/BaristaPanel').then((m) => ({ default: m.BaristaPanel }))
);
const AdminPanel = lazy(() =>
  import('./staff/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);

function buildDefaultState(): DorearSharedState {
  return {
    version: CURRENT_STATE_VERSION,
    updatedAt: Date.now(),
    items: INITIAL_MENU_ITEMS,
    weeklyDishes: WEEKLY_MENU_DISHES,
    weeklyOverrideDay: null,
    storeSettings: DEFAULT_STORE_SETTINGS,
  };
}

export function App() {
  const [currentLang, setCurrentLang] = useState<Language>('es');
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    CATEGORIES[0]?.id || 'cat-0'
  );
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<DietaryTag | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const [sharedState, setSharedState] = useState<DorearSharedState>(() =>
    loadValidatedLocalState({
      items: INITIAL_MENU_ITEMS,
      weeklyDishes: WEEKLY_MENU_DISHES,
      storeSettings: DEFAULT_STORE_SETTINGS,
    })
  );

  const { items, weeklyDishes, weeklyOverrideDay, storeSettings } = sharedState;

  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [wifiModalOpen, setWifiModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<'customer' | 'barista' | 'admin'>('customer');
  const [isLiveSync, setIsLiveSync] = useState<boolean>(false);

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

  const commitStateUpdate = useCallback(
    (updater: (prev: DorearSharedState) => Omit<DorearSharedState, 'version' | 'updatedAt'>) => {
      setSharedState((prev) => {
        const nextPartial = updater(prev);
        const nextState: DorearSharedState = {
          ...nextPartial,
          version: CURRENT_STATE_VERSION,
          updatedAt: Date.now(),
        };
        saveLocalStateSnapshot(nextState);
        broadcastStateChange(nextState);
        return nextState;
      });
    },
    []
  );

  const handleOpenTakeAwayWhatsApp = () => {
    const msg =
      currentLang === 'es'
        ? '¡Hola Dorear! 👋 Quiero hacer un pedido para retirar.'
        : currentLang === 'en'
        ? 'Hello Dorear! 👋 I would like to place an order for pickup.'
        : 'Olá Dorear! 👋 Gostaria de fazer um pedido para retirada.';
    openWhatsAppChat(storeSettings.whatsappNumber, msg);
  };

  const handleOpenCakesWhatsApp = () => {
    const msg =
      currentLang === 'es'
        ? '¡Hola Dorear! 👋 Quiero consultar para encargar una torta entera para festejo.'
        : currentLang === 'en'
        ? 'Hello Dorear! 👋 I would like to inquire about ordering a whole celebration cake.'
        : 'Olá Dorear! 👋 Gostaria de consultar sobre a encomenda de um bolo inteiro para comemoração.';
    openWhatsAppChat(storeSettings.whatsappNumber, msg);
  };

  const handleToggleAvailability = (itemId: string) => {
    commitStateUpdate((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item
      ),
    }));
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
        '¿Seguro que querés restaurar todos los platos, precios originales y fotos de Dorear en todos los dispositivos?'
      )
    ) {
      clearLocalStateSnapshot();
      setSharedState(buildDefaultState());
      broadcastStateChange({ reset: true });
    }
  };

  const handleExitStaff = () => {
    try {
      sessionStorage.removeItem('dorear_session_pin');
    } catch {
      // ignore storage errors
    }
    setCurrentRole('customer');
  };

  const handleSelectWeeklyDish = (dish: WeeklyDish) => {
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

  if (currentRole === 'barista') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-cream flex items-center justify-center text-xs text-muted">
            Cargando panel de barra...
          </div>
        }
      >
        <BaristaPanel
          categories={CATEGORIES}
          items={items}
          isLiveSync={isLiveSync}
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
          <div className="min-h-screen bg-cream flex items-center justify-center text-xs text-muted">
            Cargando panel de gestión...
          </div>
        }
      >
        <AdminPanel
          categories={CATEGORIES}
          items={items}
          weeklyDishes={weeklyDishes}
          weeklyOverrideDay={weeklyOverrideDay}
          isLiveSync={isLiveSync}
          onSetWeeklyOverrideDay={handleSetWeeklyOverrideDay}
          onUpdateItemPrice={handleUpdateItemPrice}
          onToggleAvailability={handleToggleAvailability}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onUpdateWeeklyDish={handleUpdateWeeklyDish}
          settings={storeSettings}
          onUpdateSettings={handleUpdateSettings}
          onResetDefaults={handleResetDefaults}
          onExit={handleExitStaff}
        />
      </Suspense>
    );
  }

  const activeCategory =
    CATEGORIES.find((c) => c.id === activeCategoryId) || CATEGORIES[0];
  const categoryItems = items.filter((item) => {
    const matchesCat = item.categoryId === activeCategoryId;
    const matchesDietary =
      !activeDietaryFilter ||
      (item.dietary && item.dietary.includes(activeDietaryFilter));
    return matchesCat && matchesDietary;
  });

  return (
    <div className="min-h-screen bg-cream text-ink font-sans selection:bg-gold/20 selection:text-ink pb-12 relative">
      {isOffline && (
        <div
          role="status"
          className="bg-wine text-white text-[11px] py-1.5 px-4 text-center flex items-center justify-center gap-1.5 font-medium"
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
        onSelectLang={setCurrentLang}
        onOpenStaffModal={() => setStaffModalOpen(true)}
        onOpenWifiModal={() => setWifiModalOpen(true)}
      />

      <WeeklyMenuPill
        dishes={weeklyDishes}
        overrideDay={weeklyOverrideDay}
        currentLang={currentLang}
        activeDietaryFilter={activeDietaryFilter}
        onSelectDish={handleSelectWeeklyDish}
      />

      <DietaryFilters
        currentLang={currentLang}
        activeFilter={activeDietaryFilter}
        onSelectFilter={setActiveDietaryFilter}
      />

      <CategoryNav
        categories={CATEGORIES}
        activeCategoryId={activeCategoryId}
        currentLang={currentLang}
        onSelectCategory={setActiveCategoryId}
      />

      <main className="max-w-xl mx-auto px-5 pt-7">
        <div className="flex items-start justify-between gap-4 mb-4 pb-2 border-b border-line/60">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase font-sans text-gold font-semibold">
              {currentLang === 'es' && 'Nuestra carta'}
              {currentLang === 'en' && 'Our Menu'}
              {currentLang === 'pt' && 'Nosso Cardápio'}
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl text-ink font-medium leading-tight mt-1">
              {activeCategory.name[currentLang]}
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed mt-1.5">
              {activeCategory.description[currentLang]}
            </p>
          </div>

          <span className="font-serif text-4xl sm:text-5xl text-line select-none font-normal">
            {String(activeCategory.order).padStart(2, '0')}
          </span>
        </div>

        <div className="space-y-1">
          {categoryItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              currentLang={currentLang}
              onOpenDetail={setSelectedDetailItem}
            />
          ))}

          {categoryItems.length === 0 && (
            <div className="py-12 text-center text-xs text-muted">
              {currentLang === 'es' &&
                'No encontramos opciones con este filtro en esta categoría.'}
              {currentLang === 'en' &&
                'No items found matching this filter in this category.'}
              {currentLang === 'pt' &&
                'Nenhuma opção encontrada com este filtro nesta categoria.'}
            </div>
          )}
        </div>

        {activeCategoryId === 'cat-2' && (
          <div className="mt-6 p-4 rounded-2xl bg-paper border border-line shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fade-in">
            <div>
              <h4 className="font-serif text-base sm:text-lg text-ink font-medium leading-snug">
                {currentLang === 'es' && '¿Querés encargar una Torta Entera?'}
                {currentLang === 'en' && 'Order a Whole Cake for Celebrations'}
                {currentLang === 'pt' && 'Encomende um Bolo Inteiro'}
              </h4>
              <p className="text-muted leading-relaxed text-xs mt-0.5">
                {currentLang === 'es' &&
                  'Elaboramos nuestras tortas de autor enteras para llevar con 48 hs de anticipación. Consultá sabores por WhatsApp.'}
                {currentLang === 'en' &&
                  'We craft our signature whole cakes for pickup with 48 hours notice. Inquire about flavors via WhatsApp.'}
                {currentLang === 'pt' &&
                  'Preparamos nossos bolos autorais inteiros para viagem com 48h de antecedência. Consulte sabores no WhatsApp.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCakesWhatsApp}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-wine hover:bg-wine-dark text-white font-medium transition-colors shrink-0 text-xs shadow-2xs self-end sm:self-auto"
            >
              <MessageSquare size={13} />
              <span>
                {currentLang === 'es' && 'Consultar Torta ↗'}
                {currentLang === 'en' && 'Inquire ↗'}
                {currentLang === 'pt' && 'Consultar ↗'}
              </span>
            </button>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-line/60 flex items-center justify-center gap-5 text-xs text-muted flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-gold/15 text-gold border border-gold/30 inline-flex items-center justify-center">
              <WheatOff size={9} strokeWidth={2.2} />
            </span>
            <span>Sin TACC</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-600/10 text-emerald-700 border border-emerald-600/30 inline-flex items-center justify-center">
              <Leaf size={9} strokeWidth={2.2} />
            </span>
            <span>
              {currentLang === 'es'
                ? 'Vegano'
                : currentLang === 'en'
                ? 'Vegan'
                : 'Vegano'}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-wine/10 text-wine border border-wine/30 inline-flex items-center justify-center">
              <MilkOff size={9} strokeWidth={2.2} />
            </span>
            <span>
              {currentLang === 'es'
                ? 'Sin Lactosa'
                : currentLang === 'en'
                ? 'Dairy-Free'
                : 'Sem Lactose'}
            </span>
          </span>
        </div>

        <p className="text-center text-[11px] text-muted leading-relaxed mt-2.5">
          {currentLang === 'es' &&
            'Precios expresados en pesos argentinos (ARS). Si tenés alguna alergia alimentaria, consultanos antes de ordenar.'}
          {currentLang === 'en' &&
            'Prices in Argentine Pesos (ARS). Please inform our staff of any food allergies prior to ordering.'}
          {currentLang === 'pt' &&
            'Preços em pesos argentinos (ARS). Se tiver alguma alergia alimentar, consulte nossa equipe antes de pedir.'}
        </p>
      </main>

      <GroupReservationCard
        currentLang={currentLang}
        onOpenModal={() => setGroupModalOpen(true)}
      />

      <GoogleReviewSection currentLang={currentLang} />

      <Footer currentLang={currentLang} />

      <div className="fixed bottom-5 right-5 z-40 animate-fade-in">
        <button
          type="button"
          onClick={handleOpenTakeAwayWhatsApp}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-xl hover:shadow-2xl transition-all font-sans text-xs font-semibold tracking-wide border border-emerald-600/40"
          title="Pedir por WhatsApp para retirar"
        >
          <MessageSquare size={15} />
          <span>
            {currentLang === 'es' && 'Pedir para llevar ↗'}
            {currentLang === 'en' && 'Order for pickup ↗'}
            {currentLang === 'pt' && 'Peça para levar ↗'}
          </span>
        </button>
      </div>

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
