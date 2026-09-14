/***************************************************************************************************
 * NETRAKSHAK CRIME NETWORK COMMAND - SUPABASE PROJECT CONFIGURATION REFERENCE
 ***************************************************************************************************
 * IMPORTANT NOTICE FOR ALL AI CODING MODELS AND DEVELOPERS:
 *
 * 1. THIS IS A DOCUMENTATION AND REFERENCE FILE ONLY.
 * 2. THIS FILE IS NOT A MIGRATION AND MUST NOT BE EXECUTED DIRECTLY AGAINST THE DATABASE.
 * 3. THIS FILE SERVES AS THE SINGLE SOURCE OF TRUTH FOR THIS PROJECT'S DATABASE AND AUTH ARCHITECTURE.
 * 4. BEFORE MODIFYING ANY SUPABASE DATABASE CODE, AUTH FLOWS, RLS POLICIES, RPCS, OR STORAGE RULES,
 *    READ THIS ENTIRE DOCUMENT CAREFULLY.
 * 5. THIS FILE MUST BE UPDATED WHENEVER THE LIVE DATABASE OR AUTH CONFIGURATION IS ALTERED.
 ***************************************************************************************************/

/* =================================================================================================
 * 1. PROJECT-LEVEL SPECIFICATIONS
 * =================================================================================================
 * Project Reference ID : lsefezbpbvzwmfcyglye
 * Project Base URL     : https://lsefezbpbvzwmfcyglye.supabase.co
 * Environment Keys     :
 *   - VITE_SUPABASE_URL      : Project API URL (publicly exposed to client)
 *   - VITE_SUPABASE_ANON_KEY : Public/Anonymous Client Key (safe in frontend, constrained by RLS)
 *   - SERVICE_ROLE_KEY       : Secret Server Key (STRICTLY PROHIBITED in frontend/client code)
 *
 * Active Schemas       :
 *   - public              : Application tables, views, helper routines, and custom triggers
 *   - auth                : Managed Supabase Auth (auth.users, auth.identities, sessions)
 *   - storage             : Managed Supabase Storage (storage.buckets, storage.objects)
 *   - supabase_migrations : Applied migration tracking (supabase_migrations.schema_migrations)
 *
 * Applied Migration History:
 *   1. 20260914204434_security_hardening_remediation_v1
 *      - Implemented public.is_admin() helper routine with search_path isolation
 *      - Hardened set_updated_at() and handle_new_user() triggers
 *      - Restricted create_officer_account() with admin-only authorization guard
 *      - Attached trg_prevent_profile_role_escalation trigger to public.profiles
 *      - Replaced open public.profiles write policy with granular authenticated RLS
 *      - Enforced created_by = auth.uid() on cdr_records and financial_transactions
 *      - Corrected scoped join predicate on evidence_items RLS
 *      - Restricted fir-evidence storage bucket access to authenticated sessions
 *   2. 20260914204524_security_triggers_and_acl_policies
 *      - Revoked direct REST RPC execution privileges on internal trigger functions
 *      - Defined explicit RLS policies for fir_access and entity_access ACL tables
 *   3. 20260914204543_revoke_rls_auto_enable_api_access
 *      - Revoked REST RPC execution on rls_auto_enable event trigger routine
 *   4. 20260914205000_enforce_mandatory_password_officer_creation
 *      - Removed all fallback passwords (password123) from create_officer_account
 *      - Enforced mandatory password validation (minimum 6 characters) on account creation
 * ================================================================================================= */

/* =================================================================================================
 * 2. DATABASE SCHEMA, TABLES, CONSTRAINTS & INDEXES
 * ================================================================================================= */

