-- Non-owners (anon/authenticated parents browsing a trainer's public page, or
-- confirming a booking) need to see which slots are already taken without
-- being able to read full booking rows via public.bookings' RLS. This view
-- exposes only trainer_id + session_time for non-cancelled/declined bookings,
-- and is the sole thing availability-check queries should read going forward —
-- bookings' own RLS policies are untouched. The unique index backs it up at
-- the database level so two concurrent bookings can't double-book the same
-- trainer/slot even if two requests race past the app-level check.
-- Already applied directly to the database; this documents it.

create view public.trainer_booked_slots as
select trainer_id, session_time
from public.bookings
where status not in ('cancelled', 'declined');

grant select on public.trainer_booked_slots to anon, authenticated;

create unique index if not exists bookings_trainer_slot_uniq
  on public.bookings (trainer_id, session_time)
  where status not in ('cancelled', 'declined');
