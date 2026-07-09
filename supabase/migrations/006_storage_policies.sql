-- Kokoro — allow admins with menu permission to upload/update/delete files
-- in the public "menu-images" storage bucket. Public read is already on (public bucket).
-- Run in Supabase SQL Editor. Safe to re-run.

-- NOTE: No SELECT/read policy needed — the bucket is PUBLIC, so files are already
-- served by URL. Adding a broad SELECT policy would let clients LIST all filenames
-- (Supabase flags this), so we intentionally omit it.

-- Admins with menu permission can INSERT (upload).
drop policy if exists "menu_images_admin_insert" on storage.objects;
create policy "menu_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'menu-images' and public.has_perm('menu'));

-- Admins with menu permission can UPDATE (overwrite).
drop policy if exists "menu_images_admin_update" on storage.objects;
create policy "menu_images_admin_update" on storage.objects
  for update using (bucket_id = 'menu-images' and public.has_perm('menu'));

-- Admins with menu permission can DELETE.
drop policy if exists "menu_images_admin_delete" on storage.objects;
create policy "menu_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'menu-images' and public.has_perm('menu'));
