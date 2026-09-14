import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;

/**
 * Creates a new officer in Supabase Auth (auth.users) and Public Profiles (public.profiles)
 * Uses an isolated client with persistSession: false so that the logged-in administrator's
 * active session is preserved and not switched.
 */
export async function createOfficerAccount({ email, password, name, rank, district, state, phone, role }) {
  if (!supabaseConfigured) return null;

  const authClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  const { data, error } = await authClient.auth.signUp({
    email,
    password: password || 'password123',
    options: {
      data: {
        display_name: name,
        unit_name: district || 'Maharashtra Police',
        role_name: role || 'case-officer',
        rank: rank || 'Sub-Inspector',
        district: district || '',
        state: state || 'Maharashtra',
        phone: phone || ''
      }
    }
  });

  if (error) {
    throw error;
  }

  const userId = data?.user?.id;
  if (userId) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: name,
      unit_name: district || 'Maharashtra Police',
      role_name: role || 'case-officer',
      rank: rank || 'Sub-Inspector',
      district: district || '',
      state: state || 'Maharashtra',
      email: email,
      phone: phone || '',
      is_active: true
    });

    if (profileError) {
      console.warn('Profile table upsert note:', profileError);
    }
    return userId;
  }
  return null;
}
