// npm run check:env
// Validates .env.local with the app's own zod schema and checks that the Supabase
// project accepts both keys. Prints only OK/FAIL per variable, never a value.
import nextEnv from "@next/env";
import { describeEnvIssues, serverEnvSchema } from "../lib/env";

nextEnv.loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error });

const result = serverEnvSchema.safeParse(process.env);
const names = Object.keys(serverEnvSchema.shape);

if (!result.success) {
  const issues = describeEnvIssues(result.error);
  const failed = new Set(result.error.issues.map((i) => String(i.path[0])));
  for (const name of names) if (!failed.has(name)) console.log(`OK    ${name}`);
  for (const line of issues) console.log(`FAIL  ${line}`);
  process.exit(1);
}

const env = result.data;
for (const name of names) {
  const optionalAndEmpty = name === "ANTHROPIC_API_KEY" && !env.ANTHROPIC_API_KEY;
  console.log(optionalAndEmpty ? `--    ${name} not set yet (needed in Phase 6)` : `OK    ${name}`);
}

let ok = true;
if (env.SUPABASE_SERVICE_ROLE_KEY === env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log("FAIL  the secret key and the publishable key are the same value");
  ok = false;
}

const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const keys = {
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
};
for (const [name, key] of Object.entries(keys)) {
  try {
    const res = await fetch(`${base}/auth/v1/settings`, { headers: { apikey: key } });
    console.log(
      res.ok
        ? `OK    ${name} accepted by the project`
        : `FAIL  ${name} rejected by the project (HTTP ${res.status})`,
    );
    ok &&= res.ok;
  } catch {
    console.log(`FAIL  could not reach the Supabase project`);
    ok = false;
    break;
  }
}

process.exit(ok ? 0 : 1);
