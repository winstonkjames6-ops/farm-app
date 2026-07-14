-- Columns needed by the shared ProfileCard component

alter table public.profiles
  add column avatar_url text,
  add column banner_image_url text,
  add column phone text,
  add column verified boolean not null default false;

alter table public.trainers
  add column is_certified boolean not null default false;
