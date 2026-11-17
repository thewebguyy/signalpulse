import { NextResponse } from "next/server";
import { SupabaseAttachmentAdapter } from "@/server/adapters/supabase/attachment-adapter";
import { attachmentReserveRequestSchema } from "@/contracts/attachments";
import { createFailure } from "@/server/errors";
import { CONTRACT_VERSION } from "@/contracts/version";

const attachments = new SupabaseAttachmentAdapter();

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json();
    const parsed = attachmentReserveRequestSchema.safeParse(body);
    if (!parsed.success) {
      const failure = createFailure("bad_request", requestId);
      return NextResponse.json(failure.body, { status: failure.status });
    }

    const metadata = await attachments.reserve(parsed.data);
    return NextResponse.json(
      {
        data: metadata,
        meta: { contract_version: CONTRACT_VERSION, request_id: requestId },
      },
      {
        status: 201,
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
