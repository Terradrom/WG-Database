import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Acts as the signed-in user from the request cookies; row-level security applies.
 */
export async function createClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The session refresh in proxy.ts (Phase 2) writes them instead.
        }
      },
    },
  });
}
