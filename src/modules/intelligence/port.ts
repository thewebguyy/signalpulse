import type { PublicCohort, PublicCohortQuery } from "@/contracts/intelligence";

/** No aggregate producer or publication eligibility implementation is installed. */
export interface PublicIntelligencePort { read(query: PublicCohortQuery): Promise<PublicCohort> }
