-- Supports the athlete onboarding wizard's invite-code claim flow.
--
-- lookup_invite_code() is callable by anon (before the athlete has an
-- account) so the wizard can show "confirm your info" using the
-- parent-entered name/dob/sport before any signup happens. It deliberately
-- returns only what's needed for that screen — never the code itself, never
-- parent info. Known tradeoff: Postgres/Supabase RPCs have no built-in
-- per-function rate limiting, so this is enumerable by brute force against
-- the ~1.07 billion (32^6) code space if nothing upstream (e.g. Supabase's
-- platform-level API rate limits) throttles it. Flagging rather than
-- building a lockout table, which felt like scope creep for this task.
--
-- claim_athlete_invite() runs after the athlete has a real session (post
-- signUp()). It also deletes any row the handle_new_user() trigger
-- auto-created for this new profile_id — that trigger's athlete branch is
-- for the *standalone* self-signup path (no parent, no invite) and always
-- fires on any role:'athlete' signUp(); here we're claiming the
-- parent-created row instead, so the auto-created one is redundant and
-- would otherwise collide with athletes.profile_id's unique constraint.

create or replace function public.lookup_invite_code(p_code text)
returns table(name text, dob date, sport text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.athletes
    where invite_code = p_code and profile_id is null and invite_code_expires_at > now()
  ) then
    raise exception 'Invalid or expired invite code';
  end if;

  return query
  select a.name, a.dob, a.sport
  from public.athletes a
  where a.invite_code = p_code and a.profile_id is null and a.invite_code_expires_at > now();
end;
$$;

revoke all on function public.lookup_invite_code(text) from public;
grant execute on function public.lookup_invite_code(text) to anon, authenticated;

create or replace function public.claim_athlete_invite(p_code text, p_name text, p_dob date, p_sport text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_athlete_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_athlete_id
  from public.athletes
  where invite_code = p_code and profile_id is null and invite_code_expires_at > now();

  if v_athlete_id is null then
    raise exception 'Invalid or expired invite code';
  end if;

  delete from public.athletes where profile_id = v_user_id and id <> v_athlete_id;

  update public.athletes
  set profile_id = v_user_id,
      name = p_name,
      dob = p_dob,
      sport = p_sport,
      invite_code = null,
      claimed_at = now()
  where id = v_athlete_id;

  return v_athlete_id;
end;
$$;

revoke all on function public.claim_athlete_invite(text, text, date, text) from public;
grant execute on function public.claim_athlete_invite(text, text, date, text) to authenticated;

-- Pre-existing gap: athletes had SELECT on their own row but no way to
-- UPDATE it themselves (every prior write path went through a parent).
-- An 18+ self-service athlete needs this for any future profile/settings
-- edit — not exercised by this wizard's own claim (that goes through the
-- SECURITY DEFINER function above), but required for the "no parent-account
-- linkage required for future changes" goal to hold true afterward.
create policy "athletes can update their own row"
on public.athletes
for update
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);
