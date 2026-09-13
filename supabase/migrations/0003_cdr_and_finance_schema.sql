-- Migration 0003: Multi-Source Intelligence (CDR, Financial Records & Team Visibility)

-- 1. Create Call Detail Records (CDR) Table
create table if not exists public.cdr_records (
  id uuid primary key default gen_random_uuid(),
  calling_number text not null,
  called_number text not null,
  call_timestamp timestamptz not null default timezone('utc', now()),
  duration_seconds integer not null default 0,
  call_type text not null default 'voice' check (call_type in ('voice', 'sms', 'voip')),
  cell_tower_id text default '',
  imei text default '',
  source_file text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_cdr_calling on public.cdr_records (calling_number);
create index if not exists idx_cdr_called on public.cdr_records (called_number);
create index if not exists idx_cdr_timestamp on public.cdr_records (call_timestamp desc);

alter table public.cdr_records enable row level security;
drop policy if exists cdr_read_all on public.cdr_records;
create policy cdr_read_all on public.cdr_records for select to authenticated using (true);
drop policy if exists cdr_insert_auth on public.cdr_records;
create policy cdr_insert_auth on public.cdr_records for insert to authenticated with check (true);

-- 2. Create Financial Transactions Table
create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  source_account text not null,
  destination_account text not null,
  amount numeric not null check (amount > 0),
  currency text not null default 'INR',
  transaction_timestamp timestamptz not null default timezone('utc', now()),
  bank_name text default '',
  transaction_type text not null default 'transfer' check (transaction_type in ('transfer', 'cash_deposit', 'cash_withdrawal', 'upi', 'wire')),
  source_file text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_fin_source on public.financial_transactions (source_account);
create index if not exists idx_fin_destination on public.financial_transactions (destination_account);
create index if not exists idx_fin_timestamp on public.financial_transactions (transaction_timestamp desc);

alter table public.financial_transactions enable row level security;
drop policy if exists fin_read_all on public.financial_transactions;
create policy fin_read_all on public.financial_transactions for select to authenticated using (true);
drop policy if exists fin_insert_auth on public.financial_transactions;
create policy fin_insert_auth on public.financial_transactions for insert to authenticated with check (true);

-- 3. Open Team Read Visibility for Entities & Relationships
-- Allows authenticated investigators within the unit to discover cross-case linkages
drop policy if exists entities_read_all on public.entities;
create policy entities_read_all on public.entities for select to authenticated using (true);

drop policy if exists relationships_read_all on public.relationships;
create policy relationships_read_all on public.relationships for select to authenticated using (true);

drop policy if exists fir_cases_read_all on public.fir_cases;
create policy fir_cases_read_all on public.fir_cases for select to authenticated using (true);
