import { NextResponse } from "next/server";
import { SupabaseAuthAdapter } from "@/server/adapters/supabase/auth-adapter";
import { linkRecoveryRequestSchema } from "@/contracts/auth";
import { createFailure } from "@/server/errors";
import { CONTRACT_VERSION } from "@/contracts/version";
import { isSameOriginMutation } from "@/server/request-origin";

const auth = new SupabaseAuthAdapter();

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  if (!isSameOriginMutation(req)) {
    const failure = createFailure("request_forbidden", requestId);
    return NextResponse.json(failure.body, { status: failure.status });
  }
  try {
    const body = await req.json();
    const parsed = linkRecoveryRequestSchema.safeParse(body);
    if (!parsed.success) {
      const failure = createFailure("bad_request", requestId);
      return NextResponse.json(failure.body, { status: failure.status });
    }

    const result = await auth.linkRecovery(parsed.data);
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
