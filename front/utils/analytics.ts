import { DietaryTag, Language, MenuItem, WeeklyDish } from '../../db/types';

// Tipos para las APIs globales de GA4 y Microsoft Clarity
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
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined;

let isInitialized = false;

/**
 * Inicializa Google Analytics 4 y Microsoft Clarity de forma dinámica.
 * Si los IDs no están configurados todavía (modo desarrollo o antes de tener el dominio),
 * el código sigue funcionando sin errores ni advertencias molestas.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // 1. Inicializar Google Analytics 4 si hay un ID configurado
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
 * Registra cuando un cliente hace click en un producto para ver su detalle/foto.
 * En GA4 genera el evento estándar e-commerce 'select_item'.
 * En Clarity etiqueta la sesión y genera un evento personalizado.
 */
export function trackProductClick(item: MenuItem, currentLang: Language, source = 'menu_card'): void {
  const productName = item.name[currentLang] || item.name.es;

  // Google Analytics 4
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'select_item', {
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
  }

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

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'select_item', {
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
  }

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', 'click_plato_semanal');
    window.clarity('set', 'plato_semanal', dishTitle);
  }
}

/**
 * Registra cambio de categoría (ej: "Cafetería", "Pastelería", etc.)
 */
export function trackCategoryChange(categoryId: string, categoryName: string): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'view_item_list', {
      item_list_id: categoryId,
      item_list_name: categoryName,
    });
  }

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('set', 'categoria_activa', categoryName);
  }
}

/**
 * Registra uso de filtros dietarios (Sin TACC, Vegano, Sin Lactosa).
 */
export function trackDietaryFilterChange(filter: DietaryTag | null): void {
  const filterLabel = filter || 'todos';

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'filter_menu', {
      dietary_filter: filterLabel,
    });
  }

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', `filtro_${filterLabel}`);
  }
}

/**
 * Registra cambio de idioma (ES, EN, PT).
 */
export function trackLanguageChange(lang: Language): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'change_language', {
      language: lang,
    });
  }
}

/**
 * Registra clicks en botones de WhatsApp (Conversión clave para la cafetería).
 */
export function trackWhatsAppClick(
  actionType: 'takeaway_order' | 'whole_cake_inquiry' | 'group_reservation'
): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      event_category: 'contact',
      event_label: actionType,
      value: actionType === 'group_reservation' ? 25000 : undefined,
      currency: 'ARS',
    });
  }

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', `whatsapp_${actionType}`);
  }
}

/**
 * Registra clicks al botón para dejar reseña en Google Maps.
 */
export function trackGoogleReviewClick(): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'click_google_review', {
      event_category: 'reputation',
      event_label: 'google_maps',
    });
  }

  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', 'click_google_review');
  }
}

/**
 * Registra cuando un cliente abre el modal con datos del Wi-Fi del salón.
 */
export function trackWifiModalOpen(): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'view_wifi_info', {
      event_category: 'amenity',
    });
  }
}
