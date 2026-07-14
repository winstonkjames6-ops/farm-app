-- Add user-editable display settings to profiles

alter table public.profiles
  add column theme_preference text not null default 'dark'
    check (theme_preference in ('light', 'dark')),
  add column background_mode text not null default 'full'
    check (background_mode in ('full', 'banner'));
