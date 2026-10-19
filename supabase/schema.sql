-- Clubs for Love — Supabase schema (schema: clubs4love) in the shared "james-sites" project.
-- Lives in its OWN schema so it never touches other sites' tables. Safe to re-run.
-- Row Level Security on every table:
--   * Anyone (no login) can SEND a form (donation, pickup, need-clubs request, drop-site,
--     round sponsor, contact). Nobody but an admin can READ submissions, except that a
--     signed-in member can read the ones they sent while signed in.
--   * Events (calendar) are public to read when published; admins manage them.
--   * Members manage only their own profile and event interest.
--   * Admin powers come from rows in clubs4love.admins (managed in the SQL editor).
-- Photos go to the PRIVATE storage bucket "clubs4love-photos" (upload-only for the public,
-- readable by admins only through signed URLs).
-- After running: Project Settings > Data API > Exposed schemas must include "clubs4love".

create extension if not exists pgcrypto with schema extensions;
create schema if not exists clubs4love;

-- ------------------------------------------------------------------ profiles
-- Created by the site on first sign-in (no trigger on the shared auth.users table).
create table if not exists clubs4love.profiles (
  id           uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  town         text check (char_length(town) <= 60),
  role         text check (role in ('donor','golfer','coach','house','business','volunteer')),
  phone        text check (char_length(phone) <= 30),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists clubs4love.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  note       text,
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------- submissions
-- Every form on the site lands here. user_id is filled automatically when the sender is signed in.
create table if not exists clubs4love.submissions (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('donation','pickup','request','affiliate','sponsor','contact')),
  user_id      uuid default auth.uid() references auth.users (id) on delete set null,
  name         text not null check (char_length(name) between 1 and 120),
  email        text not null check (char_length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone        text check (char_length(phone) <= 30),
  details      jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object' and octet_length(details::text) <= 8000),
  photo_paths  text[] not null default '{}' check (cardinality(photo_paths) <= 12),
  wants_ack    boolean not null default false,
  status       text not null default 'new' check (status in ('new','contacted','scheduled','received','matched','closed','spam')),
  ack_sent_at  timestamptz,
  admin_note   text check (char_length(admin_note) <= 2000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists c4l_sub_created_idx on clubs4love.submissions (created_at desc);
create index if not exists c4l_sub_user_idx on clubs4love.submissions (user_id, created_at desc);
create index if not exists c4l_sub_email_idx on clubs4love.submissions (lower(email), created_at desc);

-- -------------------------------------------------------------------- events
create table if not exists clubs4love.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) <= 120),
  place       text check (char_length(place) <= 160),
  starts_on   date,
  date_label  text check (char_length(date_label) <= 60),   -- e.g. "Date TBA"
  description text check (char_length(description) <= 1000),
  published   boolean not null default true,
  sort        int not null default 100,
  created_at  timestamptz not null default now()
);

