-- =============================================================================
-- DOREAR · Paso 1 de 2: el PIN del personal se verifica en la base de datos.
--
-- Antes: la carta se guardaba escribiendo directo en `dorear_state` con la clave
-- pública (la que viaja en el JS del sitio). El PIN solo se revisaba en el navegador,
-- así que cualquiera podía cambiar precios o borrar la carta sin saberlo.
--
-- Este paso es ADITIVO (no rompe la versión publicada):
--   - Tabla privada con los PINs (hash), que el navegador no puede leer.
--   - Registro de intentos fallidos por IP (límite: 8 cada 10 minutos).
--   - Funciones que el sitio llama con el PIN:
--       dorear_staff_role(pin)                  → 'admin' | 'barista' | null
--       dorear_save_state(pin, state)           → guarda la carta (solo dueña)
--       dorear_set_availability(pin, id, bool)  → agotado/disponible (barra o dueña)
--       dorear_reset_state(pin)                 → restaurar la carta original (solo dueña)
--   - El bucket de fotos acepta solo JPG, PNG o WebP de hasta 5 MB.
--
-- El paso 2 (2026-11-24_02_cerrar_escrituras.sql) cierra la escritura directa a la
-- tabla. Se corre DESPUÉS de publicar el código que usa estas funciones.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- PINs del personal -----------------------------------------------------------
create table if not exists public.dorear_staff_pins (
  role text primary key check (role in ('admin', 'barista')),
  salt text not null,
  pin_hash text not null,
  updated_at timestamptz not null default now()
);
alter table public.dorear_staff_pins enable row level security;
revoke all on public.dorear_staff_pins from anon, authenticated;

-- Mismo esquema que usaba el sitio (sha256 de sal + PIN): los PINs actuales siguen
-- funcionando. Esos hashes son públicos (estaban en el JS y en el repo), así que
-- conviene cambiar los PINs con dorear_set_pin (ver abajo).
insert into public.dorear_staff_pins (role, salt, pin_hash) values
  ('admin',   'dorear_sec_2026_', '4b38af39c2fc4b9f01003f06e798bfe90ba7fa9b315665c489713a55ead2306a'),
  ('barista', 'dorear_sec_2026_', '5cb739bd8f2da1e12de0defd98467fffa765215a852dc04be0b7aad6e09b1ea9')
on conflict (role) do nothing;