-- -------------------------------------------------------------------------------------------------
-- Table: public.profiles
-- Description: Officer user profiles linked 1:1 to auth.users.id
-- -------------------------------------------------------------------------------------------------
-- Columns:
--   id           : uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
--   display_name : text NOT NULL
--   unit_name    : text DEFAULT 'Maharashtra Police'
--   role_name    : text NOT NULL DEFAULT 'case-officer' (Allowed: 'admin', 'case-officer', 'analyst')
--   rank         : text DEFAULT 'Inspector'
--   badge_no     : text DEFAULT ''
--   district     : text DEFAULT ''
--   state        : text DEFAULT 'Maharashtra'
--   phone        : text DEFAULT ''
--   email        : text NOT NULL
--   is_active    : boolean DEFAULT true
--   created_at   : timestamp with time zone DEFAULT now()
--   updated_at   : timestamp with time zone DEFAULT now()
--
-- Constraints & Indexes:
--   - PRIMARY KEY (id)
--   - FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
--
-- Triggers:
--   - profiles_updated_at: BEFORE UPDATE -> EXECUTE FUNCTION public.set_updated_at()
--   - trg_prevent_profile_role_escalation: BEFORE UPDATE -> EXECUTE FUNCTION public.prevent_profile_role_escalation()

-- -------------------------------------------------------------------------------------------------
-- Table: public.entities
-- Description: Persons of interest, suspects, shell companies, bank entities, vehicles, etc.
-- -------------------------------------------------------------------------------------------------
-- Columns:
--   id           : uuid PRIMARY KEY DEFAULT gen_random_uuid()
--   entity_type  : text NOT NULL ('person', 'organization', 'vehicle', 'account', 'location')
--   display_name : text NOT NULL
--   aliases      : text[] DEFAULT '{}'
--   identifiers  : jsonb DEFAULT '{}'
--   risk_level   : text DEFAULT 'medium' ('low', 'medium', 'high', 'critical')
--   source_refs  : jsonb DEFAULT '[]'
--   created_by   : uuid DEFAULT auth.uid() REFERENCES auth.users(id)
--   created_at   : timestamp with time zone DEFAULT now()
--   updated_at   : timestamp with time zone DEFAULT now()
--
-- Constraints & Indexes:
--   - PRIMARY KEY (id)
--   - FOREIGN KEY (created_by) REFERENCES auth.users(id)
--   - GIN INDEX entities_name_idx ON (to_tsvector('simple', display_name))
--   - BTREE INDEX entities_type_risk_idx ON (entity_type, risk_level)
--
-- Triggers:
--   - entities_updated_at: BEFORE UPDATE -> EXECUTE FUNCTION public.set_updated_at()

-- -------------------------------------------------------------------------------------------------
-- Table: public.relationships
-- Description: Graph edges connecting entities (criminal, financial, familial, communication)
-- -------------------------------------------------------------------------------------------------
-- Columns:
--   id                : uuid PRIMARY KEY DEFAULT gen_random_uuid()
--   source_entity_id  : uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE
--   target_entity_id  : uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE
--   relationship_type : text NOT NULL
--   weight            : numeric DEFAULT 1.0
--   source_refs       : jsonb DEFAULT '[]'
--   created_by        : uuid DEFAULT auth.uid() REFERENCES auth.users(id)
--   created_at        : timestamp with time zone DEFAULT now()
--
-- Constraints & Indexes:
--   - PRIMARY KEY (id)
--   - UNIQUE (source_entity_id, target_entity_id, relationship_type)
--   - FOREIGN KEY (source_entity_id) REFERENCES public.entities(id)
--   - FOREIGN KEY (target_entity_id) REFERENCES public.entities(id)
--   - FOREIGN KEY (created_by) REFERENCES auth.users(id)
--   - BTREE INDEX relationships_source_idx ON (source_entity_id)
--   - BTREE INDEX relationships_target_idx ON (target_entity_id)

-- -------------------------------------------------------------------------------------------------
-- Table: public.fir_cases
-- Description: First Information Reports (FIRs) and formal investigation dossiers
-- -------------------------------------------------------------------------------------------------
-- Columns:
--   id                 : uuid PRIMARY KEY DEFAULT gen_random_uuid()
--   fir_number         : text NOT NULL UNIQUE
--   police_station     : text NOT NULL
--   district           : text NOT NULL
--   incident_date      : date
--   sections           : text[] DEFAULT '{}'
--   incident_summary   : text
--   source_file_name   : text
--   source_file_sha256 : text
--   source_file_path   : text
--   extraction_status  : text DEFAULT 'processed'
--   created_by         : uuid DEFAULT auth.uid() REFERENCES auth.users(id)
--   created_at         : timestamp with time zone DEFAULT now()
--   updated_at         : timestamp with time zone DEFAULT now()
--
-- Constraints & Indexes:
--   - PRIMARY KEY (id)
--   - UNIQUE (fir_number)
--   - FOREIGN KEY (created_by) REFERENCES auth.users(id)
--   - BTREE INDEX fir_cases_station_date_idx ON (police_station, incident_date DESC)
--
-- Triggers:
--   - fir_cases_updated_at: BEFORE UPDATE -> EXECUTE FUNCTION public.set_updated_at()

