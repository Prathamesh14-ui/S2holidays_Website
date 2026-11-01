import { describe, expect, it, beforeEach } from "vitest";
import { rateLimit, __resetRateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => __resetRateLimit());
  it("allows up to the limit then blocks", () => {
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 60_000).ok).toBe(true);
    const r = rateLimit("k", 3, 60_000);
    expect(r.ok).toBe(false);
    expect(r.retryAfter).toBeGreaterThan(0);
  });
  it("tracks keys independently", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", 3, 60_000);
    expect(rateLimit("b", 3, 60_000).ok).toBe(true);
  });
});
