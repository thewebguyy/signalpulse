import { NextResponse } from "next/server";
import { SupabaseAuthAdapter } from "@/server/adapters/supabase/auth-adapter";
import { createFailure } from "@/server/errors";
import { isSameOriginMutation } from "@/server/request-origin";

const auth = new SupabaseAuthAdapter();

export async function POST(req: Request) {
  if (!isSameOriginMutation(req)) {
    const failure = createFailure("request_forbidden", crypto.randomUUID());
    return NextResponse.json(failure.body, { status: failure.status });
  }
  try {
    await auth.logout();
    return new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch {
    const failure = createFailure("temporarily_unavailable", crypto.randomUUID());
    return NextResponse.json(failure.body, { status: failure.status });
  }
}
