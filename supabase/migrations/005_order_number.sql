-- Kokoro — short human-friendly order numbers, assigned when an order is acknowledged.
-- Run in Supabase SQL Editor after 004. Safe to re-run.

alter table public.orders add column if not exists order_number text;

-- Unique index so two orders never share a number (nulls allowed for not-yet-acknowledged orders).
create unique index if not exists orders_order_number_key
  on public.orders (order_number)
  where order_number is not null;
