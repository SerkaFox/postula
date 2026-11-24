-- T1: tabla de candidaturas con RLS por usuario.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum
      ('guardada', 'aplicada', 'entrevista', 'oferta', 'rechazada');
  end if;
  if not exists (select 1 from pg_type where typname = 'work_mode') then
    create type public.work_mode as enum ('remoto', 'hibrido', 'presencial');
  end if;
end
$$;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company text not null check (char_length(btrim(company)) between 1 and 200),
  position text not null check (char_length(btrim(position)) between 1 and 200),
  url text check (url is null or char_length(url) <= 2000),
  location text check (location is null or char_length(location) <= 200),
  work_mode public.work_mode,
  salary text check (salary is null or char_length(salary) <= 200),
  status public.application_status not null default 'guardada',
  applied_on date,
  notes text check (notes is null or char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_applied_idx
  on public.applications (user_id, applied_on desc nulls last, created_at desc);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- RLS
alter table public.applications enable row level security;

drop policy if exists "applications_select_own" on public.applications;
create policy "applications_select_own" on public.applications
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own" on public.applications
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "applications_update_own" on public.applications;
create policy "applications_update_own" on public.applications
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "applications_delete_own" on public.applications;
create policy "applications_delete_own" on public.applications
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Sin acceso anónimo
revoke all on public.applications from anon;
grant select, insert, update, delete on public.applications to authenticated;
