-- Pulled verbatim from supabase_migrations.schema_migrations (version
-- 20260715223301) on 2026-07-19 via the Supabase MCP connector. This was
-- already applied live; this file only brings the local repo's migration
-- history in sync with what actually ran. Do not re-run the data-migration
-- block below against production — it already ran once and would create
-- duplicate "Migrated schedule" preset rows per trainer if run again.

alter table public.trainer_presets
  add column if not exists session_length_minutes integer not null default 60,
  add column if not exists break_minutes integer not null default 15;

alter table public.trainers
  add column if not exists active_preset_id uuid references public.trainer_presets(id) on delete set null;

with grouped as (
  select trainer_id, start_time, end_time,
         array_agg(distinct day_of_week order by day_of_week) as days,
         count(*) as cnt
  from public.availability
  group by trainer_id, start_time, end_time
),
ranked as (
  select *, row_number() over (partition by trainer_id order by cnt desc) as rn
  from grouped
),
inserted as (
  insert into public.trainer_presets (trainer_id, label, days, start_time, end_time, session_length_minutes, break_minutes)
  select trainer_id, 'Migrated schedule', days, start_time, end_time, 60, 15
  from ranked
  where rn = 1
  returning id, trainer_id
)
update public.trainers t
set active_preset_id = i.id
from inserted i
where t.id = i.trainer_id;
