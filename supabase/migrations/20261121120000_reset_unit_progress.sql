-- 完了した単元を未完了に戻す(Issue #492)。後退防止(Issue #13)のせいで upsert では completed を戻せないので、
-- 戻す関数を用意し、その中でだけ後退防止を通す。回答は消さず、reset_at より前の回答を画面が復元に使わない
alter table public.unit_progress add column reset_at timestamptz;

create or replace function public.keep_unit_progress()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_setting('app.reset_unit_progress', true) = 'on' then
    return new;
  end if;
  if current_setting('app.reset_out_of_range_step', true) is distinct from 'on' then
    new.step := greatest(new.step, old.step);
  end if;
  if old.status = 'completed' then
    new.status := 'completed';
  end if;
  return new;
end;
$$;

create function public.reset_unit_progress(p_unit_id text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform set_config('app.reset_unit_progress', 'on', true);
  update public.unit_progress
    set status = 'started', step = 0, reset_at = now(), updated_at = now()
    where user_id = (select auth.uid()) and unit_id = p_unit_id and status = 'completed';
  perform set_config('app.reset_unit_progress', 'off', true);
end;
$$;

revoke execute on function public.reset_unit_progress(text) from public, anon;
grant execute on function public.reset_unit_progress(text) to authenticated;
