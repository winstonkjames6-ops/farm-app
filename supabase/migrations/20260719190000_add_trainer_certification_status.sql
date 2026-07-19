-- Lightweight verification-request flow: trainers submit certification notes,
-- an admin (outside this app, for now) reviews and flips status to approved/rejected.

alter table public.trainers
  add column certification_status text not null default 'none'
    check (certification_status in ('none', 'pending', 'approved', 'rejected')),
  add column certification_notes text;
