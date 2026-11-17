import { NextResponse } from "next/server";
import { SupabaseAuthAdapter } from "@/server/adapters/supabase/auth-adapter";
import { guestCreateSchema } from "@/contracts/session";
import { createFailure } from "@/server/errors";
import { CONTRACT_VERSION } from "@/contracts/version";

const auth = new SupabaseAuthAdapter();

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const session = await auth.readSession();
    return NextResponse.json(
      {
        data: session,
        meta: { contract_version: CONTRACT_VERSION, request_id: requestId },
      },
      {
        headers: {
          "Cache-Control": "no-store, private",
        },
      }
    );
  } catch {
    const failure = createFailure("temporarily_unavailable", requestId);
    return NextResponse.json(failure.body, { status: failure.status });
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json();
    const parsed = guestCreateSchema.safeParse(body);
    if (!parsed.success) {
      const failure = createFailure("bad_request", requestId);
      return NextResponse.json(failure.body, { status: failure.status });
    }

    const session = await auth.createGuest(parsed.data);
    return NextResponse.json(
      {
        data: session,
        meta: { contract_version: CONTRACT_VERSION, request_id: requestId },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store, private",
        },
      }
    );
  } catch {
    const failure = createFailure("temporarily_unavailable", requestId);
    return NextResponse.json(failure.body, { status: failure.status });
  }
}
