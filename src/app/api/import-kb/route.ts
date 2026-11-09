import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { checkPassword, runImportBatch, runPublishBatch } from "@/lib/import-kb";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`import-kb:${ip}`, 120, 10 * 60 * 1000).ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  if (!checkPassword(body.password)) return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  try {
    if (body.action === "publish") {
      const r = await runPublishBatch();
      revalidateTag("sanity", { expire: 0 });
      return NextResponse.json(r);
    }
    const offset = Number.isInteger(body.offset) ? Math.max(0, body.offset as number) : 0;
    return NextResponse.json(await runImportBatch(offset));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
