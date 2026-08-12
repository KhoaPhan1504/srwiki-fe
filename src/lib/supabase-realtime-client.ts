import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '~root/constants';
import { authAtom, localStore } from '~root/stores';

// Used exclusively for Supabase Realtime (notifications). All other
// auth/CRUD traffic goes through the FastAPI backend via httpClient — this
// client never talks to Postgres directly.
//
// `accessToken` reads the app's own JWT from its existing Jotai store — NOT
// from `supabase.auth`, which this app never signs in through. Passing this
// option makes `_getSessionToken()` (used both for the initial connection and
// for the re-auth every channel triggers right after `subscribe()` succeeds)
// short-circuit to calling this callback directly, so it always resolves to
// the same JWT instead of falling back to the anon key. It also has two
// side effects that are desirable here: supabase-js swaps `.auth` for a
// throwing proxy (reinforcing the "Realtime only" boundary) and skips
// starting the internal GoTrue client (auth listeners, token-refresh timers,
// URL session detection), so this client no longer boots that machinery on
// every page load, including the logged-out /auth/login page.
//
// `SUPABASE_URL`/`SUPABASE_ANON_KEY` are optional (see src/constants/index.ts)
// so that a missing env var only disables Realtime, not the whole app —
// the client is `null` when either is absent.
export const supabaseRealtimeClient: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        accessToken: async () => localStore.get(authAtom)?.token ?? null,
      })
    : null;
