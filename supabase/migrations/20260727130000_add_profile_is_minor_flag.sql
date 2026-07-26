-- Session-checkable minor-account flag. athletes.is_minor (added in
-- add_child_invite_and_consent) is computed from dob, but messaging RLS,
-- profile-visibility, and any future discover-feed gating need a hook
-- readable straight off the athlete's own profile row without joining
-- athletes every time. Mirrored here via trigger, not client-settable —
-- authenticated has no UPDATE grant on this column, same pattern as
-- invite_code in add_child_invite_and_consent.
--
-- Note: the actual trainer<->minor messaging gate is unchanged by this
-- migration — it's enforced by the "sender creates message" RLS policy from
-- block_minor_messaging_without_waiver (a dob-based check against
-- athletes.waiver_signed_at, already live). This column is a convenience
-- read hook for the rest of the app, not itself an enforcement point for
-- messaging.

alter table public.profiles
  add column if not exists is_minor boolean not null default false;

revoke update (is_minor) on public.profiles from authenticated;

create or replace function public.sync_profile_is_minor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.profile_id is not null then
    update public.profiles set is_minor = new.is_minor where id = new.profile_id;
  end if;
  return new;
end;
$$;

drop trigger if exists athletes_sync_profile_is_minor on public.athletes;
create trigger athletes_sync_profile_is_minor
  after insert or update on public.athletes
  for each row execute function public.sync_profile_is_minor();

-- "Feedback after sessions" notification preference for the minor athlete
-- wizard's Step 2. Trainer-messages isn't offered as a toggle there — see
-- the migration comment above for why that stays a server-side gate instead
-- of a cosmetic switch.
alter table public.profiles
  add column if not exists notif_session_feedback boolean not null default true;
