-- Migration for databases created before 2026-09-23: per-day notes on
-- schedule cards. Fresh installs get this from schema.sql; run once
-- against an existing DB (see DEPLOYMENT.md, or the node/pg one-liner).

create table if not exists schedule_day_notes (
  id uuid default gen_random_uuid() primary key,
  schedule_id uuid references schedules(id) on delete cascade not null,
  note_on date not null,
  notes text not null,
  created_at timestamptz default now() not null,
  unique (schedule_id, note_on)
);

create index if not exists schedule_day_notes_schedule_id_idx on schedule_day_notes(schedule_id);
