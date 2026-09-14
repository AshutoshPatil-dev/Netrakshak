import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://lsefezbpbvzwmfcyglye.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZWZlemJwYnZ6d21mY3lnbHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyODc4MTMsImV4cCI6MjEwNDg2MzgxM30.PL-yOaOQm5gp-K3jutuiW_uAtBRgam68VuVhhjkhO10';

export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;

/**
 * Creates a new officer in Supabase Auth (auth.users) and Public Profiles (public.profiles)
 * Calls the secure PostgreSQL RPC function create_officer_account which creates the user
 * with auto-confirmed email so they can log in immediately.
 */
export async function createOfficerAccount({ email, password, name, rank, district, state, phone, role, badge_no }) {
  if (!supabaseConfigured) return null;

  const { data: rpcUserId, error: rpcError } = await supabase.rpc('create_officer_account', {
    p_email: email,
    p_password: password || 'password123',
    p_name: name,
    p_rank: rank || 'Sub-Inspector',
    p_district: district || '',
    p_state: state || 'Maharashtra',
    p_phone: phone || '',
    p_role: role || 'case-officer',
    p_badge_no: badge_no || ''
  });

  if (rpcError) {
    console.error('RPC create_officer_account error:', rpcError);
    throw rpcError;
  }

  return rpcUserId;
}
