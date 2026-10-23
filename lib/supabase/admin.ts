import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

/**
 * Supabase client with the secret key. It bypasses row-level security, so use it
 * only in server routes for admin actions (inviting users, audit log), after the
 * route has checked that the caller is an admin.
 */
export function createAdminClient() {
  const env = getServerEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
