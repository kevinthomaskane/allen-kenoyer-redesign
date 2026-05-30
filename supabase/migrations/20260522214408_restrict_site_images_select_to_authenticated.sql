-- The previous broad public SELECT policy on storage.objects allowed anon clients to
-- list every file in the bucket. Public object fetches don't need this -- the
-- /storage/v1/object/public/<bucket>/<path> CDN endpoint serves files directly
-- because bucket.public = true. Listing was unintended exposure.
--
-- Narrow SELECT to authenticated only so the future admin dashboard's upsert flow
-- (which needs SELECT + INSERT + UPDATE per Supabase storage docs) continues to work.

drop policy "site_images_public_read" on storage.objects;

create policy "site_images_authenticated_select"
on storage.objects
for select
to authenticated
using (bucket_id = 'site-images');
