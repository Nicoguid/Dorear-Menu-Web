# DOREAR · Menú Web Digital Mobile-First
## Pastelería de Autor & Café de Especialidad (Puerto Madero)

> **Desarrollado para:** Cafetería de Especialidad Dorear  
> **Ubicación:** Rosario Vera Peñaloza 460, Puerto Madero, CABA  
> **Fundadora & Chef Pastelera:** Agustina Ramírez  
> **Tecnología:** React + TypeScript + Vite + Tailwind CSS (Carga ultrarrápida en Edge, sin descargas para el cliente)

---

## 🌟 CARACTERÍSTICAS Y PROPUESTA DE VALOR

1. **Página Web Pura (Mobile-First 100%):**  
   Los clientes **no descargan ninguna aplicación**. Abren la cámara de su teléfono, escanean el código QR en la mesa y la carta abre en **menos de 100 milisegundos**.
2. **Respeto Absoluto a la Impronta Visual de Agustina:**  
   * Tipografías oficiales: *Cormorant Garamond* (serif clásica) y *DM Sans* (sans limpia).
   * Paleta cromática oficial: Crema (`#faf7f0`), Papel (`#fffcf7`), Tinta (`#372e25`), Oro (`#a67c3f`) y Borgoña/Vino (`#672d35`).
   * Emblema AR, firma de Agustina, corazón y eslogan: *"Que espere todo, este ratito es tuyo"*.
3. **Selector Tri-Lingüe Inmediato:**  
   * `[ 🇦🇷 ES | 🇺🇸 EN | 🇧🇷 PT ]` en un toque en cabecera.
   * Traducción gastronómica especializada para turistas internacionales de Puerto Madero (con énfasis en el público brasileño).
4. **Menú Semanal Ejecutivo Dinámico (de las tarjetas físicas):**  
   * Detección automática del día (Lunes: Pastas, Martes: Risotto, Miércoles: Pechuguitas, Jueves: Bondiola, Viernes: Milanesita).
   * Precios duales claros: **Salón ($20.000)** y **Take Away ($14.000)**.
5. **Filtros Rápidos Dietarios:**  
   * Chips instantáneos: `[Todos]`, `[🌾 Sin TACC]`, `[🌱 Vegano]`, `[🥛 Sin Lactosa]`.
6. **Carta Editorial Limpia + Modal con Corte Transversal (*Cross-Section*):**  
   * En la carta general: texto sobrio y limpio (nombre, descripción y precio en ARS).
   * Al tocar cualquier plato: se abre un modal / bottom sheet con **fotografía gourmet en corte transversal** en tortas y laminados para lucir capas, ganaches, rellenos y texturas.
7. **Botón Inteligente de Reseña en Google Maps:**  
   * 5 estrellas doradas con llamado a la acción para turistas y clientes satisfechos.
8. **Doble Acceso por PIN (Separación Operativa / Gerencial):**  
   * Toque en el candado superior para ingresar el PIN de 4 dígitos:
     * **Personal / Barra:** Panel ultra-rápido de salón. Permite marcar productos como **"Disponible"** o **"Agotado"** en 2 segundos sin tocar precios ni configuraciones.
     * **Dueña / Administración:** Permite editar precios directamente, actualizar el menú semanal o restaurar valores.

---

## 🚀 INSTRUCCIONES DE USO LOCAL

> Las fuentes (Cormorant Garamond y DM Sans) ahora se instalan con npm y se sirven desde el propio sitio: después de actualizar el proyecto, correr `npm install` otra vez.

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abrirá la aplicación en `http://localhost:3000`.

3. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Genera la carpeta optimizada `dist/` lista para subir a cualquier hosting gratuito como Vercel, Netlify o Cloudflare Pages.

---

## 🔒 SEGURIDAD Y ACCESOS DEL LOCAL

Los PINs del personal se verifican **en Supabase**, no en el navegador:

- Están hasheados en la tabla privada `dorear_staff_pins` (el sitio no la puede leer).
- El sitio guarda con funciones que piden el PIN cada vez: `dorear_save_state` (dueña), `dorear_set_availability` (barra o dueña) y `dorear_reset_state` (dueña). Con un PIN incorrecto no se guarda nada.
- La base cuenta los intentos fallidos por IP: después de 8 en 10 minutos, bloquea esa IP por 10 minutos.
- El bucket de fotos solo acepta JPG, PNG o WebP de hasta 5 MB.
- Migraciones en `db/migrations/`. El paso 2 (`..._02_cerrar_escrituras.sql`) cierra la escritura directa a la tabla y va **después** de publicar el código que usa las funciones.

**Cambiar un PIN** (Supabase → SQL Editor):

```sql
select public.dorear_set_pin('admin', '4829');   -- PIN de la dueña
select public.dorear_set_pin('barista', '7712'); -- PIN de la barra
```

---

## 🔎 SEO Y AGENTES DE IA (rediseño 2026)

La carta es una app de React: sin ayuda, Google tarda en verla y los agentes de IA (ChatGPT, Perplexity, Claude) reciben una página vacía. El plugin `back/seoPlugin.ts` resuelve eso **en cada `npm run build`**:

