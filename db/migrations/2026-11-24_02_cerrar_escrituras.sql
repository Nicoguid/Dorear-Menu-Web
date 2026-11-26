-- =============================================================================
-- DOREAR · Paso 2 de 2: cerrar la escritura directa a la carta.
--
-- Correr DESPUÉS de publicar en Vercel el código que guarda con dorear_save_state /
-- dorear_set_availability (si se corre antes, el panel publicado deja de guardar).
--
-- La lectura pública de la carta sigue igual (la necesitan los clientes).
-- =============================================================================

drop policy if exists "Actualización del menú" on public.dorear_state;
revoke insert, update, delete, truncate on public.dorear_state from anon, authenticated;
