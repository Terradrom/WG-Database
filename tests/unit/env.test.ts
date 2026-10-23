import { describe, expect, it } from "vitest";
import { describeEnvIssues, publicEnvSchema, serverEnvSchema } from "@/lib/env";

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abcdefgh.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_test",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_test",
};

describe("environment schema", () => {
  it("accepts a minimal valid configuration and fills defaults", () => {
    const env = serverEnvSchema.parse(valid);
    expect(env.ANTHROPIC_MODEL).toBe("claude-sonnet-5-5");
    expect(env.APP_URL).toBe("http://localhost:3000");
    expect(env.MAX_VIDEO_MB).toBe(50);
    expect(env.AI_DAILY_LIMIT).toBe(30);
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
  });

  it("treats an empty ANTHROPIC_API_KEY as not set", () => {
    expect(
      serverEnvSchema.parse({ ...valid, ANTHROPIC_API_KEY: "" }).ANTHROPIC_API_KEY,
    ).toBeUndefined();
  });

  it("coerces numbers from strings", () => {
    const env = serverEnvSchema.parse({ ...valid, MAX_VIDEO_MB: "120", AI_DAILY_LIMIT: "5" });
    expect(env.MAX_VIDEO_MB).toBe(120);
    expect(env.AI_DAILY_LIMIT).toBe(5);
  });

  it("rejects a secret key in the publishable slot", () => {
    const result = publicEnvSchema.safeParse({
      ...valid,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_secret_oops",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a URL with a path", () => {
    const result = publicEnvSchema.safeParse({
      ...valid,
      NEXT_PUBLIC_SUPABASE_URL: "https://abcdefgh.supabase.co/rest/v1",
    });
    expect(result.success).toBe(false);
  });

  it("names the variable in errors but never prints its value", () => {
    const secret = "not-a-real-secret-value";
    const result = serverEnvSchema.safeParse({ ...valid, SUPABASE_SERVICE_ROLE_KEY: secret });
    expect(result.success).toBe(false);
    const lines = describeEnvIssues(result.error!);
    expect(lines.join("\n")).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(lines.join("\n")).not.toContain(secret);
  });

  it("reports missing variables as missing", () => {
    const result = serverEnvSchema.safeParse({});
    const lines = describeEnvIssues(result.error!);
    expect(lines).toContain("SUPABASE_SERVICE_ROLE_KEY is missing");
  });
});
