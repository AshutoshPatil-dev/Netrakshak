import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_']);
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://lsefezbpbvzwmfcyglye.supabase.co';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZWZlemJwYnZ6d21mY3lnbHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyODc4MTMsImV4cCI6MjEwNDg2MzgxM30.PL-yOaOQm5gp-K3jutuiW_uAtBRgam68VuVhhjkhO10';

  return {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey)
    },
    envPrefix: ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_']
  };
});
