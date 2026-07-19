-- Days of week (Sun=0..Sat=6) a trainer never works, independent of whatever
-- days their active preset happens to list — e.g. a trainer whose preset runs
-- Mon-Fri can still mark Wed as a standing day off without editing the preset.
-- Already applied directly to the database; this documents it.

alter table public.trainers
  add column if not exists standing_days_off integer[] not null default '{}';
