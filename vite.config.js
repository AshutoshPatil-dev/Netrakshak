import { defineConfig } from 'vite';

export default defineConfig({
  envPrefix: ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_']
});
