-- Phase 2 content schema: classes -> cohorts -> cohort_sessions, and bulletins.
-- ADR-0015 (classes), ADR-0016 (bulletins), ADR-0020 (gcal sync columns),
-- ADR-0021 (cohort.kind). Datetime columns are timestamptz (UTC) per dev-guide.

create extension if not exists moddatetime schema extensions;

-- Enums
create type public.class_category as enum ('stained_glass', 'mosaic', 'fused_glass', 'other');
create type public.skill_level as enum ('beginner', 'intermediate', 'advanced', 'all_levels');
create type public.cohort_kind as enum ('multi_session', 'single_session');

-- classes: one row per named course (stable fields)
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category public.class_category not null,
  skill_level public.skill_level not null,
  prerequisite text,
  description text not null,
  tuition numeric(10,2) not null,
  supply_fee numeric(10,2),
  kit_fee numeric(10,2),
  fee_notes text,
  max_students integer,
  image_url text,
  image_alt text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- ADR-0015: image_alt required when image_url is present
  constraint classes_image_alt_required check (image_url is null or image_alt is not null)
);

-- cohorts: one row per offering of a class
create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  kind public.cohort_kind not null,
  label text,
  enrollment_count integer,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- ADR-0015/0021: label required for multi_session; optional for single_session
  constraint cohorts_label_required_for_multi check (kind <> 'multi_session' or label is not null)
);

-- cohort_sessions: one row per individual session date
create table public.cohort_sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- ADR-0020 gcal sync columns
  gcal_event_id text,
  sync_status text not null default 'pending' check (sync_status in ('synced', 'pending', 'failed')),
  sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cohort_sessions_ends_after_starts check (ends_at > starts_at)
);

-- bulletins: single table, markdown body, display window (ADR-0016)
create table public.bulletins (
  id uuid primary key default gen_random_uuid(),
  title text,
  message text not null,
  display_start timestamptz not null default now(),
  display_end timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bulletins_end_after_start check (display_end is null or display_end > display_start)
);

-- Indexes supporting visibility + ordering queries
create index cohorts_class_id_idx on public.cohorts (class_id);
create index cohort_sessions_cohort_id_idx on public.cohort_sessions (cohort_id);
create index cohort_sessions_ends_at_idx on public.cohort_sessions (ends_at);
create index cohort_sessions_starts_at_idx on public.cohort_sessions (starts_at);
create index bulletins_display_start_idx on public.bulletins (display_start);

-- updated_at maintenance via moddatetime
create trigger set_updated_at before update on public.classes
  for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.cohorts
  for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.cohort_sessions
  for each row execute function extensions.moddatetime(updated_at);
create trigger set_updated_at before update on public.bulletins
  for each row execute function extensions.moddatetime(updated_at);