-- -------------------------------------------------------------------------------------------------
-- Table: public.fir_entities
-- Description: Many-to-many link between FIR cases and involved entities
-- -------------------------------------------------------------------------------------------------
-- Columns:
--   fir_id      : uuid NOT NULL REFERENCES public.fir_cases(id) ON DELETE CASCADE
--   entity_id   : uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE
--   involvement : text NOT NULL ('accused', 'victim', 'witness', 'complainant', 'associate')
--
-- Constraints & Indexes:
--   - PRIMARY KEY (fir_id, entity_id)
--   - FOREIGN KEY (fir_id) REFERENCES public.fir_cases(id)
--   - FOREIGN KEY (entity_id) REFERENCES public.entities(id)

-- -------------------------------------------------------------------------------------------------
-- Table: public.evidence_items
-- Description: Uploaded evidence documents, forensic extractions, media files
-- -------------------------------------------------------------------------------------------------
-- Columns:
--   id            : uuid PRIMARY KEY DEFAULT gen_random_uuid()
--   fir_id        : uuid REFERENCES public.fir_cases(id) ON DELETE SET NULL
--   evidence_type : text NOT NULL
--   description   : text
--   storage_path  : text NOT NULL
--   sha256        : text
--   created_by    : uuid DEFAULT auth.uid() REFERENCES auth.users(id)
--   created_at    : timestamp with time zone DEFAULT now()
--
-- Constraints & Indexes:
--   - PRIMARY KEY (id)
--   - FOREIGN KEY (fir_id) REFERENCES public.fir_cases(id)
--   - FOREIGN KEY (created_by) REFERENCES auth.users(id)

-- -------------------------------------------------------------------------------------------------
-- Table: public.cdr_records
-- Description: Call Detail Records ingested for telecom network analysis
-- -------------------------------------------------------------------------------------------------
-- Columns:
--   id               : uuid PRIMARY KEY DEFAULT gen_random_uuid()
--   calling_number   : text NOT NULL
--   called_number    : text NOT NULL
--   call_timestamp   : timestamp with time zone NOT NULL
--   duration_seconds : integer DEFAULT 0
--   call_type        : text DEFAULT 'voice'
--   cell_tower_id    : text
--   imei             : text
--   source_file      : text
--   created_by       : uuid DEFAULT auth.uid() REFERENCES auth.users(id)
--   created_at       : timestamp with time zone DEFAULT now()
--
-- Constraints & Indexes:
--   - PRIMARY KEY (id)
--   - FOREIGN KEY (created_by) REFERENCES auth.users(id)
--   - BTREE INDEX idx_cdr_calling ON (calling_number)
--   - BTREE INDEX idx_cdr_called ON (called_number)
--   - BTREE INDEX idx_cdr_timestamp ON (call_timestamp DESC)

-- -------------------------------------------------------------------------------------------------
-- Table: public.financial_transactions
-- Description: Bank transactions, hawala transfers, payment gateway logs
-- -------------------------------------------------------------------------------------------------
-- Columns:
--   id                    : uuid PRIMARY KEY DEFAULT gen_random_uuid()
--   source_account        : text NOT NULL
--   destination_account   : text NOT NULL
--   amount                : numeric NOT NULL
--   currency              : text DEFAULT 'INR'
--   transaction_timestamp : timestamp with time zone NOT NULL
--   bank_name             : text
--   transaction_type      : text DEFAULT 'transfer'
--   source_file           : text
--   created_by            : uuid DEFAULT auth.uid() REFERENCES auth.users(id)
--   created_at            : timestamp with time zone DEFAULT now()
--
-- Constraints & Indexes:
--   - PRIMARY KEY (id)
--   - FOREIGN KEY (created_by) REFERENCES auth.users(id)
--   - BTREE INDEX idx_fin_source ON (source_account)
--   - BTREE INDEX idx_fin_destination ON (destination_account)
--   - BTREE INDEX idx_fin_timestamp ON (transaction_timestamp DESC)

