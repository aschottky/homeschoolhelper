-- Migration for databases created before 2026-10-12: edit a single day of a
-- schedule (skip it, move it, change its lesson count or label) without
-- touching the rest of the series. Fresh installs get this from schema.sql;
-- run once against an existing DB:
--   psql "$DATABASE_URL" -f db/migrate-day-overrides.sql

create table if not exists schedule_day_overrides (
  id uuid default gen_random_uuid() primary key,
  schedule_id uuid references schedules(id) on delete cascade not null,
  override_on date not null,
  skip boolean default false not null,
  moved_to date,  -- the session happens on this date instead
  lessons integer, -- lessons served that day (null = the series default)
  title text,      -- label shown that day (null = the series title)
  created_at timestamptz default now() not null,
  unique (schedule_id, override_on)
);

create index if not exists schedule_day_overrides_schedule_id_idx on schedule_day_overrides(schedule_id);
