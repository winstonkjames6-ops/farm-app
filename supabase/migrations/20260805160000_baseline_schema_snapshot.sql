-- ============================================================================
-- BASELINE SCHEMA SNAPSHOT
-- ============================================================================
-- This migration does NOT represent a single historical change. It is a
-- reconstructed snapshot of the live production schema as of 2026-08-05,
-- assembled because ~27 migrations were applied directly to production
-- (via Supabase MCP / SQL editor) without ever being committed as files in
-- this repo. Recovering the exact original 27 discrete migrations was not
-- possible (they were never saved anywhere as individual files), so this
-- file captures the *current resulting state* instead.
--
-- DO NOT RUN THIS AGAINST THE LIVE PRODUCTION DATABASE. It already has this
-- schema. Running it there will fail on "already exists" errors (safe, but
-- pointless) or, if you strip the IF NOT EXISTS guards, will error harder.
--
-- This file exists so that:
--   1. A fresh local/staging Supabase project can be bootstrapped to match
--      production by running `supabase db reset` against an empty DB.
--   2. Future schema drift is easier to spot (diff against this baseline).
--
-- Going forward: every migration applied via Supabase MCP must be saved as
-- a file in this folder using the EXACT version number Supabase assigns
-- (visible via `select version, name from supabase_migrations.schema_migrations
-- order by version desc limit 1;` immediately after applying). Do not let
-- Claude Code invent its own timestamp for a migration that was actually
-- applied through the MCP tool — that mismatch is what caused this problem.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  role text check (role = any (array['parent','trainer','athlete'])),
  name text,
  email text,
  created_at timestamptz default now(),
  username text,
  last_active timestamptz,
  theme_preference text default 'light' check (theme_preference = any (array['light','dark','system'])),
  background_mode text default 'full' check (background_mode = any (array['full','banner'])),
  avatar_url text,
  banner_image_url text,
  phone text,
  verified boolean default false,
  notif_session_reminders boolean default true,
  notif_messages boolean default true,
  notif_booking_requests boolean default true,
  notif_promo_updates boolean default false,
  share_progress boolean default true,
  public_profile boolean default false,
  notif_review_reminders boolean default true,
  referral_source text,
  terms_accepted_at timestamptz,
  location text,
  travel_radius integer,
  languages text[] default '{}'
);

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.profiles(id),
  name text,
  dob date,
  sport text,
  created_at timestamptz default now(),
  skill_level text,
  position text,
  goals text,
  session_format text,
  profile_id uuid unique references public.profiles(id),
  waiver_signed_at timestamptz,
  waiver_signature text,
  waiver_signed_by text,
  is_minor boolean,
  terms_accepted_at timestamptz,
  claimed_at timestamptz,
  invite_code_expires_at timestamptz default (now() + interval '90 days'),
  invite_code text unique default generate_invite_code(),
  comments_enabled boolean default false
);

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id),
  specialty text,
  rate numeric,
  bio text,
  credentials text,
  created_at timestamptz default now(),
  location text,
  is_certified boolean default false,
  active_preset_id uuid,
  hidden_builtin_presets text[] default '{}',
  max_sessions_per_day integer,
  min_notice_hours integer default 0,
  max_advance_days integer,
  standing_days_off integer[] default '{}',
  certification_status text default 'none' check (certification_status = any (array['none','pending','approved','rejected'])),
  certification_notes text,
  years_experience integer,
  preferred_age_min integer,
  preferred_age_max integer,
  languages text[],
  travel_radius_miles integer,
  id_verification_url text
);

create table if not exists public.trainer_presets (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id),
  label text,
  days integer[],
  start_time time,
  end_time time,
  created_at timestamptz default now(),
  session_length_minutes integer default 60,
  break_minutes integer default 15,
  starts_on date
);

alter table public.trainers
  add constraint trainers_active_preset_id_fkey
  foreign key (active_preset_id) references public.trainer_presets(id);

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.trainers(id),
  day_of_week integer,
  start_time time,
  end_time time
);

