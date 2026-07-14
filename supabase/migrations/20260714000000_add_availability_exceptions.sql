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

-- RLS policies intentionally left unfilled here.
-- Run the query below against `availability` and mirror its exact policy
-- shape (roles, USING/WITH CHECK expressions, per-command vs ALL) before
-- filling this in — do not invent a different shape.
--
--   select * from pg_policies where schemaname = 'public' and tablename = 'availability';
