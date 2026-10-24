import { z } from "zod";

// All configuration comes from environment variables and is validated here.
// Public values are inlined into the browser bundle by Next.js, so they must be
// referenced as literal `process.env.NEXT_PUBLIC_*` expressions.

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .url()
    .regex(/^https?:\/\/[^/]+\/?$/, "must be the project address only, without a path"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .regex(/^(sb_publishable_|eyJ)/, "must be the publishable key (starts with sb_publishable_)"),
});

export const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .regex(/^(sb_secret_|eyJ)/, "must be the secret key (starts with sb_secret_)"),
  // Not needed until Phase 6; validated for shape when present.
  ANTHROPIC_API_KEY: z
    .string()
    .regex(/^sk-ant-/, "must start with sk-ant-")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  ANTHROPIC_MODEL: z.string().min(1).default("claude-sonnet-5-5"),
  APP_URL: z.url().default("http://localhost:3000"),
  MAX_VIDEO_MB: z.coerce.number().int().positive().default(50),
  AI_DAILY_LIMIT: z.coerce.number().int().positive().default(30),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Turns zod issues into lines that name the variable but never its value. */
export function describeEnvIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const name = issue.path.join(".") || "(root)";
    return issue.code === "invalid_type" ? `${name} is missing` : `${name} ${issue.message}`;
  });
}

function parseOrThrow<T extends z.ZodType>(schema: T, source: unknown): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n  - ${describeEnvIssues(result.error).join("\n  - ")}`,
    );
  }
  return result.data;
}

let publicEnv: PublicEnv | undefined;

export function getPublicEnv(): PublicEnv {
  publicEnv ??= parseOrThrow(publicEnvSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return publicEnv;
}

let serverEnv: ServerEnv | undefined;

/** Server only. Importing modules guard with `server-only` before calling this. */
export function getServerEnv(): ServerEnv {
  serverEnv ??= parseOrThrow(serverEnvSchema, process.env);
  return serverEnv;
}
