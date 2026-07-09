-- Reviews / feedback system.
-- Customers can review their completed/cancelled orders; admins approve & feature them;
-- approved reviews are publicly readable (including by logged-out visitors).
-- Run this once in the Supabase SQL Editor.

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

alter table public.reviews enable row level security;

-- Customer can insert a review only for their own completed/cancelled order.
drop policy if exists "reviews_insert_own_finished_order" on public.reviews;
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

-- Customer can read their own reviews.
drop policy if exists "reviews_select_own" on public.reviews;
create policy "reviews_select_own" on public.reviews
  for select using (user_id = auth.uid());

-- Anyone (anon + authed) can read approved reviews for public display.
drop policy if exists "reviews_select_approved_public" on public.reviews;
create policy "reviews_select_approved_public" on public.reviews
  for select using (is_approved = true);

-- Admins can read all reviews.
drop policy if exists "reviews_select_admin" on public.reviews;
create policy "reviews_select_admin" on public.reviews
  for select using (public.is_admin());

-- Admins can update reviews (approve / feature / unfeature).
drop policy if exists "reviews_update_admin" on public.reviews;
create policy "reviews_update_admin" on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());

-- Realtime for live public + admin updates.
alter publication supabase_realtime add table public.reviews;
