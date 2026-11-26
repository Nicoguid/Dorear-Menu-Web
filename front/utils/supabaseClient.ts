import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://ilwrrtmrtyrdwmkstflh.supabase.co';
const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_WUAIY6_zm2cTS7uvm4GMAA_f3PKt6GD';

export const SUPABASE_IMAGES_BUCKET =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_IMAGES_BUCKET) ||
  'menu-images';

let clientPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Devuelve el cliente de Supabase cargando la librería recién la primera vez que se
 * necesita. Así esos ~45 KB no frenan el primer dibujo de la carta: el cliente ve
 * los datos guardados al instante y la sincronización en vivo llega un momento después.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          realtime: { params: { eventsPerSecond: 10 } },
        })
      )
      .catch(() => null);
  }
  return clientPromise;
}
