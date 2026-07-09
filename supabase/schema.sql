-- Kokoro Cafe — Supabase schema
-- Run this whole file in the Supabase SQL editor, then run seed.sql.

-- ========== Extensions ==========
create extension if not exists "pgcrypto";

-- ========== Tables ==========

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin', 'super_admin')),
  perm_orders boolean not null default false,
  perm_inquiries boolean not null default false,
  perm_reviews boolean not null default false,
  perm_menu boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_name text,
  actor_email text,
  area text not null,
  action text not null,
  target text,
  detail jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2),
  price_hot numeric(10, 2),
  price_cold numeric(10, 2),
  image_url text,
  is_available boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_name text,
  order_number text,
  status text not null default 'pending'
    check (status in ('pending', 'acknowledged', 'preparing', 'ready', 'completed', 'cancelled')),
  total numeric(10, 2) not null default 0,
  notes text,
  cancel_reason text,
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  ready_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  item_name text not null,
  variant text,
  quantity int not null default 1,
  unit_price numeric(10, 2) not null
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid references public.profiles (id),
  reviewer_name text,
  rating int not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  constraint reviews_order_unique unique (order_id)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  inquiry_type text not null default 'general' check (
    inquiry_type in ('general', 'event', 'bulk_order', 'collab', 'party', 'function')
  ),
  message text not null,
  created_at timestamptz not null default now()
);

-- ========== Helpers: is_admin() / is_super_admin() / has_perm() ==========
-- is_admin() returns true for admins AND super_admins.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

-- Does the current user have a given area permission? super_admin always true.
create or replace function public.has_perm(area text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
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

-- ========== RLS ==========
alter table public.profiles enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.contact_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.activity_log enable row level security;

-- profiles: own/admin read + super_admin read all; own update + super_admin update any
create policy "profiles_superadmin_select" on public.profiles
  for select using (public.is_super_admin() or id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_superadmin_update" on public.profiles
  for update using (public.is_super_admin());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- menu_categories: public read, writes require menu permission
create policy "menu_categories_public_read" on public.menu_categories
  for select using (true);
create policy "menu_categories_write_perm" on public.menu_categories
  for insert with check (public.has_perm('menu'));
create policy "menu_categories_update_perm" on public.menu_categories
  for update using (public.has_perm('menu'));
create policy "menu_categories_delete_perm" on public.menu_categories
  for delete using (public.has_perm('menu'));

-- menu_items: public read, writes require menu permission
create policy "menu_items_public_read" on public.menu_items
  for select using (true);
create policy "menu_items_write_perm" on public.menu_items
  for insert with check (public.has_perm('menu'));
create policy "menu_items_update_perm" on public.menu_items
  for update using (public.has_perm('menu'));
create policy "menu_items_delete_perm" on public.menu_items
  for delete using (public.has_perm('menu'));

-- orders: customers see/insert own; admins see all; updates require orders permission
create policy "orders_select_own_or_admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "orders_insert_own" on public.orders
  for insert with check (user_id = auth.uid());
create policy "orders_update_customer_own" on public.orders
  for update using (user_id = auth.uid());
create policy "orders_update_admin_perm" on public.orders
  for update using (public.has_perm('orders'));

-- order_items: visible/insertable if the parent order is visible/owned
create policy "order_items_select_via_order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items_insert_via_order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- push_subscriptions: own rows only (admin server code uses service role and bypasses RLS)
create policy "push_subscriptions_own" on public.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- contact_messages: anyone can insert, only admin can read
create policy "contact_messages_insert_anyone" on public.contact_messages
  for insert with check (true);
create policy "contact_messages_select_perm" on public.contact_messages
  for select using (public.has_perm('inquiries'));

-- reviews: customer inserts for own finished order; own read; public read of approved; admin read/update
create policy "reviews_insert_own_finished_order" on public.reviews
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.id = reviews.order_id
        and o.user_id = auth.uid()
        and o.status in ('completed', 'cancelled')
    )
  );
create policy "reviews_select_own" on public.reviews
  for select using (user_id = auth.uid());
create policy "reviews_select_approved_public" on public.reviews
  for select using (is_approved = true);
create policy "reviews_select_admin" on public.reviews
  for select using (public.is_admin());
create policy "reviews_update_admin_perm" on public.reviews
  for update using (public.has_perm('reviews'));

-- activity_log: admins insert their own rows; only super admins can read
create policy "activity_log_insert_admin" on public.activity_log
  for insert with check (public.is_admin() and actor_id = auth.uid());
create policy "activity_log_select_superadmin" on public.activity_log
  for select using (public.is_super_admin());

-- ========== Trigger: auto-create profile on signup ==========
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========== Realtime ==========
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.reviews;