create table if not exists public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id),
  exception_date date not null,
  status text not null check (status = any (array['available','blocked'])),
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.profiles(id),
  athlete_id uuid references public.athletes(id),
  trainer_id uuid references public.trainers(id),
  session_time timestamptz,
  status text default 'pending',
  created_at timestamptz default now(),
  format text,
  rate numeric
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id),
  recipient_id uuid references public.profiles(id),
  body text,
  sent_at timestamptz default now(),
  read_at timestamptz
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references public.bookings(id),
  parent_id uuid references public.profiles(id),
  trainer_id uuid references public.trainers(id),
  rating integer not null check (rating >= 1 and rating <= 5),
  tags text[],
  body text,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id),
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_waitlist (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id),
  parent_id uuid not null references public.profiles(id),
  athlete_id uuid references public.athletes(id),
  session_time timestamptz not null,
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

create table if not exists public.trainer_athlete_rates (
  trainer_id uuid not null references public.trainers(id),
  athlete_id uuid not null references public.athletes(id),
  rate numeric not null,
  created_at timestamptz not null default now(),
  primary key (trainer_id, athlete_id)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.trainer_tags (
  trainer_id uuid not null references public.trainers(id),
  tag_id uuid not null references public.tags(id),
  created_at timestamptz not null default now(),
  primary key (trainer_id, tag_id)
);

create table if not exists public.athlete_tags (
  athlete_id uuid not null references public.athletes(id),
  tag_id uuid not null references public.tags(id),
  created_at timestamptz not null default now(),
  primary key (athlete_id, tag_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_type text not null check (author_type = any (array['trainer','athlete'])),
  author_id uuid not null references public.profiles(id),
  booking_id uuid references public.bookings(id),
  video_url text not null,
  thumbnail_url text,
  caption text,
  sport text,
  created_at timestamptz not null default now(),
  feedback_requested boolean not null default false,
  view_count integer not null default 0,
  published boolean not null default true,
  comments_enabled boolean not null default true
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id),
  profile_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id),
  followed_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id)
);

create table if not exists public.post_bookmarks (
  post_id uuid not null references public.posts(id),
  profile_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id),
  reporter_id uuid not null references public.profiles(id),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id),
  author_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id),
  reporter_id uuid not null references public.profiles(id),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  granted_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FUNCTIONS
-- ---------------------------------------------------------------------------

create or replace function public.generate_invite_code()
returns text
language plpgsql
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

create or replace function public.compute_athlete_is_minor()
returns trigger
language plpgsql
as $$
begin
  new.is_minor := (new.dob is null) or (new.dob > (current_date - interval '18 years'));
  return new;
end;
$$;

create or replace function public.sync_is_certified()
returns trigger
language plpgsql
as $$
begin
  new.is_certified := (new.certification_status = 'approved');
  return new;
end;
$$;

-- NOTE: sync_trainer_is_certified duplicates sync_is_certified exactly, and
-- both are attached as separate triggers on public.trainers firing on the
-- same event. Harmless (idempotent), but redundant — worth consolidating
-- to one trigger in a follow-up cleanup, not fixed here to keep this
-- snapshot a faithful match of live state.
create or replace function public.sync_trainer_is_certified()
returns trigger
language plpgsql
as $$
begin
  new.is_certified := (new.certification_status = 'approved');
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.profiles (id, role, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'athlete'),
    new.raw_user_meta_data->>'name',
    new.email
  )
  on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data->>'role', '') = 'athlete' then
    insert into public.athletes (profile_id, parent_id, name, dob)
    values (
      new.id,
      null,
      new.raw_user_meta_data->>'name',
      nullif(new.raw_user_meta_data->>'dob', '')::date
    )
    on conflict (profile_id) do nothing;
  elsif new.raw_user_meta_data->>'role' = 'trainer' then
    insert into public.trainers (profile_id, specialty, rate, location)
    values (
      new.id,
      new.raw_user_meta_data->>'specialty',
      nullif(new.raw_user_meta_data->>'rate', '')::numeric,
      new.raw_user_meta_data->>'location'
    )
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
as $$
declare
  v_sender_name text;
  v_recipient_role text;
  v_link text;
begin
  select name into v_sender_name from profiles where id = new.sender_id;
  select role into v_recipient_role from profiles where id = new.recipient_id;
  v_link := case when v_recipient_role = 'trainer'
    then '/dashboard/trainer/messages?withId=' || new.sender_id::text
    else '/dashboard/messages?withId=' || new.sender_id::text
  end;
  insert into notifications (profile_id, type, title, body, link)
  values (new.recipient_id, 'new_message', 'New message from ' || coalesce(v_sender_name, 'someone'), left(new.body, 120), v_link);
  return new;
