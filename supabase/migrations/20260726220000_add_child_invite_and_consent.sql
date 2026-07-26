-- Supports the parent onboarding wizard's child-account creation:
--   - is_minor is computed server-side from dob on every insert/update, so a
--     client can never pass a false boolean for it.
--   - invite_code is how a child later claims their (initially unclaimed,
--     profile_id = null) athlete row from the athlete wizard. It's generated
--     server-side (not client Math.random()) and is NOT plain-SELECT-able —
--     the existing "trainers can view athletes on their bookings" RLS policy
--     grants row-level SELECT to any trainer with a booking for that child,
--     and RLS can't restrict by column, so a plain column would leak the
--     claim secret to trainers. It's readable only via get_child_invite_code(),
--     which checks the caller is that row's parent.
--   - terms_accepted_at is a NEW column distinct from waiver_signed_at/
--     waiver_signature/waiver_signed_by, which belong to the unrelated
--     direct-messaging consent feature — do not conflate the two.

alter table public.athletes
  add column is_minor boolean,
  add column terms_accepted_at timestamptz,
  add column claimed_at timestamptz,
  add column invite_code_expires_at timestamptz;

create or replace function public.compute_athlete_is_minor()
returns trigger
language plpgsql
as $$
begin
  new.is_minor := (new.dob is null) or (new.dob > (current_date - interval '18 years'));
  return new;
end;
$$;

drop trigger if exists athletes_set_is_minor on public.athletes;
create trigger athletes_set_is_minor
  before insert or update on public.athletes
  for each row execute function public.compute_athlete_is_minor();

create or replace function public.generate_invite_code()
returns text
language plpgsql
volatile
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    if i = 3 then result := result || '-'; end if;
  end loop;
  return result;
end;
$$;

alter table public.athletes
  add column invite_code text unique default public.generate_invite_code();

alter table public.athletes
  alter column invite_code_expires_at set default (now() + interval '90 days');

-- Prevent the claim secret from being readable via a plain row select —
-- only get_child_invite_code() (below) can return it, and only to that
-- child's own parent.
revoke select (invite_code) on public.athletes from authenticated, anon;

create or replace function public.get_child_invite_code(p_athlete_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  select invite_code into v_code
  from public.athletes
  where id = p_athlete_id and parent_id = auth.uid();

  if v_code is null then
    raise exception 'Not found or not permitted';
  end if;

  return v_code;
end;
$$;

revoke all on function public.get_child_invite_code(uuid) from public;
grant execute on function public.get_child_invite_code(uuid) to authenticated;
