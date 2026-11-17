import { NextResponse } from "next/server";
import { SupabaseAuthAdapter } from "@/server/adapters/supabase/auth-adapter";
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
    const body = (await req.json()) as { confirm_delete_all?: boolean };
    if (!body || body.confirm_delete_all !== true) {
      const failure = createFailure("bad_request", requestId);
      return NextResponse.json(failure.body, { status: failure.status });
    }

    if (auth.deleteAccount) {
      await auth.deleteAccount();
    }

    const now = new Date().toISOString();
    return NextResponse.json(
      {
        data: {
          id: requestId,
          state: "complete",
          accepted_at: now,
          primary_purge_due_at: now,
          message: "Account and all associated private evidence records have been purged.",
        },
        meta: { contract_version: CONTRACT_VERSION, request_id: requestId },
      },
      {
        status: 200,
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
