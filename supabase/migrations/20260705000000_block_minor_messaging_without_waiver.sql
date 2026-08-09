-- Enforce waiver requirement for minor athlete messaging.
-- Minor athletes (under 18) cannot send messages unless:
-- 1. They have a parent_id (are claimed by a parent), AND
-- 2. The parent has signed a waiver (waiver_signed_at is not null).
-- This applies to all message participants, not just the sender.

create policy "sender creates message" on public.messages for insert
  with check (
    auth.uid() = sender_id and not exists (
      select 1 from athletes a
      where a.profile_id = any (array[messages.sender_id, messages.recipient_id])
        and a.dob is not null
        and extract(year from age(current_date::timestamptz, a.dob::timestamptz)) < 18
        and (a.parent_id is null or a.waiver_signed_at is null)
    )
  );
