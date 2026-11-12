import { createClient } from '@supabase/supabase-js';

// Variables de entorno para Supabase (con soporte para anon key o publishable key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.empty_or_local';

if (!import.meta.env.VITE_SUPABASE_URL && import.meta.env.PROD) {
  console.warn('VITE_SUPABASE_URL no está configurada en variables de entorno.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
