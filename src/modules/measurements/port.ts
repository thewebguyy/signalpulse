import type { Measurement } from "@/contracts/measurements";

/** Read DTO boundary only. No test transport, ingestion or receipt verifier exists. */
export interface MeasurementHistoryPort { read(id: string): Promise<Measurement> }
