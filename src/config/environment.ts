import { z } from "zod";

const environmentSchema = z.strictObject({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SIGNALPULSE_DATA_MODE: z.literal("synthetic").default("synthetic"),
});
export type FoundationEnvironment = z.infer<typeof environmentSchema>;

/** Pure parser for tests; server.ts is the only module allowed to read process.env. */
export function parseEnvironment(input: Readonly<Record<string, string | undefined>>): FoundationEnvironment {
  const prohibited = Object.keys(input).some((key) => input[key] !== undefined &&
    ((key.startsWith("NEXT_PUBLIC_") && !key.startsWith("NEXT_PUBLIC_VERCEL_")) || key.includes("SUPABASE") ||
      (key.startsWith("SIGNALPULSE_") && key !== "SIGNALPULSE_DATA_MODE")));
  if (prohibited) throw new Error("Unsupported environment configuration. This milestone accepts synthetic mode only; consult .env.example.");
  const result = environmentSchema.safeParse({ NODE_ENV: input.NODE_ENV, SIGNALPULSE_DATA_MODE: input.SIGNALPULSE_DATA_MODE });
  if (!result.success) throw new Error("Invalid foundation environment. Consult .env.example; values are intentionally omitted.");
  return result.data;
}