1. Lee la carta real desde Supabase (`dorear_state`, la misma fila que edita la dueña desde el candado). Si no hay conexión, usa los datos de `db/`.
2. Escribe la carta completa en HTML dentro de `#root` (React la reemplaza al cargar, así que el cliente no ve diferencia).
3. Agrega JSON-LD `CafeOrCoffeeShop` + `Bakery` + `Menu` (secciones, productos, precios en ARS, dietas) en el `<head>`.
4. Genera `robots.txt`, `sitemap.xml`, `llms.txt` y `carta.md` (carta en texto plano para agentes).

Datos del local (dirección, horarios, Instagram): **solo** en `db/businessInfo.ts`. Desde ahí salen el footer, el "Abierto ahora", el JSON-LD y los archivos para agentes.

### Mantener los precios al día para Google y la IA

La carta que ve el cliente se actualiza al instante (Supabase realtime). La versión "estática" para buscadores (HTML, JSON-LD, `carta.md`) se arma en cada build. Para que no quede vieja hay un **Cron de Vercel** que vuelve a publicar todos los días a las 6:00 (hora de Buenos Aires), definido en `vercel.json` y `api/rebuild.js`. Hay que configurarlo una sola vez:

1. Vercel → Project → Settings → Git → **Deploy Hooks** → crear uno para la rama `main` y copiar la URL.
2. Vercel → Settings → **Environment Variables** (Production):
   - `DEPLOY_HOOK_URL` = la URL del paso 1.
   - `CRON_SECRET` = un texto largo al azar (Vercel lo usa para que solo el Cron pueda llamar al endpoint).
3. Volver a publicar. En Settings → Cron Jobs tiene que aparecer `/api/rebuild`.

### Idiomas y direcciones

- `/` español, `/en/` inglés, `/pt/` portugués: cada una con su HTML prerenderizado y `hreflang`.
- Si alguien entra a `/` con el celular en inglés o portugués, la carta se abre en ese idioma.
- `?cat=tortas-y-budines` abre directamente una categoría (sirve para compartir o para un QR por sección).
- Cualquier otra dirección devuelve 404 (`public/404.html`). `/menu` y `/carta` redirigen a `/`.

### Precios en dólares

El panel solo carga precios en pesos. La única excepción es **"Selección de Obras Exhibidas a la Venta"**, que se muestra siempre a **US$ 690**: está fijado en `db/fixedPrices.ts` (por id y, de respaldo, por nombre). Para cambiar ese precio o sumar otra obra, se edita ese archivo y se vuelve a publicar. En el panel ese producto muestra "US$ 690 · precio fijo" en lugar del campo de precio.

Nota legal: la Res. 4/2025 (Secretaría de Industria y Comercio) pide exhibir el precio en pesos y permite el de dólares solo como agregado. Mostrar únicamente US$ es decisión del local.

### Microsoft Clarity (heatmaps y grabaciones)

- Proyecto `zifq7rheer`, configurado en `front/utils/analytics.ts` (se puede cambiar con `VITE_CLARITY_PROJECT_ID`). Se carga cuando la página terminó de cargar, para no frenar la carta. La CSP de `vercel.json` ya permite `*.clarity.ms` y `c.bing.com`.
- **Eventos propios** (Clarity → Filtros → Eventos personalizados): `categoria_elegida`, `busqueda`, `busqueda_sin_resultados` (con el término en la etiqueta del mismo nombre), `menu_ejecutivo_semana_abierta`, `click_producto`, `click_plato_semanal`, `filtro_*`, `idioma_*`, `wifi_abierto`, `reserva_grupo_abierta`, `whatsapp_*`, `click_google_review`.
- **Privacidad:** no se graban la clave del Wi‑Fi, el teclado del PIN ni los paneles de personal (`data-clarity-mask`). Al tocar el candado se corta la grabación de esa sesión. Los campos de formularios Clarity los oculta por defecto.
- Visitantes de Europa, Reino Unido y Suiza: Clarity pide consentimiento de cookies; sin banner, esas sesiones llegan con datos parciales.

### Después de publicar

- Google Search Console: agregar `https://www.dorear.com.ar`, enviar `sitemap.xml` y probar la URL con la "Prueba de resultados enriquecidos".
- Google Business Profile: poner `https://www.dorear.com.ar` como sitio web y como enlace de "Menú".

## Google Tag Manager + Google Analytics 4

- Contenedor: `GTM-MNR3WNTT` (fallback en `front/utils/analytics.ts`, se puede cambiar con `VITE_GTM_ID`).
- Se carga diferido, igual que Clarity. No se usa el snippet inline porque la CSP (`script-src 'self'`) lo bloquearía.
- GA4 (`G-472KGR0G5F`) se carga **directo desde el código** (fallback en `analytics.ts`, cambiable con `VITE_GA_MEASUREMENT_ID`). **No** agregar una "Etiqueta de Google" con ese ID en GTM: duplicaría las visitas. GTM queda para etiquetas futuras.
- Los eventos van a GA4 por `gtag` y, además, al `dataLayer` de GTM como `{ event: 'nombre', ...parámetros }`: `view_item_list`, `select_item`, `filter_menu`, `change_language`, `search`, `menu_ejecutivo_semana_abierta`, `reserva_grupo_abierta`, `generate_lead`, `click_google_review`, `view_wifi_info`.
- Las etiquetas "HTML personalizado" de GTM no van a correr (la CSP bloquea scripts inline). Clarity ya está en el código: no agregarlo también desde GTM.
