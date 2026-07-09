-- Adds a customer-editable display name shown on each order (e.g. for pickup call-outs).
-- Run this once in the Supabase SQL Editor if your orders table was created before this column existed.

alter table public.orders add column if not exists order_name text;
