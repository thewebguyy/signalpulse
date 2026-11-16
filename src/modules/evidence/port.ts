import type { ExportCreate, ExportDocument } from "@/contracts/evidence";

/** Future authorized selection/serializer boundary. No renderer/upload implementation. */
export interface EvidenceBuilderPort { select(request: ExportCreate): Promise<ExportDocument> }
