import { z } from "zod";

export const idSchema = z.uuid();
export const uintSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export const areaIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
export const identifierSchema = z.string().regex(/^[A-Za-z0-9_.-]{1,64}$/);
export const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
export const instantSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  .refine((value) => {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) && date.toISOString() === value;
  }, "Expected a real UTC instant with millisecond precision");
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => instantSchema.safeParse(`${value}T00:00:00.000Z`).success, "Invalid calendar date");
export const positiveMsSchema = z.number().finite().positive().max(30_000)
  .refine((value) => Math.abs(value * 1000 - Math.round(value * 1000)) < 1e-6,
    "Expected at most three decimal places");
export const mbpsSchema = z.number().finite().nonnegative();

/** Normalizes CRLF/CR; limits code points rather than UTF-16 code units. */
export function textSchema(min = 0, max?: number) {
  return z.string().transform((value) => value.replace(/\r\n?/g, "\n"))
    // eslint-disable-next-line no-control-regex -- Deliberately rejects forbidden JSON text controls.
    .refine((value) => !/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/u.test(value), "Unsafe control character")
    .refine((value) => Array.from(value).length >= min, "Text is too short")
    .refine((value) => max === undefined || Array.from(value).length <= max, "Text is too long");
}

export type ID = z.infer<typeof idSchema>;
export type Instant = z.infer<typeof instantSchema>;
