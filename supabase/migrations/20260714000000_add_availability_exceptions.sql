-- One-off availability exceptions, layered on top of the recurring weekly
-- pattern in public.availability (day_of_week, start_time, end_time).
-- A row here overrides whatever the weekly pattern says for that exact date.

create table public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  exception_date date not null,
  status text not null check (status in ('available', 'blocked')),
  created_at timestamptz not null default now(),
  unique (trainer_id, exception_date)
);

alter table public.availability_exceptions enable row level security;

-- Mirrors the ownership pattern already on public.availability.
-- Applied manually via the Supabase SQL editor and confirmed against
-- pg_policies + a live write test; recorded here so this migration
-- reproduces the current DB state.

create policy "availability_exceptions is public"
on public.availability_exceptions
for select
to public
using (true);

create policy "trainers manage own availability_exceptions"
on public.availability_exceptions
for all
to public
using (trainer_id in (select trainers.id from trainers where trainers.profile_id = auth.uid()))
with check (trainer_id in (select trainers.id from trainers where trainers.profile_id = auth.uid()));
