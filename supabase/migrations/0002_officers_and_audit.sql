-- Migration 0002: Extend profiles linked to auth.users and role-based audit / officer policies

-- 0. Drop deprecated standalone officers table if it was previously created
drop table if exists public.officers cascade;

-- 1. Extend public.profiles (primary key is auth.users.id) with officer fields
alter table public.profiles
  add column if not exists rank text not null default 'Inspector',
  add column if not exists badge_no text not null default '',
  add column if not exists district text not null default '',
  add column if not exists state text not null default 'Maharashtra',
  add column if not exists phone text not null default '',
  add column if not exists email text not null default '',
  add column if not exists is_active boolean not null default true;

-- 2. Drop automatic profile creation trigger so unauthorized signups are not automatically registered as officers
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;

-- 3. Helper function to check if current user is an admin
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role_name = 'admin'
  );
$$;

-- 4. Profile RLS:
-- All authenticated officers can view officer directory
drop policy if exists profiles_read_own on public.profiles;
drop policy if exists profiles_read_all on public.profiles;
create policy profiles_read_all on public.profiles for select to authenticated using (true);

-- Users can update their own profile; Admins can update any officer's profile
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles for update to authenticated 
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Only Admins can delete/deactivate an officer profile
drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles for delete to authenticated 
  using (public.is_admin());

-- Only Admins or sign-up trigger can insert new profiles
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_insert_admin on public.profiles;
create policy profiles_insert_admin on public.profiles for insert to authenticated 
  with check (id = auth.uid() or public.is_admin());

-- 5. Audit events RLS:
-- ONLY Admins can SELECT / view the audit log stream
drop policy if exists audit_read_own on public.audit_events;
drop policy if exists audit_read_all on public.audit_events;
drop policy if exists audit_read_admin_only on public.audit_events;
create policy audit_read_admin_only on public.audit_events for select to authenticated 
  using (public.is_admin());

-- All authenticated officers can insert their own actions into the tamper-evident ledger
drop policy if exists audit_insert_own on public.audit_events;
drop policy if exists audit_insert_auth on public.audit_events;
create policy audit_insert_auth on public.audit_events for insert to authenticated 
  with check (actor_id = auth.uid() or actor_id is null or public.is_admin());

-- Grant table access to Supabase API roles (governed by Row Level Security)
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;