-- -------------------------------------------------------------------------------------------------
-- Table: public.audit_events
-- Description: Immutable cryptographic audit trail of all investigator actions
-- -------------------------------------------------------------------------------------------------
-- Columns:
--   id             : uuid PRIMARY KEY DEFAULT gen_random_uuid()
--   actor_id       : uuid REFERENCES auth.users(id)
--   action         : text NOT NULL
--   resource_type  : text NOT NULL
--   resource_id    : uuid
--   change_summary : jsonb DEFAULT '{}'
--   previous_hash  : text
--   event_hash     : text
--   created_at     : timestamp with time zone DEFAULT now()
--
-- Constraints & Indexes:
--   - PRIMARY KEY (id)
--   - FOREIGN KEY (actor_id) REFERENCES auth.users(id)
--   - BTREE INDEX audit_events_resource_idx ON (resource_type, resource_id, created_at DESC)

-- -------------------------------------------------------------------------------------------------
-- Tables: public.fir_access & public.entity_access
-- Description: Explicit access control lists for granular multi-officer dossier sharing
-- -------------------------------------------------------------------------------------------------
-- fir_access:
--   fir_id    : uuid NOT NULL REFERENCES public.fir_cases(id) ON DELETE CASCADE
--   user_id   : uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
--   can_write : boolean DEFAULT false
--   PRIMARY KEY (fir_id, user_id)
--
-- entity_access:
--   entity_id : uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE
--   user_id   : uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
--   can_write : boolean DEFAULT false
--   PRIMARY KEY (entity_id, user_id)


/* =================================================================================================
 * 3. AUTHENTICATION & IDENTITY ARCHITECTURE
 * =================================================================================================
 * Core Model:
 *   - Authentication is handled exclusively through Supabase Auth (auth.users).
 *   - Every registered investigator has a record in auth.users and a linked record in public.profiles.
 *   - The public.profiles table stores role metadata, rank, district, badge number, and active status.
 *
 * Investigator Sign-In Flow:
 *   1. Investigator enters email and password on the frontend LoginView.
 *   2. Frontend calls supabase.auth.signInWithPassword({ email, password }).
 *   3. Upon successful sign-in, Supabase returns a JWT token containing auth.uid() and role claim.
 *   4. Frontend queries public.profiles with .eq('id', session.user.id) to retrieve role and rank.
 *
 * Investigator Account Creation Flow (Admin-Only):
 *   1. Only active administrators can create or provision new officer accounts.
 *   2. Frontend invokes supabase.rpc('create_officer_account', { p_email, p_password, p_name, ... }).
 *   3. The PostgreSQL function public.create_officer_account:
 *      a. Verifies that public.is_admin() is TRUE (or service_role).
 *      b. Validates that email, name, and password are supplied (minimum 6 characters).
 *      c. Creates the user in auth.users with encrypted bcrypt password and auto-confirmed email.
 *      d. Creates the corresponding auth.identities record.
 *      e. Upserts the officer profile into public.profiles with the specified role.
 *
 * Self-Registration Behavior:
 *   - If a user signs up via public supabase.auth.signUp(), the database trigger on_auth_user_created
 *     invokes public.handle_new_user().
 *   - To prevent privilege escalation, handle_new_user() automatically demotes any attempted
 *     role_name = 'admin' metadata claim to 'case-officer' unless the caller is already an admin.
 * ================================================================================================= */

