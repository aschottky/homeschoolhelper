-- Homeschool Helper application schema (Neon Postgres on Vercel)
--
-- Run AFTER db/auth-schema.sql (profiles references the Better Auth "user" table).
-- Translated from the old supabase-schema*.sql files:
--   * no RLS / policies / grants — access control lives in the /api layer
--   * no auth.users trigger — profile rows are created by the Better Auth
--     databaseHooks.user.create.after hook in api/_lib/auth.js
--   * user ids are text (Better Auth ids), not uuid
--   * uuid_generate_v4() -> gen_random_uuid() (built in, no extension needed)

-- =============================================
-- PROFILES (extends Better Auth "user")
-- =============================================
create table if not exists profiles (
  id text primary key references "user"(id) on delete cascade,
  email text,
  homeschool_name text,
  parent_name text,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  guardians jsonb default '[]'::jsonb,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'premium')),
  subscription_status text default 'active'
    check (subscription_status in ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired')),
  subscription_end_date timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  is_admin boolean default false,
  referral_code text,
  referred_by text references profiles(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create unique index if not exists profiles_referral_code_key
  on profiles (referral_code) where referral_code is not null;
create index if not exists profiles_stripe_customer_id_idx on profiles(stripe_customer_id);
create index if not exists profiles_subscription_status_idx on profiles(subscription_status);

-- =============================================
-- CHILDREN
-- =============================================
create table if not exists children (
  id uuid default gen_random_uuid() primary key,
  user_id text references profiles(id) on delete cascade not null,
  name text not null,
  state_code text,
  birth_date date,
  grade_level text,
  color text default '#8FB39A',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists children_user_id_idx on children(user_id);

-- =============================================
-- SUBJECTS
-- =============================================
create table if not exists subjects (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade not null,
  name text not null,
  required_hours integer default 0,
  color text default '#8FB39A',
  schoolwork_reminder_frequency text
    check (schoolwork_reminder_frequency in ('weekly', 'biweekly', 'monthly', null)),
  created_at timestamptz default now() not null
);

create index if not exists subjects_child_id_idx on subjects(child_id);

-- =============================================
-- HOUR LOGS
-- =============================================
create table if not exists hour_logs (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  hours decimal(5,2) not null,
  date date not null,
  notes text,
  created_at timestamptz default now() not null
);

create index if not exists hour_logs_child_id_idx on hour_logs(child_id);
create index if not exists hour_logs_subject_id_idx on hour_logs(subject_id);
create index if not exists hour_logs_date_idx on hour_logs(date);

-- =============================================
-- OUTDOOR LOGS (not yet cloud-synced by the UI; kept for future use)
-- =============================================
create table if not exists outdoor_logs (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade not null,
  activity_type text not null,
  hours decimal(5,2) not null,
  date date not null,
  location text,
  notes text,
  created_at timestamptz default now() not null
);

-- =============================================
-- VOLUNTEER LOGS (not yet cloud-synced by the UI; kept for future use)
-- =============================================
create table if not exists volunteer_logs (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade not null,
  category text,
  organization text not null,
  role text,
  description text,
  start_date date,
  end_date date,
  ongoing boolean default false,
  hours decimal(6,2),
  grade_level text[],
  achievements text,
  supervisor_name text,
  supervisor_contact text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- EXTRACURRICULAR LOGS (not yet cloud-synced by the UI; kept for future use)
-- =============================================
create table if not exists extracurricular_logs (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade not null,
  category text,
  organization text not null,
  role text,
  description text,
  start_date date,
  end_date date,
  ongoing boolean default false,
  hours_per_week decimal(4,2),
  weeks_per_year integer,
  grade_level text[],
  achievements text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- SCHOOLWORK SAMPLES
-- =============================================
create table if not exists schoolwork_samples (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  image_url text not null, -- base64 data URL (client-compressed)
  file_name text,
  file_size integer,
  notes text,
  uploaded_at timestamptz default now() not null
);

create index if not exists schoolwork_samples_child_subject_idx
  on schoolwork_samples(child_id, subject_id);

-- =============================================
-- READ ALOUD LOGS
-- =============================================
create table if not exists read_aloud_logs (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade not null,
  book_id text,
  book_title text not null,
  book_author text,
  completed boolean default false,
  status text default 'completed' check (status in ('want', 'reading', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now() not null
);

-- =============================================
-- EMAIL SUBSCRIBERS (landing page newsletter)
-- =============================================
create table if not exists email_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  source text default 'landing_page',
  created_at timestamptz default now() not null
);

-- =============================================
-- REFERRAL REWARDS
-- =============================================
create table if not exists referral_rewards (
  id uuid default gen_random_uuid() primary key,
  referrer_id text references profiles(id),
  referred_id text references profiles(id),
  reward_type text default 'free_month',
  status text default 'pending',
  created_at timestamptz default now() not null
);

create unique index if not exists referral_rewards_referred_id_unique on referral_rewards (referred_id);
create index if not exists referral_rewards_referrer_id_idx on referral_rewards (referrer_id);

-- =============================================
-- SUGGESTED READ-ALOUD BOOKS (admin-managed, public read)
-- =============================================
create table if not exists suggested_books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text,
  illustrator text,
  age_group text not null,
  genre text,
  description text,
  sort_order int default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- SCHEDULES (per-subject lesson plan for the school year)
-- =============================================
-- Lessons are NOT pinned to dates: each scheduled day serves the next
-- uncompleted lessons, so a missed day rolls everything forward on its own.
create table if not exists schedules (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null unique,
  title text, -- curriculum name ("Saxon Math 5/4") or activity label ("Flying a kite")
  kind text default 'numbered' not null check (kind in ('numbered', 'activity')),
  unit_label text default 'Lesson' not null, -- what one session covers: Lesson/Unit/Chapter/custom
  -- Recurrence: weekly (every interval_weeks on days_of_week) or monthly
  -- (the month_ordinal-th month_weekday of each month; -1 = last)
  freq text default 'weekly' not null check (freq in ('weekly', 'monthly')),
  interval_weeks smallint default 1 not null,
  month_ordinal smallint, -- 1..4 or -1 (last); monthly only
  month_weekday smallint, -- 0=Sun .. 6=Sat; monthly only
  days_of_week smallint[] default '{}' not null, -- 0=Sun .. 6=Sat; weekly only
  start_date date not null,
  end_date date not null,
  start_lesson integer default 1 not null,
  lessons_per_session integer default 1 not null,
  total_lessons integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists schedules_child_id_idx on schedules(child_id);

-- =============================================
-- SCHEDULE BREAKS (family-wide no-school date ranges)
-- =============================================
create table if not exists schedule_breaks (
  id uuid default gen_random_uuid() primary key,
  user_id text references profiles(id) on delete cascade not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now() not null
);

create index if not exists schedule_breaks_user_id_idx on schedule_breaks(user_id);

-- =============================================
-- LESSON COMPLETIONS (one row per checked-off lesson)
-- =============================================
create table if not exists lesson_completions (
  id uuid default gen_random_uuid() primary key,
  schedule_id uuid references schedules(id) on delete cascade not null,
  lesson_number integer not null,
  completed_on date not null,
  notes text, -- e.g. what was read that day
  created_at timestamptz default now() not null,
  unique (schedule_id, lesson_number)
);

create index if not exists lesson_completions_schedule_id_idx on lesson_completions(schedule_id);

-- =============================================
-- HOMEPAGE RESOURCES (admin-managed, public read)
-- =============================================
create table if not exists resources (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  count_label text,
  items jsonb default '[]'::jsonb,
  color text default 'sage',
  link text,
  sort_order int default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
