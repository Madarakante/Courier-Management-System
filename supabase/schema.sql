-- Supabase schema for Courier System

-- USERS
create table if not exists public.users (
  id bigserial primary key,
  "name" text not null,
  email text not null unique,
  "password" text not null,
  role text not null default 'admin',
  active boolean not null default true,
  "lastLogin" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- SHIPMENTS
create table if not exists public.shipments (
  id bigserial primary key,
  "trackingNumber" text unique,
  -- Shipper
  "shipperName" text not null,
  "shipperPhone" text not null,
  "shipperAddress" text not null,
  "shipperEmail" text not null,
  -- Receiver
  "receiverName" text not null,
  "receiverPhone" text not null,
  "receiverAddress" text not null,
  "receiverEmail" text not null,
  -- Details
  "shipmentType" text not null,
  "totalWeight" numeric(10,2),
  courier text,
  "totalPackages" int default 1,
  mode text not null,
  product text,
  quantity int,
  "paymentMode" text not null,
  "totalFreight" numeric(10,2),
  carrier text,
  "carrierReferenceNo" text,
  "departureTime" timestamptz,
  origin text not null,
  destination text not null,
  "pickupDate" timestamptz,
  "pickupTime" time,
  "expectedDeliveryDate" timestamptz,
  comments text,
  status text not null default 'pending',
  "currentLocation" text,
  "currentLocationUpdatedAt" timestamptz,
  "createdBy" bigint not null references public.users(id) on delete restrict,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- SHIPMENT HISTORY
create table if not exists public.shipment_history (
  id bigserial primary key,
  "shipmentId" bigint not null references public.shipments(id) on delete cascade,
  status text not null,
  location text,
  notes text,
  "updatedBy" bigint references public.users(id) on delete set null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- PACKAGES
create table if not exists public.packages (
  id bigserial primary key,
  "shipmentId" bigint not null references public.shipments(id) on delete cascade,
  quantity int not null default 1,
  "pieceType" text,
  description text,
  length numeric(10,2) default 0,
  width numeric(10,2) default 0,
  height numeric(10,2) default 0,
  weight numeric(10,2) default 0,
  "volumetricWeight" numeric(10,2),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- updatedAt triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new."updatedAt" = now();
  return new;
end$$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_shipments') then
    create trigger set_updated_at_shipments
    before update on public.shipments
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_users') then
    create trigger set_updated_at_users
    before update on public.users
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_packages') then
    create trigger set_updated_at_packages
    before update on public.packages
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_history') then
    create trigger set_updated_at_history
    before update on public.shipment_history
    for each row execute function public.set_updated_at();
  end if;
end $$;