create table if not exists clubs4love.event_interest (
  event_id   uuid not null references clubs4love.events (id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  note       text check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ------------------------------------------------------------------- helpers
create or replace function clubs4love.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists c4l_profiles_updated_at on clubs4love.profiles;
create trigger c4l_profiles_updated_at before update on clubs4love.profiles
  for each row execute function clubs4love.set_updated_at();
drop trigger if exists c4l_submissions_updated_at on clubs4love.submissions;
create trigger c4l_submissions_updated_at before update on clubs4love.submissions
  for each row execute function clubs4love.set_updated_at();

create or replace function clubs4love.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from clubs4love.admins where user_id = auth.uid())
$$;

-- Guard on public inserts: forces safe defaults, validates photo paths, light rate limit.
create or replace function clubs4love.guard_submission() returns trigger
language plpgsql security definer set search_path = '' as $$
declare p text;
begin
  if clubs4love.is_admin() then return new; end if;
  new.status := 'new'; new.ack_sent_at := null; new.admin_note := null;
  new.user_id := auth.uid();           -- null for guests; never someone else's id
  new.email := lower(trim(new.email));
  foreach p in array new.photo_paths loop
    if p !~ '^submissions/[0-9a-f-]{36}/[A-Za-z0-9._-]{1,80}$' then
      raise exception 'Invalid photo reference' using errcode = '22023';
    end if;
  end loop;
  if (select count(*) from clubs4love.submissions s
       where lower(s.email) = new.email and s.created_at > now() - interval '1 hour') >= 6 then
    raise exception 'Too many forms from this email in the last hour. Please try again later.' using errcode = '54000';
  end if;
  if (select count(*) from clubs4love.submissions s where s.created_at > now() - interval '10 minutes') >= 120 then
    raise exception 'The site is busy. Please try again in a few minutes.' using errcode = '54000';
  end if;
  return new;
end $$;
drop trigger if exists c4l_submissions_guard on clubs4love.submissions;
create trigger c4l_submissions_guard before insert on clubs4love.submissions
  for each row execute function clubs4love.guard_submission();

-- ----------------------------------------------------------------------- RLS
alter table clubs4love.profiles       enable row level security;
alter table clubs4love.admins         enable row level security;
alter table clubs4love.submissions    enable row level security;
alter table clubs4love.events         enable row level security;
alter table clubs4love.event_interest enable row level security;

drop policy if exists profiles_select on clubs4love.profiles;
drop policy if exists profiles_insert_own on clubs4love.profiles;
drop policy if exists profiles_update_own on clubs4love.profiles;
drop policy if exists profiles_delete_own on clubs4love.profiles;
create policy profiles_select on clubs4love.profiles for select to authenticated using (id = (select auth.uid()) or (select clubs4love.is_admin()));
create policy profiles_insert_own on clubs4love.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_own on clubs4love.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_delete_own on clubs4love.profiles for delete to authenticated using (id = (select auth.uid()));

drop policy if exists admins_select_self on clubs4love.admins;
create policy admins_select_self on clubs4love.admins for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists submissions_insert_public on clubs4love.submissions;
drop policy if exists submissions_select on clubs4love.submissions;
drop policy if exists submissions_update_admin on clubs4love.submissions;
drop policy if exists submissions_delete on clubs4love.submissions;
create policy submissions_insert_public on clubs4love.submissions for insert to anon, authenticated
  with check (status = 'new' and admin_note is null and ack_sent_at is null and (user_id is null or user_id = (select auth.uid())));
create policy submissions_select on clubs4love.submissions for select to authenticated
  using (user_id = (select auth.uid()) or (select clubs4love.is_admin()));
create policy submissions_update_admin on clubs4love.submissions for update to authenticated
  using ((select clubs4love.is_admin())) with check ((select clubs4love.is_admin()));
create policy submissions_delete on clubs4love.submissions for delete to authenticated
  using (user_id = (select auth.uid()) or (select clubs4love.is_admin()));

drop policy if exists events_select on clubs4love.events;
drop policy if exists events_admin_write on clubs4love.events;
create policy events_select on clubs4love.events for select to anon, authenticated using (published or (select clubs4love.is_admin()));
create policy events_admin_write on clubs4love.events for all to authenticated using ((select clubs4love.is_admin())) with check ((select clubs4love.is_admin()));

drop policy if exists interest_select on clubs4love.event_interest;
drop policy if exists interest_insert_own on clubs4love.event_interest;
drop policy if exists interest_delete_own on clubs4love.event_interest;
create policy interest_select on clubs4love.event_interest for select to authenticated using (user_id = (select auth.uid()) or (select clubs4love.is_admin()));
create policy interest_insert_own on clubs4love.event_interest for insert to authenticated with check (user_id = (select auth.uid()));
create policy interest_delete_own on clubs4love.event_interest for delete to authenticated using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------- functions
create or replace function clubs4love.my_roles() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('admin', clubs4love.is_admin())
$$;

-- Public: how many people said "I'm interested" per event (counts only, no names).
create or replace function clubs4love.event_interest_counts() returns table (event_id uuid, interested bigint)
language sql stable security definer set search_path = '' as $$
  select e.id, count(i.user_id) from clubs4love.events e
    left join clubs4love.event_interest i on i.event_id = e.id
   where e.published group by e.id
$$;

create or replace function clubs4love.admin_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not clubs4love.is_admin() then raise exception 'Admins only' using errcode = '42501'; end if;
  return jsonb_build_object(
    'generated_at', now(),
    'members', (select count(*) from clubs4love.profiles),
    'by_kind', coalesce((select jsonb_object_agg(kind, n) from (select kind, count(*) n from clubs4love.submissions group by kind) k), '{}'::jsonb),
    'by_status', coalesce((select jsonb_object_agg(status, n) from (select status, count(*) n from clubs4love.submissions group by status) s), '{}'::jsonb),
    'open_new', (select count(*) from clubs4love.submissions where status = 'new'),
    'acks_pending', (select count(*) from clubs4love.submissions where wants_ack and status = 'received' and ack_sent_at is null),
    'event_interest', (select count(*) from clubs4love.event_interest));
end $$;

-- Member deletes everything this site stored about them (the login itself is shared; see privacy page).
create or replace function clubs4love.delete_my_data() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Please sign in first' using errcode = '28000'; end if;
  delete from clubs4love.event_interest where user_id = uid;
  delete from clubs4love.submissions where user_id = uid;
  delete from clubs4love.profiles where id = uid;
end $$;

create or replace function clubs4love.health() returns jsonb
language sql stable set search_path = '' as $$ select jsonb_build_object('ok', true, 'schema', 'clubs4love', 'version', 'v1') $$;

-- ---------------------------------------------------------------- privileges
revoke all on all tables in schema clubs4love from anon, authenticated, public;
revoke all on all functions in schema clubs4love from anon, authenticated, public;
grant usage on schema clubs4love to anon, authenticated, service_role;
grant insert on clubs4love.submissions to anon;
grant select, insert, update, delete on clubs4love.submissions to authenticated;
grant select, insert, update, delete on clubs4love.profiles to authenticated;
grant select on clubs4love.admins to authenticated;
grant select on clubs4love.events to anon;
grant select, insert, update, delete on clubs4love.events to authenticated;
grant select, insert, delete on clubs4love.event_interest to authenticated;
grant all on all tables in schema clubs4love to service_role;
grant execute on function clubs4love.health(), clubs4love.event_interest_counts(), clubs4love.is_admin() to anon, authenticated;  -- is_admin is used inside policies; returns false for anon
grant execute on function clubs4love.my_roles(), clubs4love.admin_stats(), clubs4love.delete_my_data() to authenticated;
alter default privileges in schema clubs4love revoke execute on functions from public;

-- -------------------------------------------------------------- seed events
insert into clubs4love.events (title, place, date_label, description, sort)
select * from (values
  ('Recovery 9-hole', 'Upper Cape — course TBA', 'Date TBA', 'A relaxed nine for people in recovery. Clubs provided if you need them.', 10),
  ('Intro clinic', 'Mashpee', 'Date TBA', 'First swings with a coach. Beginners welcome.', 20),
  ('Auction night', 'Host club TBA', 'Date TBA', 'Extra sets go to auction. Proceeds pay green fees, lessons, and recovery golf days.', 30)
) v(title, place, date_label, description, sort)
where not exists (select 1 from clubs4love.events);

-- ------------------------------------------------------------ photo storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('clubs4love-photos', 'clubs4love-photos', false, 8388608,
        array['image/jpeg','image/png','image/webp','image/heic','image/heif','image/gif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "clubs4love photos: anyone uploads" on storage.objects;
drop policy if exists "clubs4love photos: admin read" on storage.objects;
drop policy if exists "clubs4love photos: admin delete" on storage.objects;
create policy "clubs4love photos: anyone uploads" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'clubs4love-photos' and name ~ '^submissions/[0-9a-f-]{36}/[A-Za-z0-9._-]{1,80}$');
create policy "clubs4love photos: admin read" on storage.objects for select to authenticated
  using (bucket_id = 'clubs4love-photos' and (select clubs4love.is_admin()));
create policy "clubs4love photos: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'clubs4love-photos' and (select clubs4love.is_admin()));
