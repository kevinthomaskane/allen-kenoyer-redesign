-- Per ADR-0007: public-read bucket for dev-managed + admin-uploaded images.
-- Patterns are excluded per ADR-0017 (they live in /public/).

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true);

-- Public read (anon + authenticated; bucket.public also serves CDN reads without auth).
create policy "site_images_public_read"
on storage.objects
for select
using (bucket_id = 'site-images');

-- Authenticated writes. INSERT + UPDATE + DELETE for admin dashboard uploads (Phase 2).
-- Upsert needs SELECT + UPDATE in addition to INSERT (covered by public_read above).
create policy "site_images_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'site-images');

create policy "site_images_authenticated_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'site-images')
with check (bucket_id = 'site-images');

create policy "site_images_authenticated_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-images');
