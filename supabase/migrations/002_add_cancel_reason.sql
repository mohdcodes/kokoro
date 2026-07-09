-- Adds an optional cancellation reason an admin can attach when cancelling an order.
-- The reason is shown to the customer on their order tracking page.
-- Run this once in the Supabase SQL Editor.

alter table public.orders add column if not exists cancel_reason text;
