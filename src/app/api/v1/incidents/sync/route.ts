import { NextResponse } from "next/server";
import { SupabaseSyncAdapter } from "@/server/adapters/supabase/sync-adapter";
import { syncBatchRequestSchema } from "@/contracts/sync";
import { createFailure } from "@/server/errors";
import { CONTRACT_VERSION } from "@/contracts/version";

const syncAdapter = new SupabaseSyncAdapter();

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json();
    const parsed = syncBatchRequestSchema.safeParse(body);
    if (!parsed.success) {
      const failure = createFailure("bad_request", requestId);
      return NextResponse.json(failure.body, { status: failure.status });
    }

    const result = await syncAdapter.processBatch(parsed.data);
    return NextResponse.json(
      {
        data: result,
        meta: { contract_version: CONTRACT_VERSION, request_id: requestId },
      },
      {
        headers: {
          "Cache-Control": "no-store, private",
        },
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("Active session required")) {
      const failure = createFailure("session_required", requestId);
      return NextResponse.json(failure.body, { status: failure.status });
    }
    const failure = createFailure("temporarily_unavailable", requestId);
    return NextResponse.json(failure.body, { status: failure.status });
  }
}
