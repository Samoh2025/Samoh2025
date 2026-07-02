-- =============================================================================
-- One Horizon Homes — Sam's Sales Team · Supabase database
-- =============================================================================
-- Run this ONCE in your Supabase project:
--   Supabase dashboard → SQL Editor → New query → paste all of this → Run.
--
-- It creates the tables the app uses, locks them down with Row Level Security
-- so only signed-in members of the team can read/write, and wires up a trigger
-- so that anyone who creates an account automatically appears on the team.
--
-- IMPORTANT: the admin email below must match CONFIG.admin.email in src/config.ts.
-- That address becomes the Admin. As a fallback, the very first account created
-- in an empty workspace also becomes the Admin.
-- =============================================================================

-- ------------------------------------------------------------------ extensions
create extension if not exists pgcrypto;   -- for gen_random_uuid()

-- --------------------------------------------------------------------- tables

-- The sales team roster. One row per person. `user_id` links to the login
-- account once they sign up; it stays NULL for reps the admin pre-added ("invited").
create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique references auth.users (id) on delete set null,
  email      text not null,
  name       text not null default '',
  title      text not null default 'Sales Consultant',
  phone      text not null default '',
  role       text not null default 'rep' check (role in ('admin', 'rep')),
  initials   text not null default '',
  color      text not null default '#111111',
  lat        double precision,
  lng        double precision,
  created_at timestamptz not null default now()
);
create unique index if not exists team_members_email_key
  on public.team_members (lower(email));

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text not null default '',
  email        text not null default '',
  address      text not null default '',
  type         text not null default 'Kitchen Remodel',
  value        numeric not null default 0,
  stage        text not null default 'new'
                 check (stage in ('new','contacted','appointment','quoted','won','lost')),
  source       text not null default 'Manual',
  rep_id       uuid references public.team_members (id) on delete set null,
  note         text,
  lat          double precision,
  lng          double precision,
  knock_status text not null default 'not_knocked'
                 check (knock_status in ('not_knocked','no_answer','callback','interested','not_interested')),
  created_at   timestamptz not null default now(),
  created_by   uuid default auth.uid()
);

create table if not exists public.projects (
  id         uuid primary key default gen_random_uuid(),
  client     text not null,
  type       text not null default 'Kitchen Remodel',
  address    text not null default '',
  value      numeric not null default 0,
  status     text not null default 'Estimating'
               check (status in ('Estimating','Proposal Sent','Contract Signed','In Progress','Completed')),
  rep_id     uuid references public.team_members (id) on delete set null,
  start_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id         uuid primary key default gen_random_uuid(),
  title      text not null default '',
  client     text not null,
  address    text not null default '',
  date       timestamptz not null default now(),
  rep_id     uuid references public.team_members (id) on delete set null,
  kind       text not null default 'Consultation'
               check (kind in ('Consultation','Site Visit','Walkthrough','Closing')),
  done       boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.activity (
  id         uuid primary key default gen_random_uuid(),
  text       text not null,
  kind       text not null default 'lead'
               check (kind in ('lead','win','appointment','project','team')),
  at         timestamptz not null default now()
);

-- ------------------------------------------------------ admin helper function
-- Used by policies. SECURITY DEFINER so it can read team_members without
-- tripping the very policies it is being used to evaluate (no recursion).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------- row level security
alter table public.team_members enable row level security;
alter table public.leads        enable row level security;
alter table public.projects     enable row level security;
alter table public.appointments enable row level security;
alter table public.activity     enable row level security;

-- team_members: everyone signed in can see the roster. Only the admin can add
-- or remove people; a member may edit their own row (name, phone, location).
drop policy if exists tm_select on public.team_members;
create policy tm_select on public.team_members
  for select to authenticated using (true);

drop policy if exists tm_insert on public.team_members;
create policy tm_insert on public.team_members
  for insert to authenticated with check (public.is_admin());

drop policy if exists tm_update on public.team_members;
create policy tm_update on public.team_members
  for update to authenticated
  using (public.is_admin() or user_id = auth.uid())
  with check (public.is_admin() or user_id = auth.uid());

drop policy if exists tm_delete on public.team_members;
create policy tm_delete on public.team_members
  for delete to authenticated using (public.is_admin());

-- Shared team data: any signed-in member can read and write. (This whole
-- Supabase project belongs to Sam's org, so the whole team shares this data.)
do $$
declare t text;
begin
  foreach t in array array['leads','projects','appointments','activity'] loop
    execute format('drop policy if exists %I_all on public.%I;', t, t);
    execute format(
      'create policy %I_all on public.%I for all to authenticated using (true) with check (true);',
      t, t);
  end loop;
end $$;

-- ------------------------------------------------ auto-add new accounts to team
-- When someone creates a login, put them on the team. If the admin already
-- "invited" that email (a roster row with no user_id), link it; otherwise make
-- a new roster row. The configured admin email — or the first account ever — is
-- made Admin; everyone else is a Sales Rep.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email  text := 'sam@onehorizonhomes.com';   -- keep in sync with src/config.ts
  display_name text := coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''),
                                split_part(new.email, '@', 1));
  existing     public.team_members;
begin
  select * into existing
    from public.team_members
    where lower(email) = lower(new.email)
    limit 1;

  if found then
    update public.team_members
      set user_id  = new.id,
          name     = coalesce(nullif(existing.name, ''), display_name),
          initials = coalesce(nullif(existing.initials, ''), upper(left(display_name, 1))),
          role     = case when lower(new.email) = lower(admin_email) then 'admin'
                          else existing.role end
      where id = existing.id;
  else
    insert into public.team_members (user_id, email, name, role, initials, color)
    values (
      new.id,
      new.email,
      display_name,
      case
        when lower(new.email) = lower(admin_email) then 'admin'
        when not exists (select 1 from public.team_members) then 'admin'  -- first ever
        else 'rep'
      end,
      upper(left(display_name, 1)),
      '#111111'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------------- realtime sync
-- Push inserts/updates/deletes to every connected device so the team sees
-- changes live. Safe to run repeatedly.
do $$
declare t text;
begin
  foreach t in array array['team_members','leads','projects','appointments','activity'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I;', t);
    exception when duplicate_object then
      null;  -- already added
    end;
  end loop;
end $$;

-- Done. Reload the app and create the first account (that becomes the Admin).
