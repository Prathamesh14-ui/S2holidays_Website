import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { checkPassword, addMumbaiGoa } from "@/lib/add-mumbai-goa";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`mumbai-goa:${ip}`, 10, 10 * 60 * 1000).ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  if (!checkPassword(body.password)) return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  try {
    const results = await addMumbaiGoa();
    revalidateTag("sanity", { expire: 0 });
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
