-- Three independent features sharing one migration:
--  - trainer_presets.starts_on: a preset can be scheduled to take over automatically
--    on a future date, without the trainer needing to remember to switch it manually.
--  - booking_waitlist: lets a parent ask to be notified if an already-booked slot
--    frees up. Parents manage their own rows; trainers can only view (not edit)
--    the waitlist for their own bookings.
--  - trainer_athlete_rates: per-(trainer, athlete) rate override, checked before
--    falling back to the trainer's standard rate.
-- Already applied directly to the database; this documents it.

alter table public.trainer_presets
  add column if not exists starts_on date;

create table public.booking_waitlist (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  athlete_id uuid references public.athletes(id) on delete set null,
  session_time timestamptz not null,
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  unique (trainer_id, parent_id, session_time)
);

alter table public.booking_waitlist enable row level security;

create policy "parents manage own waitlist entries"
on public.booking_waitlist
for all
to public
using (parent_id = auth.uid())
with check (parent_id = auth.uid());

create policy "trainers can view their own waitlist"
on public.booking_waitlist
for select
to public
using (trainer_id in (select trainers.id from trainers where trainers.profile_id = auth.uid()));

create table public.trainer_athlete_rates (
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  rate numeric not null,
  created_at timestamptz not null default now(),
  primary key (trainer_id, athlete_id)
);

alter table public.trainer_athlete_rates enable row level security;

create policy "trainers manage their own athlete rate overrides"
on public.trainer_athlete_rates
for all
to public
using (trainer_id in (select trainers.id from trainers where trainers.profile_id = auth.uid()))
with check (trainer_id in (select trainers.id from trainers where trainers.profile_id = auth.uid()));

create policy "parents can view rate overrides for their own athletes"
on public.trainer_athlete_rates
for select
to public
using (athlete_id in (select athletes.id from athletes where athletes.parent_id = auth.uid()));
