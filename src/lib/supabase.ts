/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qtlpmcsvzgwdzkopcjnp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0bHBtY3N2emd3ZHprb3Bjam5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjAzNzYsImV4cCI6MjA4NzQzNjM3Nn0.5pFNzJ7bbG7V-s9JahP0n-68kIGgg88vZYQ5Kzfl7Zs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
