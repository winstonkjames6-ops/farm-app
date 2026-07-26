-- Self-service account deletion, scoped strictly to the calling user (auth.uid()).
-- Unlike public.delete_test_account (a QA utility that takes an arbitrary email and
-- has no ownership check), this function takes no parameters and can only ever
-- delete the caller's own account.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_athlete_id uuid;
  v_trainer_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_athlete_id from public.athletes where profile_id = v_user_id;
  select id into v_trainer_id from public.trainers where profile_id = v_user_id;

  -- reviews.booking_id/parent_id/trainer_id are all NO ACTION -> must go before bookings/trainers
  delete from public.reviews
  where parent_id = v_user_id or trainer_id = v_trainer_id
     or booking_id in (
       select id from public.bookings
       where parent_id = v_user_id or athlete_id = v_athlete_id or trainer_id = v_trainer_id
     );

  -- bookings.* are all NO ACTION -> must go before profiles/athletes/trainers
  delete from public.bookings
  where parent_id = v_user_id or athlete_id = v_athlete_id or trainer_id = v_trainer_id;

  -- messages/notifications.profile_id are NO ACTION -> must go before profiles
  delete from public.messages
  where sender_id = v_user_id or recipient_id = v_user_id;

  delete from public.notifications where profile_id = v_user_id;

  -- availability.trainer_id is NO ACTION -> must go before trainers
  delete from public.availability where trainer_id = v_trainer_id;

  -- athletes.parent_id is NO ACTION -> detach (don't delete) any children this
  -- parent manages, preserving their records rather than orphan-deleting them
  update public.athletes set parent_id = null where parent_id = v_user_id;

  -- trainers.profile_id is NO ACTION -> must go before profiles.
  -- Cascades automatically: availability_exceptions, booking_waitlist(trainer_id),
  -- trainer_athlete_rates(trainer_id), trainer_presets, trainer_tags.
  delete from public.trainers where profile_id = v_user_id;

  -- this user's own athlete record, if they are an athlete with their own login.
  -- Cascades automatically: athlete_tags; booking_waitlist.athlete_id is SET NULL.
  delete from public.athletes where profile_id = v_user_id;

  delete from public.profiles where id = v_user_id;

  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