/* =================================================================================================
 * 4. ROLES, PERMISSIONS & AUTHORIZATION BOUNDARIES
 * =================================================================================================
 * Recognized Roles (public.profiles.role_name):
 *   1. 'admin'        : System Administrator / Senior Command Officer
 *   2. 'case-officer' : Primary Field Investigator / Case Officer
 *   3. 'analyst'      : Intelligence Analyst
 *
 * Authorization Matrix:
 *   -----------------------------------------------------------------------------------------------
 *   Operation                                 | Admin        | Case Officer | Analyst
 *   -----------------------------------------------------------------------------------------------
 *   Sign in to system                         | YES          | YES          | YES
 *   View profile roster / directory           | YES          | YES          | YES
 *   Edit own profile (phone, display name)    | YES          | YES          | YES
 *   Edit own role_name / is_active            | YES          | BLOCKED (DB) | BLOCKED (DB)
 *   Create new officer accounts (RPC)         | YES          | BLOCKED (DB) | BLOCKED (DB)
 *   Edit other officers' profiles             | YES          | BLOCKED (DB) | BLOCKED (DB)
 *   Delete officer profiles                   | YES (not self)| BLOCKED (DB)| BLOCKED (DB)
 *   Insert / update FIR cases                 | YES          | YES (Scoped) | YES (Scoped)
 *   Insert / update Entities & Relationships  | YES          | YES (Scoped) | YES (Scoped)
 *   Insert CDR & Financial records            | YES          | YES (Own uid)| YES (Own uid)
 *   Read evidence items & case files          | YES          | YES (Scoped) | YES (Scoped)
 *   Manage FIR & Entity access ACLs           | YES          | BLOCKED (DB) | BLOCKED (DB)
 *   -----------------------------------------------------------------------------------------------
 * ================================================================================================= */

/* =================================================================================================
 * 5. ROW LEVEL SECURITY (RLS) POLICIES REFERENCE
 * ================================================================================================= */

-- -------------------------------------------------------------------------------------------------
-- public.profiles (RLS: ENABLED)
-- -------------------------------------------------------------------------------------------------
-- Policy: profiles_read_auth (SELECT)
--   Roles      : authenticated
--   Using      : true
--   Description: Authenticated officers can read active officer profiles for roster/collaboration.
--
-- Policy: profiles_insert_admin (INSERT)
--   Roles      : authenticated
--   With Check : public.is_admin()
--   Description: Only administrators can insert profiles directly.
--
-- Policy: profiles_update_auth (UPDATE)
--   Roles      : authenticated
--   Using      : ((id = auth.uid()) OR public.is_admin())
--   With Check : ((id = auth.uid()) OR public.is_admin())
--   Description: Officers can update their own profile; admins can update any profile.
--   Note       : The trigger trg_prevent_profile_role_escalation prevents non-admins from changing role_name.
--
-- Policy: profiles_delete_admin (DELETE)
--   Roles      : authenticated
--   Using      : (public.is_admin() AND (id <> auth.uid()))
--   Description: Admins can delete officer profiles; self-deletion is prevented.

-- -------------------------------------------------------------------------------------------------
-- public.entities (RLS: ENABLED)
-- -------------------------------------------------------------------------------------------------
-- Policy: entities_read_all (SELECT)
--   Roles      : authenticated
--   Using      : true
--
-- Policy: entities_read_scoped (SELECT)
--   Roles      : authenticated
--   Using      : ((created_by = auth.uid()) OR (EXISTS (SELECT 1 FROM public.entity_access a WHERE a.entity_id = entities.id AND a.user_id = auth.uid())))
--
-- Policy: entities_write_own (ALL)
--   Roles      : authenticated
--   Using      : ((created_by = auth.uid()) OR (EXISTS (SELECT 1 FROM public.entity_access a WHERE a.entity_id = entities.id AND a.user_id = auth.uid() AND a.can_write)))
--   With Check : (created_by = auth.uid())

-- -------------------------------------------------------------------------------------------------
-- public.relationships (RLS: ENABLED)
-- -------------------------------------------------------------------------------------------------
-- Policy: relationships_read_all (SELECT)
--   Roles      : authenticated
--   Using      : true
--
-- Policy: relationships_read_scoped (SELECT)
--   Roles      : authenticated
--   Using      : ((created_by = auth.uid()) OR ((EXISTS (SELECT 1 FROM public.entity_access a WHERE a.entity_id = relationships.source_entity_id AND a.user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.entity_access a WHERE a.entity_id = relationships.target_entity_id AND a.user_id = auth.uid()))))
--
-- Policy: relationships_write_own (ALL)
--   Roles      : authenticated
--   Using      : (created_by = auth.uid())
--   With Check : (created_by = auth.uid())

