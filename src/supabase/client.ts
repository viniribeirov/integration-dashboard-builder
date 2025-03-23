
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// These environment variables should be set in a .env file
// and added to .gitignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables for Supabase client!');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;
