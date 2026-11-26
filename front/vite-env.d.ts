/// <reference types="vite/client" />

/** Variables opcionales de Vercel. Todas tienen un valor por defecto en el código. */
interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_GTM_ID?: string;
  readonly VITE_CLARITY_PROJECT_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_IMAGES_BUCKET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
