-- Kokoro — sub-admin roles, per-area permissions, and activity audit log.
-- Run in Supabase SQL Editor after 001–003.

-- 1) Extend the role check to include 'super_admin'.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'admin', 'super_admin'));

-- 2) Per-area permissions for admins. Stored as booleans; super_admin implicitly has all.
alter table public.profiles add column if not exists perm_orders boolean not null default false;
alter table public.profiles add column if not exists perm_inquiries boolean not null default false;
alter table public.profiles add column if not exists perm_reviews boolean not null default false;
alter table public.profiles add column if not exists perm_menu boolean not null default false;

-- 3) Make the seed super admin (change email if needed) the super_admin with all perms.
update public.profiles p
set role = 'super_admin',
    perm_orders = true, perm_inquiries = true, perm_reviews = true, perm_menu = true
from auth.users u
where u.id = p.id and u.email = 'arbaazcode@gmail.com';

-- 4) Helper functions.
create or replace function public.is_super_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;

-- is_admin already exists (role = 'admin'); redefine to include super_admin.
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- Does the current user have a given area permission? super_admin always true.
create or replace function public.has_perm(area text)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'super_admin'
        or (p.role = 'admin' and (
          (area = 'orders' and p.perm_orders)
          or (area = 'inquiries' and p.perm_inquiries)
          or (area = 'reviews' and p.perm_reviews)
          or (area = 'menu' and p.perm_menu)
        ))
      )
  );
$$;

-- 5) Only super admins may change roles/permissions of profiles.
-- Add an UPDATE policy scoped to super admins for any profile (in addition to own-profile update).
drop policy if exists "profiles_superadmin_update" on public.profiles;
create policy "profiles_superadmin_update" on public.profiles
  for update using (public.is_super_admin());

-- Super admins can read all profiles (to list/manage admins). (Own+admin read already exists.)
drop policy if exists "profiles_superadmin_select" on public.profiles;
create policy "profiles_superadmin_select" on public.profiles
  for select using (public.is_super_admin() or id = auth.uid() or public.is_admin());

-- 6) Activity audit log.
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_name text,
  actor_email text,
  area text not null,          -- 'orders' | 'inquiries' | 'reviews' | 'menu' | 'admins'
  action text not null,        -- e.g. 'order.status.ready', 'review.approved', 'menu.item.updated', 'admin.created'
  target text,                 -- human-readable target (order name, item name, email, etc.)
  detail jsonb,                -- optional structured detail
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

-- Admins can insert their own log rows; super admins can read everything.
drop policy if exists "activity_log_insert_admin" on public.activity_log;
create policy "activity_log_insert_admin" on public.activity_log
  for insert with check (public.is_admin() and actor_id = auth.uid());

drop policy if exists "activity_log_select_superadmin" on public.activity_log;
create policy "activity_log_select_superadmin" on public.activity_log
  for select using (public.is_super_admin());

-- 7) Tighten area-specific writes to require the matching permission.
-- (Every create is preceded by a drop-if-exists so this whole file is safe to re-run.)
-- Orders: only admins WITH orders permission may update.
drop policy if exists "orders_update_own_or_admin" on public.orders;
drop policy if exists "orders_update_customer_own" on public.orders;
create policy "orders_update_customer_own" on public.orders
  for update using (user_id = auth.uid());
drop policy if exists "orders_update_admin_perm" on public.orders;
create policy "orders_update_admin_perm" on public.orders
  for update using (public.has_perm('orders'));

-- Reviews: only admins WITH reviews permission may update (approve/feature).
drop policy if exists "reviews_update_admin" on public.reviews;
drop policy if exists "reviews_update_admin_perm" on public.reviews;
create policy "reviews_update_admin_perm" on public.reviews
  for update using (public.has_perm('reviews'));

-- Menu writes require menu permission.
drop policy if exists "menu_items_admin_write" on public.menu_items;
drop policy if exists "menu_items_admin_update" on public.menu_items;
drop policy if exists "menu_items_admin_delete" on public.menu_items;
drop policy if exists "menu_items_write_perm" on public.menu_items;
drop policy if exists "menu_items_update_perm" on public.menu_items;
drop policy if exists "menu_items_delete_perm" on public.menu_items;
create policy "menu_items_write_perm" on public.menu_items
  for insert with check (public.has_perm('menu'));
create policy "menu_items_update_perm" on public.menu_items
  for update using (public.has_perm('menu'));
create policy "menu_items_delete_perm" on public.menu_items
  for delete using (public.has_perm('menu'));

drop policy if exists "menu_categories_admin_write" on public.menu_categories;
drop policy if exists "menu_categories_admin_update" on public.menu_categories;
drop policy if exists "menu_categories_admin_delete" on public.menu_categories;
drop policy if exists "menu_categories_write_perm" on public.menu_categories;
drop policy if exists "menu_categories_update_perm" on public.menu_categories;
drop policy if exists "menu_categories_delete_perm" on public.menu_categories;
create policy "menu_categories_write_perm" on public.menu_categories
  for insert with check (public.has_perm('menu'));
create policy "menu_categories_update_perm" on public.menu_categories
  for update using (public.has_perm('menu'));
create policy "menu_categories_delete_perm" on public.menu_categories
  for delete using (public.has_perm('menu'));

-- Inquiries: read requires inquiries permission.
drop policy if exists "contact_messages_select_admin" on public.contact_messages;
drop policy if exists "contact_messages_select_perm" on public.contact_messages;
create policy "contact_messages_select_perm" on public.contact_messages
  for select using (public.has_perm('inquiries'));
