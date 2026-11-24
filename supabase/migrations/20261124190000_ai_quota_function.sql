-- T8: consumo atómico del límite diario de IA.
-- consume_ai_quota() bloquea por usuario (advisory lock de transacción), cuenta
-- los usos de las últimas 24 h y solo inserta si quedan. Devuelve los usos que
-- quedan tras este, o -1 si ya no queda ninguno. Es la única forma de escribir
-- en ai_usage: se retira el INSERT directo.

create or replace function public.consume_ai_quota(daily_limit integer default 20)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  used integer;
  max_uses integer := least(greatest(coalesce(daily_limit, 20), 0), 20);
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext('ai_usage:' || uid::text));

  select count(*) into used
  from public.ai_usage
  where user_id = uid and created_at > now() - interval '24 hours';

  if used >= max_uses then
    return -1;
  end if;

  insert into public.ai_usage (user_id) values (uid);
  return max_uses - used - 1;
end;
$$;

revoke all on function public.consume_ai_quota(integer) from public, anon;
grant execute on function public.consume_ai_quota(integer) to authenticated;

-- La función es el único camino para registrar usos.
revoke insert on public.ai_usage from authenticated;
drop policy if exists "ai_usage_insert_own" on public.ai_usage;
