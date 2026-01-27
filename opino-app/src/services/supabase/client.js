import { createClient } from '@supabase/supabase-js';
import { logger } from '../../lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else if (process.env.NODE_ENV === 'development') {
  logger.warn('Supabase credentials not found. Supabase features will not work.');
}

export default supabase;
