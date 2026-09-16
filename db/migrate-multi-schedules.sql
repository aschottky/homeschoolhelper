-- Migration for databases created before 2026-09-11: allow a subject to
-- carry several schedules at once (e.g. two math curricula).
-- Fresh installs get this from schema.sql; run once against an existing DB:
--   psql "$DATABASE_URL" -f db/migrate-multi-schedules.sql

alter table schedules drop constraint if exists schedules_subject_id_key;
create index if not exists schedules_subject_id_idx on schedules(subject_id);
