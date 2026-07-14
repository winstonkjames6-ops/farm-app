-- Trainer-saved custom quick-add presets (label + days + start/end time).
-- No public-read requirement, unlike availability/availability_exceptions —
-- only the owning trainer may ever read or write their own preset rows.

create table public.trainer_presets (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  label text not null,
  days integer[] not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

alter table public.trainer_presets enable row level security;

-- Same ownership join pattern as availability_exceptions' owner policy
-- (trainers.profile_id = auth.uid()), but no separate public-select policy —
-- this table is owner-only for every operation.
create policy "trainers manage own trainer_presets"
on public.trainer_presets
for all
to public
using (trainer_id in (select trainers.id from trainers where trainers.profile_id = auth.uid()))
with check (trainer_id in (select trainers.id from trainers where trainers.profile_id = auth.uid()));
