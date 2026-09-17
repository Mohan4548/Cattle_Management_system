import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

export const supabase = config.supabaseUrl && config.supabaseKey 
  ? createClient(config.supabaseUrl, config.supabaseKey)
  : null;
