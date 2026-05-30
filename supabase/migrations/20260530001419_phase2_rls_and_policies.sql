-- RLS for the Phase 2 content tables (ADR-0006).
-- Read model: anon may read published-and-visible rows; authenticated (admin)
-- reads everything. Write model: ADR-0004 flat permissions -- ANY authenticated
-- user has full CRUD on both content types, so the write predicate is
-- intentionally `true` (TO authenticated). There is no per-row ownership; the
-- usual "TO authenticated alone is BOLA" caution does not apply because the
-- flat admin model is the decision, not an oversight. (This is the source of
-- the accepted rls_policy_always_true advisories on the write policies.)

alter table public.classes enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_sessions enable row level security;
alter table public.bulletins enable row level security;

grant select on public.classes, public.cohorts, public.cohort_sessions, public.bulletins to anon, authenticated;
grant insert, update, delete on public.classes, public.cohorts, public.cohort_sessions, public.bulletins to authenticated;

-- ===== classes =====
create policy "classes_select_published_anon" on public.classes
  for select to anon using (published = true);
create policy "classes_select_all_authenticated" on public.classes
  for select to authenticated using (true);
create policy "classes_insert_authenticated" on public.classes
  for insert to authenticated with check (true);
create policy "classes_update_authenticated" on public.classes
  for update to authenticated using (true) with check (true);
create policy "classes_delete_authenticated" on public.classes
  for delete to authenticated using (true);

-- ===== cohorts =====
create policy "cohorts_select_published_anon" on public.cohorts
  for select to anon using (published = true);
create policy "cohorts_select_all_authenticated" on public.cohorts
  for select to authenticated using (true);
create policy "cohorts_insert_authenticated" on public.cohorts
  for insert to authenticated with check (true);
create policy "cohorts_update_authenticated" on public.cohorts
  for update to authenticated using (true) with check (true);
create policy "cohorts_delete_authenticated" on public.cohorts
  for delete to authenticated using (true);

-- ===== cohort_sessions ===== (gated on parent cohort being published)
create policy "sessions_select_published_anon" on public.cohort_sessions
  for select to anon using (
    exists (select 1 from public.cohorts co where co.id = cohort_id and co.published = true)
  );
create policy "sessions_select_all_authenticated" on public.cohort_sessions
  for select to authenticated using (true);
create policy "sessions_insert_authenticated" on public.cohort_sessions
  for insert to authenticated with check (true);
create policy "sessions_update_authenticated" on public.cohort_sessions
  for update to authenticated using (true) with check (true);
create policy "sessions_delete_authenticated" on public.cohort_sessions
  for delete to authenticated using (true);

-- ===== bulletins ===== (anon sees published rows within the active window)
create policy "bulletins_select_visible_anon" on public.bulletins
  for select to anon using (
    published = true
    and display_start <= now()
    and (display_end is null or display_end > now())
  );
create policy "bulletins_select_all_authenticated" on public.bulletins
  for select to authenticated using (true);
create policy "bulletins_insert_authenticated" on public.bulletins
  for insert to authenticated with check (true);
create policy "bulletins_update_authenticated" on public.bulletins
  for update to authenticated using (true) with check (true);
create policy "bulletins_delete_authenticated" on public.bulletins
  for delete to authenticated using (true);
