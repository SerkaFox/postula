-- T8: registro de usos del autorrelleno con IA (límite diario por usuario).
-- Cada llamada a la Server Action inserta una fila; el servidor cuenta las de las
-- últimas 24 h. El usuario solo puede leer e insertar las suyas: no puede
-- editarlas ni borrarlas (así no puede saltarse el límite), y solo puede
-- escribir user_id (created_at lo pone siempre la base de datos).

create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_created_idx
  on public.ai_usage (user_id, created_at desc);

alter table public.ai_usage enable row level security;

drop policy if exists "ai_usage_select_own" on public.ai_usage;
create policy "ai_usage_select_own" on public.ai_usage
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "ai_usage_insert_own" on public.ai_usage;
create policy "ai_usage_insert_own" on public.ai_usage
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Sin update ni delete para nadie salvo service_role; sin acceso anónimo.
revoke all on public.ai_usage from anon, authenticated;
grant select on public.ai_usage to authenticated;
grant insert (user_id) on public.ai_usage to authenticated;
