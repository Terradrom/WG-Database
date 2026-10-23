import { connection } from "next/server";
import { getServerEnv, type ServerEnv } from "@/lib/env";

type Check = "ok" | "error";

async function pingSupabase(env: ServerEnv): Promise<Check> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/auth/v1/health`, {
      headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}

// Answers {"status":"ok"} when the configuration is valid and Supabase is reachable.
// Reports only ok/error per check: no values, hosts or error details.
export async function GET() {
  await connection();

  let env: ServerEnv | undefined;
  try {
    env = getServerEnv();
  } catch {
    env = undefined;
  }

  const config: Check = env ? "ok" : "error";
  const supabase: Check = env ? await pingSupabase(env) : "error";
  const status = config === "ok" && supabase === "ok" ? "ok" : "degraded";

  return Response.json(
    { status, checks: { config, supabase } },
    { status: status === "ok" ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
