-- Kokoro — DESTRUCTIVE reset.
-- Keeps: menu (categories + items), and arbaazcode@gmail.com as the sole super_admin.
-- Deletes: all orders, order items, reviews, contact inquiries, push subscriptions,
--          activity log, and every user account EXCEPT arbaazcode@gmail.com.
-- Run in Supabase SQL Editor. THIS CANNOT BE UNDONE.

begin;

-- 1) Wipe transactional / user-generated data.
delete from public.reviews;
delete from public.order_items;
delete from public.orders;
delete from public.contact_messages;
delete from public.push_subscriptions;
delete from public.activity_log;

-- 2) Delete every auth user except the super admin.
--    (profiles rows cascade-delete via the FK on profiles.id -> auth.users.id.)
delete from auth.users
where email <> 'arbaazcode@gmail.com';

-- 3) Ensure arbaazcode@gmail.com is the sole super_admin with all permissions.
update public.profiles p
set role = 'super_admin',
    perm_orders = true,
    perm_inquiries = true,
    perm_reviews = true,
    perm_menu = true
from auth.users u
where u.id = p.id and u.email = 'arbaazcode@gmail.com';

commit;

-- Verify:
select u.email, p.role, p.perm_orders, p.perm_inquiries, p.perm_reviews, p.perm_menu
from public.profiles p
join auth.users u on u.id = p.id;