end;
$$;

create or replace function public.notify_trainer_new_booking()
returns trigger
language plpgsql
security definer
as $$
declare
  v_trainer_profile_id uuid;
  v_parent_name text;
begin
  select profile_id into v_trainer_profile_id from trainers where id = new.trainer_id;
  select name into v_parent_name from profiles where id = new.parent_id;
  insert into notifications (profile_id, type, title, body, link)
  values (
    v_trainer_profile_id, 'new_booking_request', 'New booking request',
    coalesce(v_parent_name, 'A parent') || ' requested a session.',
    '/dashboard/trainer/schedule'
  );
  return new;
end;
$$;

create or replace function public.notify_parent_booking_status()
returns trigger
language plpgsql
security definer
as $$
declare
  v_trainer_name text;
begin
  if new.status is distinct from old.status and new.status in ('confirmed','declined','completed') then
    select p.name into v_trainer_name from trainers t join profiles p on p.id = t.profile_id where t.id = new.trainer_id;
    insert into notifications (profile_id, type, title, body, link)
    values (
      new.parent_id,
      case new.status when 'confirmed' then 'booking_confirmed' when 'declined' then 'booking_declined' else 'booking_completed' end,
      case new.status when 'confirmed' then 'Booking confirmed' when 'declined' then 'Booking declined' else 'How was your session?' end,
      case new.status
        when 'confirmed' then coalesce(v_trainer_name,'Your trainer') || ' confirmed your session.'
        when 'declined' then coalesce(v_trainer_name,'Your trainer') || ' declined your session request.'
        else 'Leave a review for your session with ' || coalesce(v_trainer_name,'your trainer') || '.'
      end,
      case new.status when 'completed' then '/review?bookingId=' || new.id::text else '/dashboard' end
    );
  end if;
  return new;
end;
$$;

create or replace function public.trainer_has_booking_with_athlete(check_athlete_id uuid)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from bookings
    join trainers on trainers.id = bookings.trainer_id
    where bookings.athlete_id = check_athlete_id
    and trainers.profile_id = auth.uid()
  );
$$;