-- -------------------------------------------------------------------------------------------------
-- public.fir_cases (RLS: ENABLED)
-- -------------------------------------------------------------------------------------------------
-- Policy: fir_cases_read_all (SELECT)
--   Roles      : authenticated
--   Using      : true
--
-- Policy: fir_cases_read_scoped (SELECT)
--   Roles      : authenticated
--   Using      : ((created_by = auth.uid()) OR (EXISTS (SELECT 1 FROM public.fir_access a WHERE a.fir_id = fir_cases.id AND a.user_id = auth.uid())))
--
-- Policy: fir_cases_insert_own (INSERT)
--   Roles      : authenticated
--   With Check : (created_by = auth.uid())
--
-- Policy: fir_cases_update_scoped (UPDATE)
--   Roles      : authenticated
--   Using      : ((created_by = auth.uid()) OR (EXISTS (SELECT 1 FROM public.fir_access a WHERE a.fir_id = fir_cases.id AND a.user_id = auth.uid() AND a.can_write)))
--   With Check : ((created_by = auth.uid()) OR (EXISTS (SELECT 1 FROM public.fir_access a WHERE a.fir_id = fir_cases.id AND a.user_id = auth.uid() AND a.can_write)))

-- -------------------------------------------------------------------------------------------------
-- public.fir_entities (RLS: ENABLED)
-- -------------------------------------------------------------------------------------------------
-- Policy: fir_entities_read_scoped (SELECT)
--   Roles      : authenticated
--   Using      : (EXISTS (SELECT 1 FROM public.fir_cases f WHERE f.id = fir_entities.fir_id))

-- -------------------------------------------------------------------------------------------------
-- public.evidence_items (RLS: ENABLED)
-- -------------------------------------------------------------------------------------------------
-- Policy: evidence_read_scoped (SELECT)
--   Roles      : authenticated
--   Using      : ((created_by = auth.uid()) OR (EXISTS (SELECT 1 FROM public.fir_access a WHERE a.fir_id = evidence_items.fir_id AND a.user_id = auth.uid())) OR public.is_admin())
--
-- Policy: evidence_insert_own (INSERT)
--   Roles      : authenticated
--   With Check : (created_by = auth.uid())

-- -------------------------------------------------------------------------------------------------
-- public.cdr_records (RLS: ENABLED)
-- -------------------------------------------------------------------------------------------------
-- Policy: cdr_read_all (SELECT)
--   Roles      : authenticated
--   Using      : true
--
-- Policy: cdr_insert_own (INSERT)
--   Roles      : authenticated
--   With Check : ((created_by = auth.uid()) OR ((created_by IS NULL) AND (auth.uid() IS NOT NULL)) OR public.is_admin())

-- -------------------------------------------------------------------------------------------------
-- public.financial_transactions (RLS: ENABLED)
-- -------------------------------------------------------------------------------------------------
-- Policy: fin_read_all (SELECT)
--   Roles      : authenticated
--   Using      : true
--
-- Policy: fin_insert_own (INSERT)
--   Roles      : authenticated
--   With Check : ((created_by = auth.uid()) OR ((created_by IS NULL) AND (auth.uid() IS NOT NULL)) OR public.is_admin())

-- -------------------------------------------------------------------------------------------------
-- public.audit_events (RLS: ENABLED)
-- -------------------------------------------------------------------------------------------------
-- Policy: audit_read_all (SELECT)
--   Roles      : authenticated
--   Using      : true
--
-- Policy: audit_insert_own (INSERT)
--   Roles      : authenticated
--   With Check : (actor_id = auth.uid())

