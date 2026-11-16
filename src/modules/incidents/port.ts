import type { Incident, IncidentCreate, IncidentReplace } from "@/contracts/incidents";
import type { Page } from "@/contracts/common";

/** Owner is resolved by a future trusted adapter, never accepted as a wire field. */
export interface IncidentJournalPort {
  list(): Promise<Page<Incident>>;
  read(id: string): Promise<Incident>;
  create(request: IncidentCreate): Promise<Incident>;
  replace(id: string, request: IncidentReplace): Promise<Incident>;
}
