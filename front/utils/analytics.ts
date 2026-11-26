import { DietaryTag, Language, MenuItem, WeeklyDish } from '../../db/types';

// Tipos para las APIs globales de GTM/GA4 y Microsoft Clarity
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: {
      (command: 'set', key: string, value: string | string[]): void;
      (command: 'event', eventName: string): void;
      (command: 'identify', customId: string, customSessionId?: string, customPageId?: string, friendlyName?: string): void;
      (command: string, ...args: unknown[]): void;
      q?: unknown[];
    };
  }
}

// Variables de entorno (con fallback seguro)
// IDs públicos de DOREAR (viajan igual en los scripts). Se pueden cambiar en Vercel.
// GA4 se carga directo desde acá: NO agregar otra "Etiqueta de Google" con este ID
// dentro de GTM, o cada visita se cuenta dos veces.
const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) || 'G-472KGR0G5F';
// GTM queda para etiquetas futuras (Ads, píxeles). Recibe los mismos eventos por dataLayer.
const GTM_ID = (import.meta.env.VITE_GTM_ID as string | undefined) || 'GTM-MNR3WNTT';
const useGtm = Boolean(GTM_ID && GTM_ID.trim() !== '');
// El Project ID de Clarity es público (viaja igual en el script), así que dejamos el de
// DOREAR como valor por defecto. Se puede cambiar con VITE_CLARITY_PROJECT_ID en Vercel.
const CLARITY_ID =
  (import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined) || 'zifq7rheer';

let isInitialized = false;

/**
 * Inicializa Google Analytics 4 y Microsoft Clarity de forma dinámica.
 * Si los IDs no están configurados todavía (modo desarrollo o antes de tener el dominio),
 * el código sigue funcionando sin errores ni advertencias molestas.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // Clarity y GA se cargan recién cuando la página terminó de cargar y el navegador
  // está libre, para que no compitan con el primer dibujo de la carta.
  const start = () => loadAnalyticsScripts();
  const whenIdle = () =>
    'requestIdleCallback' in window
      ? (window as Window & { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback(start, { timeout: 3000 })
      : setTimeout(start, 1500);
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}

function loadAnalyticsScripts(): void {
  // 1a. Google Tag Manager (snippet oficial, versión sin script inline para la CSP)
  if (useGtm) {
    const existingGtm = document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${GTM_ID}"]`);
    if (!existingGtm) {
      window.dataLayer = window.dataLayer || [];
      // Este evento es el que dispara los activadores "All Pages" / "Initialization" de GTM
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      document.head.appendChild(script);
    }
  }

  // 1b. Google Analytics 4 directo (comparte el dataLayer con GTM, eso está soportado)
  if (GA_ID && GA_ID.trim() !== '') {
    const existingGtag = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`);
    if (!existingGtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, {
        send_page_view: true,
        // Respeta la privacidad y cookies
        cookie_flags: 'SameSite=None;Secure',
      });

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
    }
  }

  // 2. Inicializar Microsoft Clarity si hay un ID configurado
  if (CLARITY_ID && CLARITY_ID.trim() !== '') {
    const existingClarity = document.querySelector(`script[src*="clarity.ms/tag/${CLARITY_ID}"]`);
    if (!existingClarity) {
      (function (c: Window, l: Document, a: string, r: string, i: string) {
        c[a as 'clarity'] =
          c[a as 'clarity'] ||
          function () {
            // eslint-disable-next-line prefer-rest-params
            ((c[a as 'clarity'] as unknown as { q: unknown[] }).q =
              (c[a as 'clarity'] as unknown as { q: unknown[] }).q || []).push(arguments);
          };
        const t = l.createElement(r) as HTMLScriptElement;
        t.async = true;
        t.src = `https://www.clarity.ms/tag/${i}`;
        const y = l.getElementsByTagName(r)[0];
        y?.parentNode?.insertBefore(t, y);
      })(window, document, 'clarity', 'script', CLARITY_ID);
    }
  }
}

/**
 * Manda un evento a Google:
 * - a GA4 por gtag (es lo que aparece en los informes de Analytics);
 * - a GTM como { event: 'nombre', ... }, para usarlo de activador en etiquetas futuras.
 *   Ese push no llega a GA4 por sí solo, así que no duplica.
 */
function sendGoogleEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
  if (useGtm) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...params });
  }
}

/**
 * Registra cuando un cliente hace click en un producto para ver su detalle/foto.
 * En GA4 genera el evento estándar e-commerce 'select_item'.
 * En Clarity etiqueta la sesión y genera un evento personalizado.
 */