create or replace function public.get_child_invite_code(p_athlete_id uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
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

create or replace function public.lookup_invite_code(p_code text)
returns table(name text, dob date, sport text)
language plpgsql
security definer
set search_path to 'public'
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

create or replace function public.claim_athlete_invite(p_code text, p_name text, p_dob date, p_sport text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
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

create or replace function public.increment_post_view(p_post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts set view_count = view_count + 1 where id = p_post_id;
end;
$$;

create or replace function public.get_posts_comments_enabled(p_post_ids uuid[])
returns table(post_id uuid, comments_enabled boolean)
language sql
stable security definer
set search_path to 'public'
as $$
  select p.id, case when p.author_type = 'trainer' then p.comments_enabled
                     else coalesce(a.comments_enabled, false) end
  from public.posts p
  left join public.athletes a on a.profile_id = p.author_id and p.author_type = 'athlete'
  where p.id = any(p_post_ids);
$$;

create or replace function public.delete_test_account(target_email text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user_id uuid;
  v_athlete_id uuid;
  v_trainer_id uuid;
begin
  select id into v_user_id from auth.users where email = target_email;

  if v_user_id is null then
    return 'No user found with that email.';
  end if;

  select id into v_athlete_id from public.athletes where profile_id = v_user_id;
  select id into v_trainer_id from public.trainers where profile_id = v_user_id;

  delete from public.reviews
  where parent_id = v_user_id or trainer_id = v_trainer_id
     or booking_id in (
       select id from public.bookings
       where parent_id = v_user_id or athlete_id = v_athlete_id or trainer_id = v_trainer_id
     );

  delete from public.bookings
  where parent_id = v_user_id or athlete_id = v_athlete_id or trainer_id = v_trainer_id;

  delete from public.messages
  where sender_id = v_user_id or recipient_id = v_user_id;

  delete from public.notifications where profile_id = v_user_id;

  delete from public.availability where trainer_id = v_trainer_id;

  update public.athletes set parent_id = null where parent_id = v_user_id;

  delete from public.trainers where profile_id = v_user_id;
  delete from public.athletes where profile_id = v_user_id;

  delete from public.profiles where id = v_user_id;

  delete from auth.users where id = v_user_id;

  return 'Deleted user ' || target_email || ' (id ' || v_user_id || ') and all dependent rows.';
end;
$$;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path to 'public'
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

  delete from public.reviews
  where parent_id = v_user_id or trainer_id = v_trainer_id
     or booking_id in (
       select id from public.bookings
       where parent_id = v_user_id or athlete_id = v_athlete_id or trainer_id = v_trainer_id
     );

  delete from public.bookings
  where parent_id = v_user_id or athlete_id = v_athlete_id or trainer_id = v_trainer_id;

  delete from public.messages
  where sender_id = v_user_id or recipient_id = v_user_id;

  delete from public.notifications where profile_id = v_user_id;

  delete from public.availability where trainer_id = v_trainer_id;

  update public.athletes set parent_id = null where parent_id = v_user_id;

  delete from public.trainers where profile_id = v_user_id;
  delete from public.athletes where profile_id = v_user_id;

  delete from public.profiles where id = v_user_id;

  delete from auth.users where id = v_user_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists athletes_set_is_minor on public.athletes;
create trigger athletes_set_is_minor before insert or update on public.athletes
  for each row execute function public.compute_athlete_is_minor();

drop trigger if exists trg_sync_is_certified on public.trainers;
create trigger trg_sync_is_certified before insert or update of certification_status on public.trainers
  for each row execute function public.sync_is_certified();

drop trigger if exists trg_sync_trainer_is_certified on public.trainers;
create trigger trg_sync_trainer_is_certified before insert or update of certification_status on public.trainers
  for each row execute function public.sync_trainer_is_certified();

drop trigger if exists trg_notify_new_message on public.messages;
create trigger trg_notify_new_message after insert on public.messages
  for each row execute function public.notify_new_message();

drop trigger if exists trg_notify_trainer_new_booking on public.bookings;
create trigger trg_notify_trainer_new_booking after insert on public.bookings
  for each row execute function public.notify_trainer_new_booking();

drop trigger if exists trg_notify_parent_booking_status on public.bookings;
create trigger trg_notify_parent_booking_status after update on public.bookings
  for each row execute function public.notify_parent_booking_status();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.athletes enable row level security;
alter table public.trainers enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.trainer_presets enable row level security;
alter table public.booking_waitlist enable row level security;
alter table public.trainer_athlete_rates enable row level security;
alter table public.tags enable row level security;
alter table public.trainer_tags enable row level security;
alter table public.athlete_tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.follows enable row level security;
alter table public.post_bookmarks enable row level security;
alter table public.post_reports enable row level security;
alter table public.comments enable row level security;
alter table public.comment_reports enable row level security;
alter table public.admin_roles enable row level security;

-- profiles
create policy "insert own profile" on public.profiles for insert
  with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update
  using (auth.uid() = id);
create policy "own or public trainer profile" on public.profiles for select
  using (auth.uid() = id or role = 'trainer');
create policy "trainers can view parent profiles on their bookings" on public.profiles for select
  using (exists (select 1 from bookings join trainers on trainers.id = bookings.trainer_id
                 where bookings.parent_id = profiles.id and trainers.profile_id = auth.uid()));
create policy "Profile visible if public post or comment author" on public.profiles for select
  using (exists (select 1 from posts where posts.author_id = profiles.id and posts.published = true)
      or exists (select 1 from comments where comments.author_id = profiles.id));

-- athletes
create policy "athletes owned by parent" on public.athletes for all
  using (auth.uid() = parent_id);
create policy "athletes can view their own row" on public.athletes for select
  using (auth.uid() = profile_id);
create policy "athletes can update their own row" on public.athletes for update
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "athletes can self-insert" on public.athletes for insert
  with check (profile_id = auth.uid());
create policy "trainers can view athletes on their bookings" on public.athletes for select
  using (trainer_has_booking_with_athlete(id));

-- trainers
create policy "trainers are public" on public.trainers for select using (true);
create policy "trainer manages own row" on public.trainers for all
  using (auth.uid() = profile_id);

-- availability
create policy "availability is public" on public.availability for select using (true);
create policy "authenticated users can read availability" on public.availability for select
  using (auth.role() = 'authenticated');
create policy "trainer manages own availability" on public.availability for all
  using (trainer_id in (select id from trainers where profile_id = auth.uid()));
create policy "trainers manage own availability" on public.availability for all
  using (trainer_id in (select id from trainers where profile_id = auth.uid()))
  with check (trainer_id in (select id from trainers where profile_id = auth.uid()));

-- availability_exceptions
create policy "availability_exceptions is public" on public.availability_exceptions for select using (true);
create policy "trainers manage own availability_exceptions" on public.availability_exceptions for all
  using (trainer_id in (select id from trainers where profile_id = auth.uid()))
  with check (trainer_id in (select id from trainers where profile_id = auth.uid()));

-- bookings
create policy "bookings visible to involved parties" on public.bookings for select
  using (auth.uid() = parent_id or auth.uid() = (select profile_id from trainers where id = bookings.trainer_id));
create policy "athletes can view their own bookings" on public.bookings for select
  using (exists (select 1 from athletes where athletes.id = bookings.athlete_id and athletes.profile_id = auth.uid()));
create policy "parent creates booking" on public.bookings for insert
  with check (auth.uid() = parent_id);
create policy "involved parties update booking" on public.bookings for update
  using (auth.uid() = parent_id or auth.uid() = (select profile_id from trainers where id = bookings.trainer_id));

-- messages (minor-safety enforcement lives in this INSERT policy's with_check)
create policy "messages visible to sender or recipient" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "athletes can view their parent's messages" on public.messages for select
  using (exists (select 1 from athletes where athletes.profile_id = auth.uid()
                 and athletes.parent_id = any (array[messages.sender_id, messages.recipient_id])));
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
create policy "recipients can mark their messages as read" on public.messages for update
  using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- reviews
create policy "anyone can view reviews" on public.reviews for select using (true);
create policy "parents can review their own completed bookings" on public.reviews for insert
  with check (auth.uid() = parent_id and exists (
    select 1 from bookings where bookings.id = reviews.booking_id
    and bookings.parent_id = auth.uid() and bookings.status = 'completed'));

-- notifications
create policy "users read own notifications" on public.notifications for select
  using (profile_id = auth.uid());
create policy "users update own notifications" on public.notifications for update
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- booking_waitlist
create policy "parents manage own waitlist entries" on public.booking_waitlist for all
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy "trainers can view their own waitlist" on public.booking_waitlist for select
  using (trainer_id in (select id from trainers where profile_id = auth.uid()));

-- trainer_athlete_rates
create policy "trainers manage their own athlete rate overrides" on public.trainer_athlete_rates for all
  using (trainer_id in (select id from trainers where profile_id = auth.uid()))
  with check (trainer_id in (select id from trainers where profile_id = auth.uid()));
create policy "parents can view rate overrides for their own athletes" on public.trainer_athlete_rates for select
  using (athlete_id in (select id from athletes where parent_id = auth.uid()));

-- tags
create policy "tags are public read" on public.tags for select using (true);
create policy "authenticated users can add tags" on public.tags for insert to authenticated with check (true);

-- trainer_tags
create policy "trainer_tags public read" on public.trainer_tags for select using (true);
create policy "trainer manages own tags" on public.trainer_tags for all
  using (exists (select 1 from trainers t where t.id = trainer_tags.trainer_id and t.profile_id = auth.uid()))
  with check (exists (select 1 from trainers t where t.id = trainer_tags.trainer_id and t.profile_id = auth.uid()));

-- athlete_tags
create policy "athlete_tags visible to owner or parent" on public.athlete_tags for select
  using (exists (select 1 from athletes a where a.id = athlete_tags.athlete_id
                 and (a.profile_id = auth.uid() or a.parent_id = auth.uid())));
create policy "athlete or parent manages athlete tags" on public.athlete_tags for all
  using (exists (select 1 from athletes a where a.id = athlete_tags.athlete_id
                 and (a.profile_id = auth.uid() or a.parent_id = auth.uid())))
  with check (exists (select 1 from athletes a where a.id = athlete_tags.athlete_id
                 and (a.profile_id = auth.uid() or a.parent_id = auth.uid())));

-- trainer_presets
create policy "active trainer_presets are public" on public.trainer_presets for select
  using (id in (select active_preset_id from trainers where active_preset_id is not null));
create policy "trainers manage own trainer_presets" on public.trainer_presets for all
  using (trainer_id in (select id from trainers where profile_id = auth.uid()))
  with check (trainer_id in (select id from trainers where profile_id = auth.uid()));

-- posts
create policy "Published posts are publicly readable" on public.posts for select
  using (published = true or author_id = auth.uid());
create policy "Users can insert their own posts" on public.posts for insert
  with check (author_id = auth.uid());
create policy "Users can update their own posts" on public.posts for update
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "Users can delete their own posts" on public.posts for delete
  using (author_id = auth.uid());

-- post_likes
create policy "Likes are publicly readable" on public.post_likes for select using (true);
create policy "Users can like as themselves" on public.post_likes for insert with check (profile_id = auth.uid());
create policy "Users can unlike their own like" on public.post_likes for delete using (profile_id = auth.uid());

-- follows
create policy "Follows are publicly readable" on public.follows for select using (true);
create policy "Users can follow as themselves" on public.follows for insert with check (follower_id = auth.uid());
create policy "Users can unfollow as themselves" on public.follows for delete using (follower_id = auth.uid());

-- post_bookmarks
create policy "Users can view their own bookmarks" on public.post_bookmarks for select using (profile_id = auth.uid());
create policy "Users can bookmark as themselves" on public.post_bookmarks for insert with check (profile_id = auth.uid());
create policy "Users can remove their own bookmark" on public.post_bookmarks for delete using (profile_id = auth.uid());

-- post_reports
create policy "Users can view their own submitted reports" on public.post_reports for select using (reporter_id = auth.uid());
create policy "Users can report as themselves" on public.post_reports for insert with check (reporter_id = auth.uid());
create policy "Admins can view all reports" on public.post_reports for select
  using (exists (select 1 from admin_roles where admin_roles.profile_id = auth.uid()));
create policy "Admins can dismiss reports" on public.post_reports for delete
  using (exists (select 1 from admin_roles where admin_roles.profile_id = auth.uid()));

-- comments
create policy "Comments are publicly readable" on public.comments for select using (true);
create policy "Users can comment as themselves" on public.comments for insert with check (author_id = auth.uid());
create policy "Users can delete their own comments" on public.comments for delete using (author_id = auth.uid());

-- comment_reports
create policy "Users can view their own comment reports" on public.comment_reports for select using (reporter_id = auth.uid());
create policy "Users can report comments as themselves" on public.comment_reports for insert with check (reporter_id = auth.uid());
create policy "Admins can view all comment reports" on public.comment_reports for select
  using (exists (select 1 from admin_roles where admin_roles.profile_id = auth.uid()));
create policy "Admins can dismiss comment reports" on public.comment_reports for delete
  using (exists (select 1 from admin_roles where admin_roles.profile_id = auth.uid()));

-- admin_roles
create policy "admins can view admin roles" on public.admin_roles for select
  using (exists (select 1 from admin_roles admin_roles_1 where admin_roles_1.profile_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- STORAGE BUCKETS
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('post-thumbnails', 'post-thumbnails', true, 5242880, null),
  ('post-videos', 'post-videos', true, 209715200, null),
  ('verification-docs', 'verification-docs', false, null, null)
on conflict (id) do nothing;

create policy "users upload own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users update own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users delete own avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own post videos" on storage.objects for insert
  with check (bucket_id = 'post-videos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Post thumbnails are publicly readable" on storage.objects for select
  using (bucket_id = 'post-thumbnails');
create policy "Users can upload their own post thumbnails" on storage.objects for insert
  with check (bucket_id = 'post-thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "trainer uploads own verification doc" on storage.objects for insert
  with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "trainer reads own verification doc" on storage.objects for select
  using (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);

-- NOTE: intentionally no public "avatars/post-videos are publicly readable"
-- SELECT policy is created here — the broad SELECT/list policies that used
-- to exist on both buckets were removed on 2026-08-05 (Batch 1, item 2) to
-- stop client enumeration of bucket contents. Object URLs remain fetchable
-- directly without a SELECT policy on public buckets; only LISTING requires
-- one, and we deliberately do not want listing enabled.
