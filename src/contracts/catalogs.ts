import { z } from "zod";
import { operatorSchema } from "./domain";
import { areaIdSchema, textSchema } from "./scalars";

export const operatorEntrySchema = z.object({ code: operatorSchema, display_name: textSchema() });
export const areaEntrySchema = z.object({ id: areaIdSchema, name: textSchema(), state: z.literal("Lagos"), kind: z.literal("lga") });
export type OperatorEntry = z.infer<typeof operatorEntrySchema>;
export type AreaEntry = z.infer<typeof areaEntrySchema>;
