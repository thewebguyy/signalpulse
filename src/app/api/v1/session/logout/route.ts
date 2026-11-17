import { NextResponse } from "next/server";
import { SupabaseAuthAdapter } from "@/server/adapters/supabase/auth-adapter";

const auth = new SupabaseAuthAdapter();

export async function POST() {
  await auth.logout();
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store, private",
    },
  });
}
