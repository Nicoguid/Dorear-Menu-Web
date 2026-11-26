import type { Plugin } from 'vite';
import { CATEGORIES, INITIAL_MENU_ITEMS } from '../db/menuData';
import { WEEKLY_MENU_DISHES } from '../db/weeklyMenu';
import { DEFAULT_STORE_SETTINGS } from '../db/storeSettings';
import { validateSharedStatePayload } from '../db/stateValidation';
import { BUSINESS_INFO, minutesToHHMM } from '../db/businessInfo';
import { formatDishTitle } from '../front/utils/securityAndFormat';
import { categorySlug, LANGUAGE_PATHS } from '../db/urlState';
import { getFixedUsdPrice } from '../db/fixedPrices';
import type { Language, DietaryTag, MenuCategory, MenuItem, StoreSettings, WeeklyDish } from '../db/types';

/**
 * SEO y visibilidad para agentes de IA.
 *
 * La carta es una app de React: sin esto, el HTML que recibe un buscador o un agente
 * (ChatGPT, Perplexity, Claude…) es un <div id="root"></div> vacío. En cada build:
 *   1. Lee la carta real desde Supabase (la misma fila que edita la dueña en el panel).
 *      Si no hay conexión, usa los datos de db/.
 *   2. Escribe la carta completa en HTML dentro de #root (React la reemplaza al cargar).
 *   3. Agrega JSON-LD (CafeOrCoffeeShop + Menu) en el <head>.
 *   4. Genera robots.txt, sitemap.xml, llms.txt y carta.md.
 *
 * Los precios quedan "congelados" al momento del build: conviene redeployar cuando la
 * dueña cambia precios (ver README, sección Deploy Hook).
 */

interface MenuSnapshot {
  categories: MenuCategory[];
  items: MenuItem[];
  weeklyDishes: WeeklyDish[];
  settings: StoreSettings;
  source: 'supabase' | 'local';
  generatedAt: Date;
}

const env =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://ilwrrtmrtyrdwmkstflh.supabase.co';
const SUPABASE_ANON_KEY =
  env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_WUAIY6_zm2cTS7uvm4GMAA_f3PKt6GD';

const SITE = BUSINESS_INFO.siteUrl;

const DIET_LABEL: Record<DietaryTag, string> = {
  sin_tacc: 'Sin TACC',
  vegano: 'Vegano',
  sin_lactosa: 'Sin lactosa',
};

const DIET_SCHEMA: Record<DietaryTag, string> = {
  sin_tacc: 'https://schema.org/GlutenFreeDiet',
  vegano: 'https://schema.org/VeganDiet',
  sin_lactosa: 'https://schema.org/LowLactoseDiet',
};

const priceFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});
const ars = (n: number) => priceFormatter.format(Math.round(n)).replace(/\u00a0/g, ' ');
const usdFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
/** Precio de un plato con su moneda (pesos por defecto, o dólares si así se cargó). */
const itemPrice = (item: MenuItem) => {
  const fixedUsd = getFixedUsdPrice(item);
  return fixedUsd ? `${usdFormatter.format(fixedUsd).replace(/[^\d.,]/g, '')} USD` : ars(item.price);
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Evita que un texto de la carta cierre el <script> del JSON-LD. */
function safeJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

async function loadMenuSnapshot(): Promise<MenuSnapshot> {
  const local: MenuSnapshot = {
    categories: CATEGORIES,
    items: INITIAL_MENU_ITEMS,
    weeklyDishes: WEEKLY_MENU_DISHES,
    settings: DEFAULT_STORE_SETTINGS,
    source: 'local',
    generatedAt: new Date(),
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/dorear_state?id=eq.current&select=state`,
      {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = (await res.json()) as { state?: unknown }[];
    const validated = validateSharedStatePayload(rows?.[0]?.state);
    if (!validated) throw new Error('estado vacío o inválido');
    return {
      categories: validated.categories || CATEGORIES,
      items: validated.items,
      weeklyDishes: validated.weeklyDishes,
      settings: validated.storeSettings,
      source: 'supabase',
      generatedAt: new Date(),
    };
  } catch (error) {
    console.warn(
      `[dorear-seo] No se pudo leer la carta de Supabase (${
        error instanceof Error ? error.message : String(error)
      }). Uso los datos locales de db/.`
    );
    return local;
  }
}

function sortedCategories(snapshot: MenuSnapshot): MenuCategory[] {
  return [...snapshot.categories]
    .sort((a, b) => a.order - b.order)
    .filter((c) => snapshot.items.some((i) => i.categoryId === c.id));
}

function itemsOf(snapshot: MenuSnapshot, categoryId: string): MenuItem[] {
  return snapshot.items.filter((i) => i.categoryId === categoryId);
}

/** Mismo formato de título que muestra la carta en pantalla. */
const title = (raw: string) => formatDishTitle(raw);

function phoneE164(settings: StoreSettings): string | undefined {
  const digits = settings.whatsappNumber.replace(/\D/g, '');
  return digits ? `+${digits}` : undefined;
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

function buildJsonLd(snapshot: MenuSnapshot) {
  const { address, hours } = BUSINESS_INFO;
  const cafeId = `${SITE}/#cafe`;
  const menuId = `${SITE}/#carta`;

  const sections = sortedCategories(snapshot).map((cat) => ({
    '@type': 'MenuSection',
    name: cat.name.es,
    description: cat.description.es || undefined,
    hasMenuItem: itemsOf(snapshot, cat.id).map((item) => ({
      '@type': 'MenuItem',
      name: title(item.name.es),
      description: item.description.es || undefined,
      offers: getFixedUsdPrice(item)
        ? { '@type': 'Offer', price: getFixedUsdPrice(item), priceCurrency: 'USD' }
        : { '@type': 'Offer', price: item.price, priceCurrency: 'ARS' },
      suitableForDiet: item.dietary?.length
        ? item.dietary.map((d) => DIET_SCHEMA[d])
        : undefined,
    })),
  }));

  if (snapshot.weeklyDishes.length > 0) {
    sections.unshift({
      '@type': 'MenuSection',
      name: 'Menú ejecutivo del mediodía',
      description:
        'De lunes a viernes. Incluye bebida y café a elección. Precio en salón; para llevar tiene otro precio.',
      hasMenuItem: snapshot.weeklyDishes.map((dish) => ({
        '@type': 'MenuItem',
        name: `${dish.dayName.es}: ${title(dish.title.es)}`,
        description: dish.description.es || undefined,
        offers: { '@type': 'Offer', price: dish.priceDineIn, priceCurrency: 'ARS' },
        suitableForDiet: dish.dietary?.length
          ? dish.dietary.map((d) => DIET_SCHEMA[d])
          : undefined,
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CafeOrCoffeeShop', 'Bakery'],
        '@id': cafeId,
        name: BUSINESS_INFO.name,
        alternateName: ['Dorear', 'Dorear Café', 'Dorear Puerto Madero'],
        description: BUSINESS_INFO.description,
        url: `${SITE}/`,
        image: `${SITE}/og-image.png`,
        logo: `${SITE}/favicon.svg`,
        // Sin `telephone`: el WhatsApp de pedidos tiene característica 2364 y todavía no
        // confirmamos qué teléfono figura en el perfil de Google. Agregarlo cuando coincida.
        address: {
          '@type': 'PostalAddress',
          streetAddress: address.street,
          addressLocality: `${address.neighborhood}, ${address.city}`,
          addressRegion: address.region,
          addressCountry: address.country,
        },
        hasMap: BUSINESS_INFO.mapsUrl,
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: minutesToHHMM(hours.weekday.open),
            closes: minutesToHHMM(hours.weekday.close),
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Saturday', 'Sunday'],
            opens: minutesToHHMM(hours.weekend.open),
            closes: minutesToHHMM(hours.weekend.close),
          },
        ],
        servesCuisine: [
          'Café de especialidad',
          'Pastelería de autor',
          'Panadería de masa madre',
          'Desayunos y meriendas',
          'Brunch',
        ],
        currenciesAccepted: 'ARS',
        acceptsReservations: true,
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi para clientes', value: true },
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Opciones sin TACC, veganas y sin lactosa',
            value: true,
          },
        ],
        founder: { '@type': 'Person', name: BUSINESS_INFO.founder, jobTitle: 'Pastelera' },
        sameAs: [BUSINESS_INFO.instagramUrl],
        hasMenu: { '@id': menuId },
      },
      {
        '@type': 'Menu',
        '@id': menuId,
        name: 'Carta de DOREAR',
        url: `${SITE}/`,
        inLanguage: 'es-AR',
        hasMenuSection: sections,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#web`,
        url: `${SITE}/`,
        name: 'DOREAR · Carta digital',
        inLanguage: 'es-AR',
        publisher: { '@id': cafeId },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// HTML estático dentro de #root
// ---------------------------------------------------------------------------

const STATIC_TEXT: Record<
  Language,
  {
    subtitle: string;
    tagline: string;
    navLabel: string;
    intro: string;
    weeklyTitle: string;
    weeklyNote: string;
    takeAway: string;
    ordersTitle: string;
    orders: (groupPrice: string) => string;
    directions: string;
    weekdays: string;
    weekend: string;
    diet: Record<DietaryTag, string>;
  }
> = {
  es: {
    subtitle: 'Pastelería de autor · Café de especialidad',
    tagline: 'Que espere todo, este ratito es tuyo',
    navLabel: 'Categorías de la carta',
    intro:
      'Carta de DOREAR, café de especialidad y pastelería de autor en Rosario Vera Peñaloza 460, Puerto Madero, Buenos Aires. Precios finales en pesos argentinos (ARS).',
    weeklyTitle: 'Menú ejecutivo del mediodía',
    weeklyNote: 'Lunes a viernes. Incluye bebida y café a elección.',
    takeAway: 'Para llevar',
    ordersTitle: 'Encargos y grupos',
    orders: (p) =>
      `Tortas enteras para festejos con 48 horas de anticipación, por WhatsApp. Mesas para grupos de 5 a 16 personas con Merienda Degustación de autor (menú fijo, ${p} por persona, con seña).`,
    directions: 'Cómo llegar en Google Maps',
    weekdays: 'Lunes a viernes',
    weekend: 'Sábados y domingos',
    diet: DIET_LABEL,
  },
  en: {
    subtitle: 'Signature pastry · Specialty coffee',
    tagline: 'Let everything wait, this moment is yours',
    navLabel: 'Menu categories',
    intro:
      'Menu of DOREAR, a specialty coffee shop and signature pastry bakery at Rosario Vera Peñaloza 460, Puerto Madero, Buenos Aires. Final prices in Argentine pesos (ARS).',
    weeklyTitle: 'Executive lunch menu',
    weeklyNote: 'Monday to Friday. Drink and coffee included.',
    takeAway: 'Take away',
    ordersTitle: 'Cake orders and groups',
    orders: (p) =>
      `Whole celebration cakes with 48 hours notice, via WhatsApp. Tables for groups of 5 to 16 with our signature Tasting Merienda (fixed menu, ${p} per person, deposit required).`,
    directions: 'Directions on Google Maps',
    weekdays: 'Monday to Friday',
    weekend: 'Saturday and Sunday',
    diet: { sin_tacc: 'Gluten-free', vegano: 'Vegan', sin_lactosa: 'Dairy-free' },
  },
  pt: {
    subtitle: 'Confeitaria autoral · Café especial',
    tagline: 'Que tudo espere, este momento é seu',
    navLabel: 'Categorias do cardápio',
    intro:
      'Cardápio da DOREAR, cafeteria de café especial e confeitaria autoral na Rosario Vera Peñaloza 460, Puerto Madero, Buenos Aires. Preços finais em pesos argentinos (ARS).',
    weeklyTitle: 'Menu executivo do almoço',
    weeklyNote: 'Segunda a sexta. Bebida e café incluídos.',
    takeAway: 'Para levar',
    ordersTitle: 'Encomendas e grupos',
    orders: (p) =>
      `Bolos inteiros para comemorações com 48 horas de antecedência, pelo WhatsApp. Mesas para grupos de 5 a 16 pessoas com lanche degustação autoral (menu fixo, ${p} por pessoa, com sinal).`,
    directions: 'Como chegar no Google Maps',
    weekdays: 'Segunda a sexta',
    weekend: 'Sábado e domingo',
    diet: { sin_tacc: 'Sem glúten', vegano: 'Vegano', sin_lactosa: 'Sem lactose' },
  },
};

const pick = (value: { es: string; en: string; pt: string }, lang: Language) =>
  value[lang]?.trim() || value.es;

function hoursLabel(lang: Language, h: { open: number; close: number; label: string }) {
  return lang === 'es' ? h.label : `${minutesToHHMM(h.open)}–${minutesToHHMM(h.close)}`;
}

function buildStaticMenuHtml(snapshot: MenuSnapshot, lang: Language = 'es'): string {
  const { address, hours } = BUSINESS_INFO;
  const t = STATIC_TEXT[lang];
  const cats = sortedCategories(snapshot);
  const base = LANGUAGE_PATHS[lang];

  const dietText = (tags?: DietaryTag[]) =>
    tags && tags.length
      ? ` <small class="text-sm text-muted">(${tags.map((d) => t.diet[d]).join(', ')})</small>`
      : '';

  const nav = cats
    .map(
      (c) =>
        `<a href="${base}?cat=${categorySlug(c)}" class="whitespace-nowrap h-11 px-4 inline-flex items-center rounded-full border border-line bg-paper/70 text-base">${escapeHtml(
          pick(c.name, lang)
        )}</a>`
    )
    .join('');

  const row = (name: string, desc: string, price: string, diet?: DietaryTag[]) =>
    `<li class="py-3 border-b border-line/70 flex justify-between gap-4"><div><h3 class="font-serif text-[1.5rem] font-semibold leading-tight">${escapeHtml(
      name
    )}${dietText(diet)}</h3>${
      desc ? `<p class="text-base text-muted leading-relaxed">${escapeHtml(desc)}</p>` : ''
    }</div><span class="text-right text-gold-dark font-semibold whitespace-nowrap">${price}</span></li>`;

  const weekly = snapshot.weeklyDishes.length
    ? `<section id="menu-ejecutivo" class="mt-6"><h2 class="font-serif text-[2rem] leading-tight">${t.weeklyTitle}</h2>
<p class="font-serif italic text-[1.1rem] text-muted">${t.weeklyNote}</p>
<ul>${snapshot.weeklyDishes
        .map((d) =>
          row(
            `${pick(d.dayName, lang)}: ${title(pick(d.title, lang))}`,
            pick(d.description, lang),
            `${ars(d.priceDineIn)}<br><small class="text-muted">${t.takeAway} ${ars(d.priceTakeAway)}</small>`,
            d.dietary
          )
        )
        .join('')}</ul></section>`
    : '';

  const sections = cats
    .map((cat) => {
      const rows = itemsOf(snapshot, cat.id)
        .map((item) => row(title(pick(item.name, lang)), pick(item.description, lang), itemPrice(item), item.dietary))
        .join('');
      const desc = pick(cat.description, lang);
      return `<section id="${categorySlug(cat)}" class="mt-8"><h2 class="font-serif text-[2rem] leading-tight">${escapeHtml(
        pick(cat.name, lang)
      )}</h2>${
        desc ? `<p class="font-serif italic text-[1.1rem] text-muted">${escapeHtml(desc)}</p>` : ''
      }<ul>${rows}</ul></section>`;
    })
    .join('');

  return `<div class="max-w-xl mx-auto px-5 pb-16 text-ink">
<header class="text-center pt-12 pb-4">
<h1 translate="no" class="font-serif text-[min(2.6rem,12vw)] tracking-[0.2em] text-gold-dark">DOREAR</h1>
<p class="text-sm text-muted">${t.subtitle}<br>Puerto Madero, Buenos Aires</p>
<p class="font-serif italic text-[1.4rem] mt-2">${t.tagline} <span class="not-italic text-gold">♥</span></p>
<p class="font-serif italic text-[17px] text-gold-dark">Agustina Ramírez</p>
</header>
<nav aria-label="${t.navLabel}" class="flex gap-2 overflow-x-auto no-scrollbar py-2">${nav}</nav>
<main>
<p class="text-base text-muted mt-4">${t.intro}</p>
${weekly}${sections}
<section class="mt-8 text-base text-muted">
<h2 class="font-serif text-2xl text-ink">${t.ordersTitle}</h2>
<p>${t.orders(ars(snapshot.settings.groupMenuPricePerPerson))}</p>
</section>
</main>
<footer class="mt-8 text-base text-muted">
<address class="not-italic">${escapeHtml(address.street)}, ${escapeHtml(address.neighborhood)}, CABA · <a href="${escapeHtml(
    BUSINESS_INFO.mapsUrl
  )}">${t.directions}</a></address>
<p>${t.weekdays}: ${hoursLabel(lang, hours.weekday)} · ${t.weekend}: ${hoursLabel(lang, hours.weekend)}</p>
<p>Instagram <a href="${BUSINESS_INFO.instagramUrl}">${BUSINESS_INFO.instagramHandle}</a></p>
</footer>
</div>`;
}

// ---------------------------------------------------------------------------
// Archivos para agentes: carta.md y llms.txt
// ---------------------------------------------------------------------------

function buildCartaMarkdown(snapshot: MenuSnapshot): string {
  const { address, hours } = BUSINESS_INFO;
  const date = snapshot.generatedAt.toISOString().slice(0, 10);
  const diet = (tags?: DietaryTag[]) =>
    tags && tags.length ? ` _(${tags.map((t) => DIET_LABEL[t]).join(', ')})_` : '';
  const lines: string[] = [
    '# Carta de DOREAR',
    '',
    `Café de especialidad y pastelería de autor de ${BUSINESS_INFO.founder} en ${address.street}, ${address.neighborhood}, Buenos Aires.`,
    snapshot.items.some((i) => getFixedUsdPrice(i) !== undefined)
      ? `Precios finales en pesos argentinos (ARS), IVA incluido, salvo las obras de arte, en dólares (USD). Actualizado el ${date}.`
      : `Precios finales en pesos argentinos (ARS), IVA incluido. Actualizado el ${date}.`,
    '',
    `- Horarios: lunes a viernes ${hours.weekday.label}; sábados y domingos ${hours.weekend.label}.`,
    `- Cómo llegar: ${BUSINESS_INFO.mapsUrl}`,
    `- Instagram: ${BUSINESS_INFO.instagramUrl}`,
    `- Pedidos para llevar, tortas enteras y reservas: WhatsApp ${phoneE164(snapshot.settings) || ''}`,
    '',
  ];

  if (snapshot.weeklyDishes.length) {
    lines.push('## Menú ejecutivo del mediodía', '', 'Lunes a viernes. Incluye bebida y café a elección.', '');
    for (const d of snapshot.weeklyDishes) {
      lines.push(
        `- **${d.dayName.es}: ${title(d.title.es)}**${diet(d.dietary)} — salón ${ars(d.priceDineIn)}, para llevar ${ars(
          d.priceTakeAway
        )}${d.description.es ? `. ${d.description.es}` : ''}`
      );
    }
    lines.push('');
  }

  for (const cat of sortedCategories(snapshot)) {
    lines.push(`## ${cat.name.es}`, '');
    if (cat.description.es) lines.push(cat.description.es, '');
    for (const item of itemsOf(snapshot, cat.id)) {
      lines.push(
        `- **${title(item.name.es)}**${diet(item.dietary)} — ${itemPrice(item)}${
          item.description.es ? `. ${item.description.es}` : ''
        }`
      );
    }
    lines.push('');
  }

  lines.push(
    '## Encargos y grupos',
    '',
    '- Tortas enteras para festejos: con 48 horas de anticipación, por WhatsApp.',
    `- Mesas grandes (5 a 16 personas): Merienda Degustación de autor, menú fijo de ${ars(
      snapshot.settings.groupMenuPricePerPerson
    )} por persona. Se confirma con seña.`,
    '',
    '## Alérgenos',
    '',
    'En el obrador se manipulan harinas con gluten, frutos secos, lácteos y huevo. Hay productos elaborados sin ingredientes con gluten, pero no se puede garantizar la ausencia total de contaminación cruzada.',
    ''
  );
  return lines.join('\n');
}

function buildLlmsTxt(snapshot: MenuSnapshot): string {
  const { address, hours } = BUSINESS_INFO;
  const cats = sortedCategories(snapshot)
    .map((c) => c.name.es)
    .join(', ');
  return `# DOREAR

> Café de especialidad y pastelería de autor en Puerto Madero, Buenos Aires (${address.street}). Recetas caseras de la pastelera ${BUSINESS_INFO.founder}. Opciones sin TACC, veganas y sin lactosa. Carta en español, inglés y portugués.

- Dirección: ${address.street}, ${address.neighborhood}, Ciudad Autónoma de Buenos Aires, Argentina
- Horarios: lunes a viernes ${hours.weekday.label}; sábados y domingos ${hours.weekend.label}
- Categorías de la carta: ${cats}
- Pedidos para llevar, tortas enteras (48 h de anticipación) y reservas para grupos de 5 a 16 personas: por WhatsApp
- Instagram: ${BUSINESS_INFO.instagramHandle}

## Carta

- [Carta completa con precios](${SITE}/carta.md): todos los productos, descripciones, opciones dietarias y precios en ARS, actualizada en cada publicación.
- [Carta digital interactiva](${SITE}/): la que se abre con el QR de las mesas.
- [Menu in English](${SITE}/en/) · [Cardápio em português](${SITE}/pt/)

## Cómo llegar

- [Google Maps](${BUSINESS_INFO.mapsUrl})
`;
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

const PAGE_META: Record<Language, { htmlLang: string; ogLocale: string; title: string; description: string }> = {
  es: {
    htmlLang: 'es-AR',
    ogLocale: 'es_AR',
    title: 'DOREAR · Café de especialidad y pastelería de autor en Puerto Madero | Carta',
    description:
      'Carta de DOREAR: café de especialidad y pastelería de autor en Puerto Madero (Rosario Vera Peñaloza 460). Tortas, desayunos, meriendas, brunch y masa madre, con opciones sin TACC y veganas. Precios en pesos.',
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    title: 'DOREAR · Specialty coffee & signature pastry in Puerto Madero | Menu',
    description:
      'Menu of DOREAR, specialty coffee and signature pastry in Puerto Madero, Buenos Aires (Rosario Vera Peñaloza 460). Cakes, breakfast, brunch and sourdough, with gluten-free and vegan options. Prices in Argentine pesos.',
  },
  pt: {
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    title: 'DOREAR · Café especial e confeitaria autoral em Puerto Madero | Cardápio',
    description:
      'Cardápio da DOREAR, café especial e confeitaria autoral em Puerto Madero, Buenos Aires (Rosario Vera Peñaloza 460). Bolos, café da manhã, brunch e pão de fermentação natural, com opções sem glúten e veganas. Preços em pesos argentinos.',
  },
};

const HREFLANG_LINKS = [
  `<link rel="alternate" hreflang="es-AR" href="${SITE}/" />`,
  `<link rel="alternate" hreflang="en" href="${SITE}/en/" />`,
  `<link rel="alternate" hreflang="pt-BR" href="${SITE}/pt/" />`,
  `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`,
].join('\n    ');

const escapeAttr = (v: string) => escapeHtml(v);

/** A partir del HTML final en español, arma la versión de otro idioma. */
function localizeHtml(esHtml: string, esRoot: string, lang: Language, root: string): string {
  const m = PAGE_META[lang];
  const url = `${SITE}${LANGUAGE_PATHS[lang]}`;
  return esHtml
    .replace(/<html lang="[^"]*"/, `<html lang="${m.htmlLang}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(m.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeAttr(m.description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeAttr(m.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeAttr(m.description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${m.ogLocale}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(esRoot, root);
}

export function dorearSeoPlugin(): Plugin {
  let snapshot: MenuSnapshot | null = null;
  let isBuild = false;

  const getSnapshot = async () => {
    if (!snapshot) {
      snapshot = isBuild
        ? await loadMenuSnapshot()
        : {
            categories: CATEGORIES,
            items: INITIAL_MENU_ITEMS,
            weeklyDishes: WEEKLY_MENU_DISHES,
            settings: DEFAULT_STORE_SETTINGS,
            source: 'local',
            generatedAt: new Date(),
          };
    }
    return snapshot;
  };

  return {
    name: 'dorear-seo',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    transformIndexHtml: {
      order: 'post',
      async handler(html, ctx) {
        const snap = await getSnapshot();
        const jsonLd = `<script type="application/ld+json">${safeJson(buildJsonLd(snap))}</script>`;
        // Precarga la fuente del logo (el elemento más grande de la primera pantalla).
        const logoFont = ctx.bundle
          ? Object.keys(ctx.bundle).find((f) => /cormorant-garamond-latin-400-normal.*\.woff2$/.test(f))
          : undefined;
        const preload = logoFont
          ? `<link rel="preload" href="/${logoFont}" as="font" type="font/woff2" crossorigin>\n    `
          : '';
        return html
          .replace('</head>', `    ${HREFLANG_LINKS}\n    ${preload}${jsonLd}\n  </head>`)
          .replace('<div id="root"></div>', `<div id="root">${buildStaticMenuHtml(snap)}</div>`);
      },
    },
    generateBundle: {
      order: 'post',
      async handler(_options, bundle) {
        const snap = await getSnapshot();
        const lastmod = snap.generatedAt.toISOString().slice(0, 10);

        // Versiones /en/ y /pt/: mismo HTML final, con textos, metadatos y carta traducidos.
        const indexAsset = bundle['index.html'];
        if (indexAsset && indexAsset.type === 'asset') {
          const esHtml = String(indexAsset.source);
          const esRoot = buildStaticMenuHtml(snap, 'es');
          for (const lang of ['en', 'pt'] as const) {
            this.emitFile({
              type: 'asset',
              fileName: `${lang}/index.html`,
              source: localizeHtml(esHtml, esRoot, lang, buildStaticMenuHtml(snap, lang)),
            });
          }
        } else {
          this.warn('[dorear-seo] No encontré index.html en el bundle: no se generaron /en/ y /pt/.');
        }

        const alternates = `\n    <xhtml:link rel="alternate" hreflang="es-AR" href="${SITE}/" />\n    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/" />\n    <xhtml:link rel="alternate" hreflang="pt-BR" href="${SITE}/pt/" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/" />`;
        const sitemapUrls = ['/', '/en/', '/pt/']
          .map(
            (path) =>
              `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${lastmod}</lastmod>${alternates}\n  </url>`
          )
          .join('\n');
        const files: Record<string, string> = {
          'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
          'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapUrls}\n</urlset>\n`,
          'llms.txt': buildLlmsTxt(snap),
          'carta.md': buildCartaMarkdown(snap),
        };
        for (const [fileName, source] of Object.entries(files)) {
          this.emitFile({ type: 'asset', fileName, source });
        }
        console.log(
          `[dorear-seo] Carta generada desde ${snap.source === 'supabase' ? 'Supabase' : 'datos locales'}: ${
            snap.items.length
          } productos. Páginas: /, /en/, /pt/.`
        );
      },
    },
  };
}