export function trackProductClick(item: MenuItem, currentLang: Language, source = 'menu_card'): void {
  const productName = item.name[currentLang] || item.name.es;

  // Google Analytics 4
  sendGoogleEvent('select_item', {
    item_list_name: item.categoryId,
    content_type: 'product',
    items: [
      {
        item_id: item.id,
        item_name: productName,
        item_category: item.categoryId,
        price: item.price,
        quantity: 1,
      },
    ],
    source,
  });

  // Microsoft Clarity
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', 'click_producto');
    window.clarity('set', 'ultimo_producto_visto', productName);
  }
}

/**
 * Registra cuando un cliente hace click en el plato del día semanal.
 */
export function trackWeeklyDishClick(dish: WeeklyDish, currentLang: Language): void {
  const dishTitle = dish.title[currentLang] || dish.title.es;

  sendGoogleEvent('select_item', {
    item_list_name: 'plato_semanal',
    content_type: 'weekly_dish',
    items: [
      {
        item_id: `weekly-${dish.dayNumber}`,
        item_name: dishTitle,
        item_category: 'plato_del_dia',
        price: dish.priceDineIn,
      },
    ],
  });

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', 'click_plato_semanal');
    window.clarity('set', 'plato_semanal', dishTitle);
  }
}

/**
 * Registra cambio de categoría (ej: "Cafetería", "Pastelería", etc.)
 */
export function trackCategoryChange(categoryId: string, categoryName: string): void {
  sendGoogleEvent('view_item_list', {
    item_list_id: categoryId,
    item_list_name: categoryName,
  });

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', 'categoria_elegida');
    window.clarity('set', 'categoria_activa', categoryName);
  }
}

/**
 * Registra uso de filtros dietarios (Sin TACC, Vegano, Sin Lactosa).
 */
export function trackDietaryFilterChange(filter: DietaryTag | null): void {
  const filterLabel = filter || 'todos';

  sendGoogleEvent('filter_menu', {
    dietary_filter: filterLabel,
  });

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', `filtro_${filterLabel}`);
  }
}

/**
 * Registra cambio de idioma (ES, EN, PT).
 */
export function trackLanguageChange(lang: Language): void {
  sendGoogleEvent('change_language', {
    language: lang,
  });

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', `idioma_${lang}`);
    window.clarity('set', 'idioma', lang);
  }
}

/**
 * Registra una búsqueda (se llama con un pequeño retraso, cuando la persona dejó de tipear).
 * Las búsquedas sin resultados son las más valiosas: muestran qué buscan y la carta no tiene
 * (o tiene con otro nombre). En Clarity se pueden filtrar grabaciones por este evento.
 */
export function trackSearch(query: string, resultCount: number): void {
  const term = query.trim().toLowerCase().slice(0, 60);
  if (!term) return;

  sendGoogleEvent('search', { search_term: term, results: resultCount });

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', resultCount === 0 ? 'busqueda_sin_resultados' : 'busqueda');
    window.clarity('set', resultCount === 0 ? 'busqueda_sin_resultados' : 'busqueda', term);
  }
}

/**
 * Corta la grabación de Clarity de esta sesión antes de abrir el acceso del personal.
 * El PIN se marca tocando un teclado en pantalla: aunque los números estén ocultos,
 * la posición de los toques podría delatarlo. Clarity no tiene pausa documentada;
 * "stop" termina la grabación de la sesión (es una sesión de personal, no de cliente).
 */
export function stopRecordingForStaff(): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('stop');
  }
}

/** Registra cuando alguien abre la semana completa del menú ejecutivo. */
export function trackWeeklySheetOpen(): void {
  sendGoogleEvent('menu_ejecutivo_semana_abierta');
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', 'menu_ejecutivo_semana_abierta');
  }
}

/** Registra cuando alguien abre el formulario de mesas grandes y festejos. */
export function trackGroupModalOpen(): void {
  sendGoogleEvent('reserva_grupo_abierta');
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', 'reserva_grupo_abierta');
  }
}

/**
 * Registra clicks en botones de WhatsApp (Conversión clave para la cafetería).
 */
export function trackWhatsAppClick(
  actionType: 'takeaway_order' | 'whole_cake_inquiry' | 'group_reservation'
): void {
  sendGoogleEvent('generate_lead', {
    event_category: 'contact',
    event_label: actionType,
    value: actionType === 'group_reservation' ? 25000 : undefined,
    currency: 'ARS',
  });

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', `whatsapp_${actionType}`);
  }
}

/**
 * Registra clicks al botón para dejar reseña en Google Maps.
 */
export function trackGoogleReviewClick(): void {
  sendGoogleEvent('click_google_review', {
    event_category: 'reputation',
    event_label: 'google_maps',
  });

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', 'click_google_review');
  }
}

/**
 * Registra cuando un cliente abre el modal con datos del Wi-Fi del salón.
 */
export function trackWifiModalOpen(): void {
  sendGoogleEvent('view_wifi_info', {
    event_category: 'amenity',
  });

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', 'wifi_abierto');
  }
}