-- Intentos fallidos -------------------------------------------------------------
create table if not exists public.dorear_login_attempts (
  ip text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists dorear_login_attempts_ip_time
  on public.dorear_login_attempts (ip, attempted_at);
alter table public.dorear_login_attempts enable row level security;
revoke all on public.dorear_login_attempts from anon, authenticated;

-- Resolver el rol a partir del PIN (con límite de intentos por IP) ---------------
create or replace function public.dorear_staff_role(p_pin text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_headers json;
  v_ip text;
  v_fails int;
  v_role text;
begin
  begin
    v_headers := current_setting('request.headers', true)::json;
  exception when others then
    v_headers := null;
  end;
  v_ip := coalesce(
    nullif(trim(split_part(v_headers ->> 'x-forwarded-for', ',', 1)), ''),
    v_headers ->> 'cf-connecting-ip',
    'desconocida'
  );

  select count(*) into v_fails
  from dorear_login_attempts
  where ip = v_ip and attempted_at > now() - interval '10 minutes';
  if v_fails >= 8 then
    raise exception 'Demasiados intentos con PIN incorrecto. Esperá 10 minutos.'
      using errcode = 'P0001';
  end if;

  if p_pin is not null and p_pin ~ '^[0-9]{4,8}$' then
    select role into v_role
    from dorear_staff_pins
    where pin_hash = encode(extensions.digest(salt || p_pin, 'sha256'), 'hex')
    order by (role = 'admin') desc
    limit 1;
  end if;

  if v_role is null then
    insert into dorear_login_attempts (ip) values (v_ip);
    delete from dorear_login_attempts where attempted_at < now() - interval '1 day';
  end if;

  return v_role;
end;
$$;

-- Las funciones de escritura NO cortan con error cuando el PIN está mal: devuelven
-- {"ok": false, ...}. Si cortaran, Postgres desharía también el registro del intento
-- fallido y el límite de intentos se podría saltear.

-- Guardar la carta completa (solo dueña) -----------------------------------------
create or replace function public.dorear_save_state(p_pin text, p_state jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_role text;
  v_updated bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
begin
  v_role := dorear_staff_role(p_pin);
  if v_role is null then
    return jsonb_build_object('ok', false, 'error', 'pin');
  end if;
  if v_role <> 'admin' then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_state is null
     or jsonb_typeof(p_state -> 'items') is distinct from 'array'
     or jsonb_array_length(p_state -> 'items') = 0
     or jsonb_typeof(p_state -> 'weeklyDishes') is distinct from 'array'
     or jsonb_typeof(p_state -> 'storeSettings') is distinct from 'object'
     or octet_length(p_state::text) > 600000 then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  p_state := jsonb_set(p_state, '{updatedAt}', to_jsonb(v_updated));
  insert into dorear_state (id, state, updated_at)
  values ('current', p_state, v_updated)
  on conflict (id) do update set state = excluded.state, updated_at = excluded.updated_at;
  return jsonb_build_object('ok', true, 'updatedAt', v_updated);
end;
$$;

-- Agotado / disponible de un producto (barra o dueña) ------------------------------
create or replace function public.dorear_set_availability(p_pin text, p_item_id text, p_available boolean)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_state jsonb;
  v_items jsonb;
  v_updated bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
begin
  if dorear_staff_role(p_pin) is null then
    return jsonb_build_object('ok', false, 'error', 'pin');
  end if;
  if p_item_id is null or p_available is null then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  select state into v_state from dorear_state where id = 'current' for update;
  if v_state is null then
    return jsonb_build_object('ok', false, 'error', 'empty');
  end if;

  select jsonb_agg(
           case when item ->> 'id' = p_item_id
                then jsonb_set(item, '{available}', to_jsonb(p_available))
                else item end
           order by ord)
  into v_items
  from jsonb_array_elements(v_state -> 'items') with ordinality as t(item, ord);

  v_state := jsonb_set(jsonb_set(v_state, '{items}', v_items), '{updatedAt}', to_jsonb(v_updated));
  update dorear_state set state = v_state, updated_at = v_updated where id = 'current';
  return jsonb_build_object('ok', true, 'updatedAt', v_updated);
end;
$$;

-- Restaurar la carta original (solo dueña) ----------------------------------------
create or replace function public.dorear_reset_state(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_role text;
begin
  v_role := dorear_staff_role(p_pin);
  if v_role is null then
    return jsonb_build_object('ok', false, 'error', 'pin');
  end if;
  if v_role <> 'admin' then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;
  delete from dorear_state where id = 'current';
  return jsonb_build_object('ok', true);
end;
$$;

-- Cambiar un PIN (solo desde el SQL Editor de Supabase, no desde el sitio) ----------
--   select public.dorear_set_pin('admin', '4829');
--   select public.dorear_set_pin('barista', '7712');
create or replace function public.dorear_set_pin(p_role text, p_new_pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_salt text := encode(extensions.gen_random_bytes(12), 'hex');
begin
  if p_role not in ('admin', 'barista') then
    raise exception 'Rol inválido: usá admin o barista.';
  end if;
  if p_new_pin !~ '^[0-9]{4}$' then
    raise exception 'El PIN tiene que tener 4 números (el teclado del sitio es de 4).';
  end if;
  insert into dorear_staff_pins (role, salt, pin_hash, updated_at)
  values (p_role, v_salt, encode(extensions.digest(v_salt || p_new_pin, 'sha256'), 'hex'), now())
  on conflict (role) do update
    set salt = excluded.salt, pin_hash = excluded.pin_hash, updated_at = now();
end;
$$;

revoke all on function public.dorear_set_pin(text, text) from public, anon, authenticated;
grant execute on function public.dorear_staff_role(text) to anon, authenticated;
grant execute on function public.dorear_save_state(text, jsonb) to anon, authenticated;
grant execute on function public.dorear_set_availability(text, text, boolean) to anon, authenticated;
grant execute on function public.dorear_reset_state(text) to anon, authenticated;

-- Bucket de fotos: solo imágenes web y de hasta 5 MB -------------------------------
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'menu-images';
