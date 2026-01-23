-- Homeschool Helper Database Schema for Supabase
-- Run this SQL in your Supabase Dashboard: SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  homeschool_name text,
  parent_name text,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'premium')),
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- CHILDREN TABLE
-- =============================================
create table if not exists public.children (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  state_code text,
  birth_date date,
  grade_level text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on children
alter table public.children enable row level security;

-- Children policies
create policy "Users can view own children" on public.children
  for select using (auth.uid() = user_id);

create policy "Users can create own children" on public.children
  for insert with check (auth.uid() = user_id);

create policy "Users can update own children" on public.children
  for update using (auth.uid() = user_id);

create policy "Users can delete own children" on public.children
  for delete using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists children_user_id_idx on public.children(user_id);

-- =============================================
-- SUBJECTS TABLE
-- =============================================
create table if not exists public.subjects (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  name text not null,
  required_hours integer default 0,
  color text default '#8FB39A',
  schoolwork_reminder_frequency text check (schoolwork_reminder_frequency in ('weekly', 'biweekly', 'monthly', null)),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on subjects
alter table public.subjects enable row level security;

-- Subjects policies (through children relationship)
create policy "Users can view subjects of own children" on public.subjects
  for select using (
    exists (
      select 1 from public.children
      where children.id = subjects.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can create subjects for own children" on public.subjects
  for insert with check (
    exists (
      select 1 from public.children
      where children.id = subjects.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can update subjects of own children" on public.subjects
  for update using (
    exists (
      select 1 from public.children
      where children.id = subjects.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can delete subjects of own children" on public.subjects
  for delete using (
    exists (
      select 1 from public.children
      where children.id = subjects.child_id
      and children.user_id = auth.uid()
    )
  );

-- Index for faster queries
create index if not exists subjects_child_id_idx on public.subjects(child_id);

-- =============================================
-- HOUR LOGS TABLE
-- =============================================
create table if not exists public.hour_logs (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  hours decimal(5,2) not null,
  date date not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on hour_logs
alter table public.hour_logs enable row level security;

-- Hour logs policies
create policy "Users can view hour logs of own children" on public.hour_logs
  for select using (
    exists (
      select 1 from public.children
      where children.id = hour_logs.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can create hour logs for own children" on public.hour_logs
  for insert with check (
    exists (
      select 1 from public.children
      where children.id = hour_logs.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can update hour logs of own children" on public.hour_logs
  for update using (
    exists (
      select 1 from public.children
      where children.id = hour_logs.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can delete hour logs of own children" on public.hour_logs
  for delete using (
    exists (
      select 1 from public.children
      where children.id = hour_logs.child_id
      and children.user_id = auth.uid()
    )
  );

-- Indexes for faster queries
create index if not exists hour_logs_child_id_idx on public.hour_logs(child_id);
create index if not exists hour_logs_subject_id_idx on public.hour_logs(subject_id);
create index if not exists hour_logs_date_idx on public.hour_logs(date);

-- =============================================
-- OUTDOOR LOGS TABLE
-- =============================================
create table if not exists public.outdoor_logs (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  activity_type text not null,
  hours decimal(5,2) not null,
  date date not null,
  location text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.outdoor_logs enable row level security;

-- Outdoor logs policies
create policy "Users can manage outdoor logs of own children" on public.outdoor_logs
  for all using (
    exists (
      select 1 from public.children
      where children.id = outdoor_logs.child_id
      and children.user_id = auth.uid()
    )
  );

-- =============================================
-- VOLUNTEER LOGS TABLE (Premium Feature)
-- =============================================
create table if not exists public.volunteer_logs (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  category text,
  organization text not null,
  role text,
  description text,
  start_date date,
  end_date date,
  ongoing boolean default false,
  hours decimal(6,2),
  grade_level text[], -- Array of grade levels
  achievements text,
  supervisor_name text,
  supervisor_contact text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.volunteer_logs enable row level security;

-- Volunteer logs policies
create policy "Users can manage volunteer logs of own children" on public.volunteer_logs
  for all using (
    exists (
      select 1 from public.children
      where children.id = volunteer_logs.child_id
      and children.user_id = auth.uid()
    )
  );

-- =============================================
-- EXTRACURRICULAR LOGS TABLE (Premium Feature)
-- =============================================
create table if not exists public.extracurricular_logs (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.extracurricular_logs enable row level security;

-- Extracurricular logs policies
create policy "Users can manage extracurricular logs of own children" on public.extracurricular_logs
  for all using (
    exists (
      select 1 from public.children
      where children.id = extracurricular_logs.child_id
      and children.user_id = auth.uid()
    )
  );

-- =============================================
-- SCHOOLWORK SAMPLES TABLE
-- =============================================
create table if not exists public.schoolwork_samples (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  image_url text not null, -- Base64 encoded image or URL
  file_name text,
  file_size integer, -- Size in bytes
  notes text,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.schoolwork_samples enable row level security;

-- Schoolwork samples policies
create policy "Users can manage schoolwork samples of own children" on public.schoolwork_samples
  for all using (
    exists (
      select 1 from public.children
      where children.id = schoolwork_samples.child_id
      and children.user_id = auth.uid()
    )
  );

-- Index for faster queries
create index if not exists schoolwork_samples_child_subject_idx on public.schoolwork_samples(child_id, subject_id);

-- =============================================
-- READ ALOUD TRACKING TABLE (Premium Feature)
-- =============================================
create table if not exists public.read_aloud_logs (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  book_id text,
  book_title text not null,
  book_author text,
  completed boolean default false,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.read_aloud_logs enable row level security;

-- Read aloud logs policies
create policy "Users can manage read aloud logs of own children" on public.read_aloud_logs
  for all using (
    exists (
      select 1 from public.children
      where children.id = read_aloud_logs.child_id
      and children.user_id = auth.uid()
    )
  );

-- =============================================
-- HELPFUL VIEWS
-- =============================================

-- View: Total hours per child per subject
create or replace view public.child_subject_hours as
select 
  c.id as child_id,
  c.name as child_name,
  s.id as subject_id,
  s.name as subject_name,
  s.required_hours,
  coalesce(sum(hl.hours), 0) as logged_hours,
  round((coalesce(sum(hl.hours), 0) / nullif(s.required_hours, 0)) * 100, 1) as progress_percent
from public.children c
join public.subjects s on s.child_id = c.id
left join public.hour_logs hl on hl.subject_id = s.id
group by c.id, c.name, s.id, s.name, s.required_hours;

-- =============================================
-- STORAGE BUCKET FOR PHOTOS (Optional)
-- =============================================
-- Run this in SQL Editor to create a storage bucket for ID card photos

-- insert into storage.buckets (id, name, public) 
-- values ('photos', 'photos', true);

-- create policy "Users can upload photos"
-- on storage.objects for insert
-- with check (bucket_id = 'photos' and auth.role() = 'authenticated');

-- create policy "Users can view photos"
-- on storage.objects for select
-- using (bucket_id = 'photos');

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;
