-- ============================================================
-- Love Nails POS — Supabase Database Setup
-- Chạy toàn bộ file này trong SQL Editor của Supabase
-- ============================================================

-- 1. Employees
create table if not exists employees (
  id               uuid default gen_random_uuid() primary key,
  name             text not null,
  phone            text,
  role             text default 'Staff' check (role in ('Admin','Manager','Staff')),
  color            text default '#f472b6',
  commission_rate  numeric,
  active           boolean default true,
  created_at       timestamp with time zone default now()
);

-- 2. Customers
create table if not exists customers (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  phone       text,
  email       text,
  birthday    date,
  notes       text,
  allergies   text,
  created_at  timestamp with time zone default now()
);

-- 3. Tickets (Hóa đơn)
create table if not exists tickets (
  id            uuid default gen_random_uuid() primary key,
  number        serial unique,
  customer_name text,
  customer_id   uuid references customers(id) on delete set null,
  subtotal      numeric default 0,
  discount_amt  numeric default 0,
  tip_total     numeric default 0,
  total         numeric default 0,
  pay_method    text,
  status        text default 'Completed',
  created_at    timestamp with time zone default now()
);

-- 4. Ticket Items (Dịch vụ trong bill)
create table if not exists ticket_items (
  id            uuid default gen_random_uuid() primary key,
  ticket_id     uuid references tickets(id) on delete cascade,
  service_name  text,
  price         numeric,
  employee_id   uuid references employees(id) on delete set null,
  employee_name text
);

-- 5. Payments (Thanh toán)
create table if not exists payments (
  id         uuid default gen_random_uuid() primary key,
  ticket_id  uuid references tickets(id) on delete cascade,
  method     text,
  amount     numeric,
  created_at timestamp with time zone default now()
);

-- 6. Ticket Tips (Tip)
create table if not exists ticket_tips (
  id            uuid default gen_random_uuid() primary key,
  ticket_id     uuid references tickets(id) on delete cascade,
  employee_id   uuid references employees(id) on delete set null,
  employee_name text,
  amount        numeric
);

-- 7. Appointments (Lịch hẹn)
create table if not exists appointments (
  id            uuid default gen_random_uuid() primary key,
  time          text,
  customer_name text,
  service       text,
  employee_id   uuid references employees(id) on delete set null,
  status        text default 'Booked',
  notes         text,
  created_at    timestamp with time zone default now()
);

-- ============================================================
-- Enable Row Level Security (RLS) — tắt tạm để test nhanh
-- Sau khi có auth thì bật lại
-- ============================================================
alter table employees    enable row level security;
alter table customers    enable row level security;
alter table tickets      enable row level security;
alter table ticket_items enable row level security;
alter table payments     enable row level security;
alter table ticket_tips  enable row level security;
alter table appointments enable row level security;

-- Policy tạm: cho phép tất cả (anon key) đọc/ghi
-- Sau này khi có auth thì đổi policy này
create policy "allow all" on employees    for all using (true) with check (true);
create policy "allow all" on customers    for all using (true) with check (true);
create policy "allow all" on tickets      for all using (true) with check (true);
create policy "allow all" on ticket_items for all using (true) with check (true);
create policy "allow all" on payments     for all using (true) with check (true);
create policy "allow all" on ticket_tips  for all using (true) with check (true);
create policy "allow all" on appointments for all using (true) with check (true);

-- ============================================================
-- Seed data mẫu — xóa phần này nếu không cần
-- ============================================================
insert into employees (name, phone, role, color, commission_rate, active) values
  ('Jenny', '714-555-0001', 'Staff',   '#f472b6', 60, true),
  ('Lisa',  '714-555-0002', 'Staff',   '#60a5fa', 60, true),
  ('Tina',  '714-555-0003', 'Manager', '#a78bfa', 65, true),
  ('Anna',  '714-555-0004', 'Staff',   '#34d399', 60, true)
on conflict do nothing;

insert into customers (name, phone, notes, allergies) values
  ('Sarah Johnson', '714-555-0101', 'Likes nude colors, short square Gel X', ''),
  ('Emily Chen',    '714-555-0202', 'Gel X only, comes every 3 weeks',       'Allergic to acrylic powder'),
  ('Maria Garcia',  '714-555-0303', 'Regular pedicure + manicure monthly',   '')
on conflict do nothing;
