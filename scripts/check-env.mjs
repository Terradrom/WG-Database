// Checks .env.local without printing any values.
// Run: node scripts/check-env.mjs  (becomes `npm run check:env` in Phase 1, with zod)
import { readFileSync } from "node:fs";

const required = {
  NEXT_PUBLIC_SUPABASE_URL: (v) => /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(v) || "should look like https://abcdefgh.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: (v) => v.startsWith("sb_publishable_") || v.startsWith("eyJ") || "should start with sb_publishable_ (or eyJ for older projects)",
  SUPABASE_SERVICE_ROLE_KEY: (v) => v.startsWith("sb_secret_") || v.startsWith("eyJ") || "should start with sb_secret_ (or eyJ for older projects)",
};

let text;
try {
  text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
} catch {
  console.error("FAIL  .env.local not found in the project folder");
  process.exit(1);
}

const env = {};
for (const line of text.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

let ok = true;
for (const [name, check] of Object.entries(required)) {
  const value = env[name] ?? "";
  const result = value ? check(value) : "is empty";
  if (result === true) {
    console.log(`OK    ${name}`);
  } else {
    console.log(`FAIL  ${name} ${result}`);
    ok = false;
  }
}
if (env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY === env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log("FAIL  the secret key and the publishable key are the same value");
  ok = false;
}

// Live check: does the project accept each key? Only status codes are printed.
if (ok) {
  const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  for (const name of ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]) {
    try {
      const res = await fetch(`${base}/auth/v1/settings`, { headers: { apikey: env[name] } });
      if (res.ok) {
        console.log(`OK    ${name} accepted by the project`);
      } else {
        console.log(`FAIL  ${name} rejected by the project (HTTP ${res.status})`);
        ok = false;
      }
    } catch {
      console.log(`FAIL  could not reach ${base}`);
      ok = false;
      break;
    }
  }
}
process.exit(ok ? 0 : 1);
