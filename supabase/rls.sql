-- Basic RLS setup (optional; adjust for your needs)

-- Disable RLS during initial setup
alter table if exists public.users disable row level security;
alter table if exists public.shipments disable row level security;
alter table if exists public.shipment_history disable row level security;
alter table if exists public.packages disable row level security;

-- Enable RLS
alter table if exists public.users enable row level security;
alter table if exists public.shipments enable row level security;
alter table if exists public.shipment_history enable row level security;
alter table if exists public.packages enable row level security;

-- Allow service role and authenticated admin-like access (idempotent creation)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'allow all for authenticated'
  ) then
    create policy "allow all for authenticated" on public.users
      for all to authenticated using (true) with check (true);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'shipments' and policyname = 'allow all for authenticated'
  ) then
    create policy "allow all for authenticated" on public.shipments
      for all to authenticated using (true) with check (true);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'shipment_history' and policyname = 'allow all for authenticated'
  ) then
    create policy "allow all for authenticated" on public.shipment_history
      for all to authenticated using (true) with check (true);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'packages' and policyname = 'allow all for authenticated'
  ) then
    create policy "allow all for authenticated" on public.packages
      for all to authenticated using (true) with check (true);
  end if;
end$$;

-- WARNING: These policies are permissive. Tighten them later for production.


