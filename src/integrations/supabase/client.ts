import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// Export a dummy client if keys are missing to prevent white screen crash
export const supabase = (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : { 
      from: () => ({ select: () => ({ order: () => ({ data: [], error: null }) }), eq: () => ({ maybeSingle: () => ({ data: null, error: null }) }) }),
      auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), getSession: async () => ({ data: { session: null } }) },
      functions: { invoke: async () => ({ data: null, error: new Error("Supabase Keys Missing") }) }
    } as any;
