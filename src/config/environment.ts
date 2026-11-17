import { z } from "zod";

const syntheticEnvironmentSchema = z.strictObject({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SIGNALPULSE_DATA_MODE: z.literal("synthetic").default("synthetic"),
});

const cloudEnvironmentSchema = z.strictObject({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SIGNALPULSE_DATA_MODE: z.literal("cloud_preview"),
  NEXT_PUBLIC_ENABLE_CLOUD_BACKUP: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SIGNALPULSE_ATTACHMENTS_ENABLED: z.enum(["true", "false"]).default("false"),
});

export type FoundationEnvironment =
  | z.infer<typeof syntheticEnvironmentSchema>
  | z.infer<typeof cloudEnvironmentSchema>;

/** Pure parser for tests; server.ts is the only module allowed to read process.env. */
export function parseEnvironment(input: Readonly<Record<string, string | undefined>>): FoundationEnvironment {
  const mode = input.SIGNALPULSE_DATA_MODE ?? "synthetic";

  // In synthetic mode, Supabase and non-synthetic keys are strictly prohibited
  if (mode === "synthetic") {
    const prohibited = Object.keys(input).some((key) => {
      const val = input[key];
      if (val === undefined) return false;
      if (key.startsWith("NEXT_PUBLIC_") && !key.startsWith("NEXT_PUBLIC_VERCEL_")) return true;
      if (key.includes("SUPABASE")) return true;
      if (key.startsWith("SIGNALPULSE_") && key !== "SIGNALPULSE_DATA_MODE") return true;
      return false;
    });
    if (prohibited) {
      throw new Error("Unsupported environment configuration. This milestone accepts synthetic mode only; consult .env.example.");
    }

    const result = syntheticEnvironmentSchema.safeParse({
      NODE_ENV: input.NODE_ENV,
      SIGNALPULSE_DATA_MODE: "synthetic",
    });
    if (!result.success) {
      throw new Error("Invalid foundation environment. Consult .env.example; values are intentionally omitted.");
    }
    return result.data;
  }

  // Reject unsupported data modes (e.g. "live")
  if (mode !== "cloud_preview") {
    throw new Error("Unsupported data mode. Consult .env.example.");
  }

  // Reject unexpected NEXT_PUBLIC_ keys
  const disallowedNextPublic = Object.keys(input).some((key) => {
    return (
      input[key] !== undefined &&
      key.startsWith("NEXT_PUBLIC_") &&
      !key.startsWith("NEXT_PUBLIC_VERCEL_") &&
      key !== "NEXT_PUBLIC_ENABLE_CLOUD_BACKUP" &&
      key !== "NEXT_PUBLIC_SUPABASE_URL" &&
      key !== "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  });
  if (disallowedNextPublic) {
    throw new Error("Disallowed public environment variable.");
  }

  // Reject unexpected SIGNALPULSE_ keys
  const disallowedSignalpulse = Object.keys(input).some((key) => {
    return (
      input[key] !== undefined &&
      key.startsWith("SIGNALPULSE_") &&
      key !== "SIGNALPULSE_DATA_MODE" &&
      key !== "SIGNALPULSE_ATTACHMENTS_ENABLED"
    );
  });
  if (disallowedSignalpulse) {
    throw new Error("Disallowed platform environment variable.");
  }

  const result = cloudEnvironmentSchema.safeParse({
    NODE_ENV: input.NODE_ENV,
    SIGNALPULSE_DATA_MODE: "cloud_preview",
    NEXT_PUBLIC_ENABLE_CLOUD_BACKUP: input.NEXT_PUBLIC_ENABLE_CLOUD_BACKUP,
    NEXT_PUBLIC_SUPABASE_URL: input.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: input.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: input.SUPABASE_SERVICE_ROLE_KEY,
    SIGNALPULSE_ATTACHMENTS_ENABLED: input.SIGNALPULSE_ATTACHMENTS_ENABLED,
  });

  if (!result.success) {
    throw new Error("Invalid environment configuration. Consult .env.example; values are intentionally omitted.");
  }

  return result.data;
}
