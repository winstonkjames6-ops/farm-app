-- Structured, persisted replacement for the client-side-only cert/affiliation lists
-- on the trainer profile page (previously seeded from local INITIAL_CERTS/INITIAL_AFFS
-- and never saved). Public read mirrors the existing "trainers are public" policy.

create table public.trainer_certifications (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  name text not null,
  org text,
  year text,
  created_at timestamptz not null default now()
);

create table public.trainer_affiliations (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  name text not null,
  role text,
  years text,
  created_at timestamptz not null default now()
);

create index idx_trainer_certifications_trainer_id on public.trainer_certifications(trainer_id);
create index idx_trainer_affiliations_trainer_id on public.trainer_affiliations(trainer_id);

alter table public.trainer_certifications enable row level security;
alter table public.trainer_affiliations enable row level security;

create policy "trainer certifications are public"
  on public.trainer_certifications
  for select
  using (true);

create policy "trainer manages own certifications"
  on public.trainer_certifications
  for all
  using (trainer_id in (select id from public.trainers where profile_id = auth.uid()))
  with check (trainer_id in (select id from public.trainers where profile_id = auth.uid()));

create policy "trainer affiliations are public"
  on public.trainer_affiliations
  for select
  using (true);

create policy "trainer manages own affiliations"
  on public.trainer_affiliations
  for all
  using (trainer_id in (select id from public.trainers where profile_id = auth.uid()))
  with check (trainer_id in (select id from public.trainers where profile_id = auth.uid()));
