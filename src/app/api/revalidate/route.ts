import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { serverEnv } from "@/lib/server-env";

/**
 * Sanity webhook → refresh cached content after editors publish.
 * Configure in sanity.io/manage → API → Webhooks (see README). The request is
 * verified with the shared SANITY_REVALIDATE_SECRET signature.
 */
export async function POST(req: NextRequest) {
  if (!serverEnv.revalidateSecret) {
    return NextResponse.json({ error: "Revalidation secret not configured" }, { status: 500 });
  }
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, serverEnv.revalidateSecret, true);
    if (!isValidSignature) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    if (body?._type === "lead") return NextResponse.json({ revalidated: false, reason: "leads are not public content" });
    revalidateTag("sanity", { expire: 0 }); // next visit fetches fresh content
    return NextResponse.json({ revalidated: true, type: body?._type ?? null });
  } catch (err) {
    console.error("[revalidate]", (err as Error).message);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
