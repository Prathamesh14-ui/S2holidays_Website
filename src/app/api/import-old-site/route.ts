import { NextResponse, type NextRequest } from "next/server";
import { checkPassword, runImportBatch } from "@/lib/import-old-site";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`import:${ip}`, 40, 10 * 60 * 1000).ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  let body: { password?: unknown; offset?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!checkPassword(body.password)) return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  const offset = Number.isInteger(body.offset) ? (body.offset as number) : 0;
  try {
    return NextResponse.json(await runImportBatch(Math.max(0, offset)));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
