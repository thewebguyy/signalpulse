import { z } from "zod";
import { idSchema } from "./scalars";

export const guestCreateSchema = z.strictObject({ accept_guest_limitations: z.literal(true) });
export const sessionSchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("signed_out"), owner_id: z.null(), recovery_mode: z.literal("none"), csrf_token: z.string() }),
  z.object({ state: z.literal("active_guest"), owner_id: idSchema, recovery_mode: z.literal("none"), csrf_token: z.string() }),
]);
export type Session = z.infer<typeof sessionSchema>;
export type GuestCreate = z.infer<typeof guestCreateSchema>;
