import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '~root/constants';

// Used exclusively for Supabase Realtime (notifications). All other
// auth/CRUD traffic goes through the FastAPI backend via httpClient — this
// client never talks to Postgres directly.
export const supabaseRealtimeClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
