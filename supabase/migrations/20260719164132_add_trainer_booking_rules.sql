-- Optional per-trainer booking guardrails, all nullable/zero-default so an
-- unset trainer sees no behavior change: max sessions bookable per day,
-- minimum notice required before a slot can be booked, and how far out a
-- trainer's calendar can be booked. Already applied directly to the
-- database; this documents it.

alter table public.trainers
  add column if not exists max_sessions_per_day integer,
  add column if not exists min_notice_hours integer not null default 0,
  add column if not exists max_advance_days integer;
