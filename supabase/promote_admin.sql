-- Run this in Supabase SQL Editor to promote a user to admin.
-- The user must already have signed up via /signup before running this.

update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'arbaazcode@gmail.com');

-- Verify it worked:
select p.id, p.role, u.email
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'arbaazcode@gmail.com';
