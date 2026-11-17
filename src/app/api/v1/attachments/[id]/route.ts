import { NextResponse } from "next/server";
import { SupabaseAttachmentAdapter } from "@/server/adapters/supabase/attachment-adapter";
import { createFailure } from "@/server/errors";
import { isSameOriginMutation } from "@/server/request-origin";

const attachments = new SupabaseAttachmentAdapter();

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const requestId = crypto.randomUUID();

  try {
    const { data, mimeType, originalFilename } = await attachments.downloadContent(id);

    return new NextResponse(data as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(originalFilename)}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("quarantined")) {
      const failure = createFailure("state_conflict", requestId);
      return NextResponse.json(failure.body, { status: failure.status });
    }
    const failure = createFailure("not_found", requestId);
    return NextResponse.json(failure.body, { status: failure.status });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSameOriginMutation(req)) {
    const failure = createFailure("request_forbidden", crypto.randomUUID());
    return NextResponse.json(failure.body, { status: failure.status });
  }
  const { id } = await context.params;
  try {
    await attachments.delete(id);
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store, private",
      },
    });
  } catch {
    const failure = createFailure("temporarily_unavailable", crypto.randomUUID());
    return NextResponse.json(failure.body, { status: failure.status });
  }
}