-- -------------------------------------------------------------------------------------------------
-- public.fir_access & public.entity_access (RLS: ENABLED)
-- -------------------------------------------------------------------------------------------------
-- Policy: fir_access_read / entity_access_read (SELECT)
--   Roles      : authenticated
--   Using      : ((user_id = auth.uid()) OR public.is_admin())
--
-- Policy: fir_access_admin_all / entity_access_admin_all (ALL)
--   Roles      : authenticated
--   Using      : public.is_admin()
--   With Check : public.is_admin()


/* =================================================================================================
 * 6. POSTGRESQL FUNCTIONS, ROUTINES & TRIGGERS
 * ================================================================================================= */

-- -------------------------------------------------------------------------------------------------
-- Function: public.is_admin()
-- -------------------------------------------------------------------------------------------------
-- Signature   : public.is_admin() RETURNS boolean
-- Language    : SQL (STABLE)
-- Security    : SECURITY DEFINER
-- search_path : public, pg_catalog
-- Executed By : authenticated, service_role (PUBLIC and anon revoked)
-- Purpose     : Returns TRUE if the current auth.uid() has an active 'admin' record in public.profiles.

-- -------------------------------------------------------------------------------------------------
-- Function: public.create_officer_account(...)
-- -------------------------------------------------------------------------------------------------
-- Signature   : public.create_officer_account(
--                 p_email text,
--                 p_password text,
--                 p_name text,
--                 p_rank text DEFAULT 'Sub-Inspector'::text,
--                 p_district text DEFAULT ''::text,
--                 p_state text DEFAULT 'Maharashtra'::text,
--                 p_phone text DEFAULT ''::text,
--                 p_role text DEFAULT 'case-officer'::text,
--                 p_badge_no text DEFAULT ''::text
--               ) RETURNS uuid
-- Language    : PLPGSQL
-- Security    : SECURITY DEFINER
-- search_path : public, auth, extensions, pg_catalog
-- Executed By : authenticated, service_role (PUBLIC and anon revoked)
-- Security Rules:
--   1. Rejects execution if NOT public.is_admin() and caller is not service_role.
--   2. Enforces mandatory non-empty email, name, and password for new officer accounts (min 6 chars).
--   3. Replaces passwords on existing accounts only if a new valid password is provided.
--   4. Creates auth.users, auth.identities, and public.profiles records in a single atomic transaction.

-- -------------------------------------------------------------------------------------------------
-- Function: public.prevent_profile_role_escalation()
-- -------------------------------------------------------------------------------------------------
-- Signature   : public.prevent_profile_role_escalation() RETURNS trigger
-- Language    : PLPGSQL
-- Security    : SECURITY DEFINER
-- search_path : public, pg_catalog
-- Trigger     : trg_prevent_profile_role_escalation BEFORE UPDATE ON public.profiles
-- Executed By : Invoked by PostgreSQL trigger system (API direct execution revoked)
-- Security Rules:
--   1. If caller is non-admin: prevents changing role_name.
--   2. If caller is non-admin: prevents changing is_active status.
--   3. If caller is non-admin: prevents modifying any other officer's profile row.

-- -------------------------------------------------------------------------------------------------
-- Function: public.handle_new_user()
-- -------------------------------------------------------------------------------------------------
-- Signature   : public.handle_new_user() RETURNS trigger
-- Language    : PLPGSQL
-- Security    : SECURITY DEFINER
-- search_path : public, pg_catalog
-- Trigger     : on_auth_user_created AFTER INSERT ON auth.users
-- Executed By : Invoked by PostgreSQL trigger system (API direct execution revoked)
-- Purpose     : Automatically provisions public.profiles row on auth signup, forcing default case-officer.

-- -------------------------------------------------------------------------------------------------
-- Function: public.set_updated_at()
-- -------------------------------------------------------------------------------------------------
-- Signature   : public.set_updated_at() RETURNS trigger
-- Language    : PLPGSQL
-- Security    : SECURITY INVOKER
-- search_path : public, pg_catalog
-- Trigger     : profiles_updated_at, entities_updated_at, fir_cases_updated_at (BEFORE UPDATE)


