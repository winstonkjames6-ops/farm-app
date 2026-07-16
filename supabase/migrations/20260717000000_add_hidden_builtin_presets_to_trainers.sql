-- Lets a trainer hide any of the app's built-in quick-add hour presets
-- (after-school, weekday-standard, mornings, weekend-only, same-every-day)
-- from their own "Quick add with a preset" row without affecting any other
-- trainer. Already applied directly to the database; this documents it.

alter table public.trainers
  add column hidden_builtin_presets text[] not null default '{}';
