create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc', now()); return new; end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '', unit_name text not null default '', role_name text not null default 'investigator',
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(), entity_type text not null check (entity_type in ('person','organization','vehicle','phone','bank_account','location','fir')),
  display_name text not null, aliases text[] not null default '{}', identifiers jsonb not null default '{}', risk_level text not null default 'low' check (risk_level in ('high','medium','low')),
  source_refs jsonb not null default '[]', created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(), source_entity_id uuid not null references public.entities(id) on delete cascade,
  target_entity_id uuid not null references public.entities(id) on delete cascade, relationship_type text not null, weight numeric not null default 1 check (weight >= 0),
  source_refs jsonb not null default '[]', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default timezone('utc', now()),
  unique (source_entity_id, target_entity_id, relationship_type)
);
create table if not exists public.fir_cases (
  id uuid primary key default gen_random_uuid(), fir_number text not null unique, police_station text not null, district text not null, incident_date date,
  sections text[] not null default '{}', incident_summary text not null default '', source_file_name text, source_file_sha256 text, source_file_path text,
  extraction_status text not null default 'manual' check (extraction_status in ('manual','queued','review','approved')),
  created_by uuid not null references auth.users(id) on delete restrict, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.fir_entities (
  fir_id uuid not null references public.fir_cases(id) on delete cascade, entity_id uuid not null references public.entities(id) on delete cascade, involvement text, primary key (fir_id, entity_id)
);
create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(), fir_id uuid not null references public.fir_cases(id) on delete cascade, evidence_type text not null, description text not null,
  storage_path text, sha256 text, created_by uuid not null references auth.users(id) on delete restrict, created_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id) on delete set null, action text not null, resource_type text not null, resource_id uuid,
  change_summary jsonb not null default '{}', previous_hash text, event_hash text not null, created_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.fir_access (
  fir_id uuid not null references public.fir_cases(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, can_write boolean not null default false, primary key (fir_id, user_id)
);
create table if not exists public.entity_access (
  entity_id uuid not null references public.entities(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, can_write boolean not null default false, primary key (entity_id, user_id)
);

create index if not exists entities_name_idx on public.entities using gin (to_tsvector('simple', display_name));
create index if not exists entities_type_risk_idx on public.entities (entity_type, risk_level);
create index if not exists relationships_source_idx on public.relationships (source_entity_id);
create index if not exists relationships_target_idx on public.relationships (target_entity_id);
create index if not exists fir_cases_station_date_idx on public.fir_cases (police_station, incident_date desc);
create index if not exists audit_events_resource_idx on public.audit_events (resource_type, resource_id, created_at desc);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists entities_updated_at on public.entities;
create trigger entities_updated_at before update on public.entities for each row execute procedure public.set_updated_at();
drop trigger if exists fir_cases_updated_at on public.fir_cases;
create trigger fir_cases_updated_at before update on public.fir_cases for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, unit_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name',''), coalesce(new.raw_user_meta_data->>'unit_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.entities enable row level security;
alter table public.relationships enable row level security;
alter table public.fir_cases enable row level security;
alter table public.fir_entities enable row level security;
alter table public.evidence_items enable row level security;
alter table public.audit_events enable row level security;
alter table public.fir_access enable row level security;
alter table public.entity_access enable row level security;

drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists entities_read_scoped on public.entities;
create policy entities_read_scoped on public.entities for select to authenticated using (created_by = auth.uid() or exists (select 1 from public.entity_access a where a.entity_id = id and a.user_id = auth.uid()));
drop policy if exists entities_write_own on public.entities;
create policy entities_write_own on public.entities for all to authenticated using (created_by = auth.uid() or exists (select 1 from public.entity_access a where a.entity_id = id and a.user_id = auth.uid() and a.can_write)) with check (created_by = auth.uid());
drop policy if exists relationships_read_scoped on public.relationships;
create policy relationships_read_scoped on public.relationships for select to authenticated using (created_by = auth.uid() or (exists (select 1 from public.entity_access a where a.entity_id = source_entity_id and a.user_id = auth.uid()) and exists (select 1 from public.entity_access a where a.entity_id = target_entity_id and a.user_id = auth.uid())));
drop policy if exists relationships_write_own on public.relationships;
create policy relationships_write_own on public.relationships for all to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
drop policy if exists fir_cases_read_scoped on public.fir_cases;
create policy fir_cases_read_scoped on public.fir_cases for select to authenticated using (created_by = auth.uid() or exists (select 1 from public.fir_access a where a.fir_id = id and a.user_id = auth.uid()));
drop policy if exists fir_cases_insert_own on public.fir_cases;
create policy fir_cases_insert_own on public.fir_cases for insert to authenticated with check (created_by = auth.uid());
drop policy if exists fir_cases_update_scoped on public.fir_cases;
create policy fir_cases_update_scoped on public.fir_cases for update to authenticated using (created_by = auth.uid() or exists (select 1 from public.fir_access a where a.fir_id = id and a.user_id = auth.uid() and a.can_write)) with check (created_by = auth.uid() or exists (select 1 from public.fir_access a where a.fir_id = id and a.user_id = auth.uid() and a.can_write));
drop policy if exists fir_entities_read_scoped on public.fir_entities;
create policy fir_entities_read_scoped on public.fir_entities for select to authenticated using (exists (select 1 from public.fir_cases f where f.id = fir_id));
drop policy if exists evidence_read_scoped on public.evidence_items;
create policy evidence_read_scoped on public.evidence_items for select to authenticated using (created_by = auth.uid() or exists (select 1 from public.fir_access a where a.fir_id = fir_id and a.user_id = auth.uid()));
drop policy if exists evidence_insert_own on public.evidence_items;
create policy evidence_insert_own on public.evidence_items for insert to authenticated with check (created_by = auth.uid());
drop policy if exists audit_read_own on public.audit_events;
create policy audit_read_own on public.audit_events for select to authenticated using (actor_id = auth.uid());
drop policy if exists audit_insert_own on public.audit_events;
create policy audit_insert_own on public.audit_events for insert to authenticated with check (actor_id = auth.uid());

-- Access grants are intentionally not client-writable. Issue them from a trusted server or Edge Function.