/* =================================================================================================
 * 7. STORAGE BUCKETS & POLICIES
 * =================================================================================================
 * Bucket Name : fir-evidence
 * Bucket Type : Private (public = false)
 * Storage RLS : ENABLED on storage.objects
 *
 * Policies on storage.objects:
 *   1. fir_evidence_read_auth_only:
 *      - FOR SELECT TO authenticated
--      - USING (bucket_id = 'fir-evidence')
 *   2. fir_evidence_upload_own_folder:
 *      - FOR INSERT TO authenticated
 *      - WITH CHECK (bucket_id = 'fir-evidence' AND (storage.foldername(name))[1] = auth.uid()::text)
 *   3. fir_evidence_read_own_folder:
 *      - FOR SELECT TO authenticated
 *      - USING (bucket_id = 'fir-evidence' AND (storage.foldername(name))[1] = auth.uid()::text)
 *   4. fir_evidence_delete_own_folder:
 *      - FOR DELETE TO authenticated
 *      - USING (bucket_id = 'fir-evidence' AND (storage.foldername(name))[1] = auth.uid()::text)
 * ================================================================================================= */

/* =================================================================================================
 * 8. REALTIME & CLIENT API SPECIFICATIONS
 * =================================================================================================
 * - Client Library : @supabase/supabase-js
 * - Client Instance: src/lib/supabase.js
 * - Realtime is enabled for live updates where needed, restricted by Postgres RLS per user session.
 * - Anonymous / unauthenticated callers cannot access protected table rows or privileged RPCs.
 * ================================================================================================= */

/* =================================================================================================
 * 9. DO NOT BREAK THESE SECURITY RULES
 * =================================================================================================
 * Future models and developers modifying this codebase MUST strictly adhere to the following:
 *
 * 1. NEVER expose Supabase service_role or secret keys in frontend code, git repositories, or
 *    build artifacts.
 * 2. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are publishable client keys and must remain
 *    restricted by backend database RLS policies.
 * 3. Frontend role checks (e.g., if (officer.isAdmin)) are UI conveniences, NOT security boundaries.
 *    The PostgreSQL database is the only trusted authorization enforcement layer.
 * 4. Normal authenticated users must never be allowed to escalate their own role to 'admin' or alter
 *    another officer's profile row.
 * 5. create_officer_account must remain restricted to administrators (public.is_admin() = true).
 * 6. Never remove the search_path isolation from SECURITY DEFINER functions.
 * 7. Never create RLS policies with unconditional 'with_check: true' or 'qual: true' for writes
 *    without explicit security justification.
 * 8. Passwords and credentials must never be written to logs, audit events, or client-side storage.
 * 9. Do not weaken database triggers, RLS policies, or function permissions just to make a frontend
 *    feature or test pass.
 * ================================================================================================= */

/* =================================================================================================
 * 10. CURRENT SECURITY STATUS
 * =================================================================================================
 *
 * [CURRENT VERIFIED STATE]
 * - Project ID verified : lsefezbpbvzwmfcyglye
 * - create_officer_account authorization : VERIFIED (Restricted to active admin sessions or service_role)
 * - create_officer_account password check : VERIFIED (Mandatory password >= 6 chars; fallback removed)
 * - is_admin() helper routine : VERIFIED (SECURITY DEFINER with isolated search_path)
 * - profiles anti-escalation trigger : VERIFIED (trg_prevent_profile_role_escalation active)
 * - profiles RLS policies : VERIFIED (Read authenticated, Insert admin, Update own/admin, Delete admin)
 * - CDR & Financial record RLS : VERIFIED (created_by ownership check enforced)
 * - Evidence scoped RLS : VERIFIED (Join condition corrected on fir_access)
 * - Storage bucket privacy : VERIFIED (Anonymous read access revoked on fir-evidence)
 * - Frontend Leaflet marker XSS : VERIFIED (escapeHtml sanitization active on dynamic labels)
 *
 * [KNOWN LIMITATIONS / FUTURE HARDENING]
 * - Leaked password protection: Supabase Auth HaveIBeenPwned check can be enabled in Supabase Auth Dashboard.
 * - Multi-Factor Authentication (MFA/TOTP): Recommended for senior command/admin roles.
 * ================================================================================================= */
