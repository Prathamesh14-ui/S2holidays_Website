/**
 * End-to-end smoke tests (Playwright, no test runner needed).
 *   BASE_URL=http://localhost:3000 node tests/e2e/smoke.mjs
 * Run against `npm run dev` or `npm run build && npm start`.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const results = [];
let failed = 0;
async function test(name, fn) {
  try {
    await fn();
    results.push(`  ✓ ${name}`);
    if (process.env.VERBOSE) console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    results.push(`  ✗ ${name}\n      ${String(e.message).split("\n")[0]}`);
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const ROUTES = [
  "/", "/destinations", "/destinations/domestic", "/destinations/international", "/destinations/kerala",
  "/packages", "/packages/kashmir-valley-escape", "/services", "/services/mumbai-sightseeing",
  "/services/car-rental", "/services/tourist-guide", "/about", "/contact", "/blog",
  "/blog/packing-for-a-hill-station-trip", "/faq", "/privacy-policy", "/terms", "/plan-my-trip",
];

const browser = await chromium.launch();

for (const vp of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
  const ctx = await browser.newContext({ viewport: vp });
  for (const route of ROUTES) {
    await test(`[${vp.name}] ${route} renders cleanly`, async () => {
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        // In offline CMS-mock runs, images on cdn.sanity.io cannot load — ignore only those.
        if (process.env.IGNORE_REMOTE_IMAGE_ERRORS && m.text().startsWith("Failed to load resource")) return;
        if (m.type() === "error") errors.push(m.text());
      });
      const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
      assert(res.status() === 200, `status ${res.status()}`);
      const info = await page.evaluate(() => ({
        h1: document.querySelectorAll("h1").length,
        title: document.title,
        desc: document.querySelector('meta[name="description"]')?.content || "",
        canonical: document.querySelector('link[rel="canonical"]')?.href || "",
        imgsNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
        unlabelled: [...document.querySelectorAll("input:not([type=hidden]):not([tabindex='-1']), select, textarea")].filter(
          (el) => !(el.labels && el.labels.length) && !el.getAttribute("aria-label")
        ).length,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { JSON.parse(s.textContent); return true; } catch { return false; } }),
      }));
      assert(info.h1 === 1, `expected exactly one <h1>, found ${info.h1}`);
      assert(info.title.length > 10, "missing <title>");
      assert(info.desc.length > 20, "missing meta description");
      assert(info.canonical.length > 0, "missing canonical link");
      assert(info.imgsNoAlt === 0, `${info.imgsNoAlt} images without alt`);
      assert(info.unlabelled === 0, `${info.unlabelled} unlabelled form controls`);
      assert(!info.overflow, "horizontal overflow");
      assert(info.jsonld.every(Boolean), "invalid JSON-LD");
      assert(errors.length === 0, `console errors: ${errors.join(" | ")}`);
      await page.close();
    });
  }
  await ctx.close();
}

await test("404 page for unknown URLs", async () => {
  const page = await browser.newPage();
  const res = await page.goto(BASE + "/does-not-exist");
  assert(res.status() === 404, `status ${res.status()}`);
  assert(await page.getByText("This page has wandered off").isVisible(), "404 copy missing");
  await page.close();
});

await test("mobile menu opens, lists links and navigates", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + "/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.locator("#mobile-menu");
  await menu.getByRole("link", { name: "Packages" }).click();
  await page.waitForURL("**/packages");
  await menu.waitFor({ state: "hidden", timeout: 2000 }); // closes with a short fade
  await page.close();
});

await test("desktop dropdown shows destinations", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const trigger = page.getByRole("button", { name: "Domestic" });
  await trigger.click();
  await page.locator('button[aria-expanded="true"]', { hasText: "Domestic" }).waitFor({ timeout: 5000 });
  await page.locator("#menu-Domestic").getByRole("link", { name: "Kerala" }).click();
  await page.waitForURL("**/destinations/kerala");
  await page.close();
});

await test("trip finder navigates to a destination", async () => {
  const page = await browser.newPage();
  await page.goto(BASE + "/");
  await page.selectOption("#trip-destination", "kerala");
  await page.getByRole("button", { name: "Explore trips" }).click();
  await page.waitForURL("**/destinations/kerala");
  await page.close();
});

await test("package filters update results and URL", async () => {
  const page = await browser.newPage();
  await page.goto(BASE + "/packages");
  await page.locator("[aria-pressed]").first().waitFor(); // filter UI hydrated
  const count = () => page.locator("main ul.grid > li").count();
  const all = await count();
  await page.locator("[aria-pressed]", { hasText: "International" }).click();
  await page.waitForURL(/region=international/);
  const intl = await count();
  assert(intl > 0 && intl < all, `expected fewer results (${all} → ${intl})`);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.waitForURL((u) => !u.search);
  assert((await count()) === all, "clear filters should restore results");
  await page.close();
});

await test("itinerary days expand and collapse", async () => {
  const page = await browser.newPage();
  await page.goto(BASE + "/packages/kashmir-valley-escape");
  const day3 = page.locator("details", { hasText: "Srinagar to Pahalgam" });
  assert(!(await day3.evaluate((d) => d.open)), "day 3 should start collapsed");
  await day3.locator("summary").click();
  assert(await day3.evaluate((d) => d.open), "day 3 should open");
  await page.close();
});

await test("enquiry form shows validation errors", async () => {
  const page = await browser.newPage();
  await page.goto(BASE + "/contact");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  assert(await page.getByText("Please enter your name").isVisible(), "name error missing");
  assert(await page.getByText("Please agree so we can contact you").isVisible(), "consent error missing");
  assert((await page.locator('[aria-invalid="true"]').count()) >= 3, "aria-invalid not set");
  await page.close();
});

await test("package enquiry submits successfully", async () => {
  const page = await browser.newPage();
  await page.goto(BASE + "/packages/goa-beach-break");
  const form = page.locator("aside form");
  await form.getByLabel("Full name *").fill("E2E Test Traveller");
  await form.getByLabel("Email *").fill("e2e@example.com");
  await form.getByLabel("Phone / WhatsApp *").fill("+91 90000 00000");
  await form.getByLabel("Message").fill("Automated test enquiry — please ignore.");
  await form.locator('input[name="consent"]').check();
  await page.waitForTimeout(2600); // anti-bot minimum fill time
  await form.getByRole("button", { name: "Send enquiry" }).click();
  // With Sanity or email configured (or in dev) the lead is accepted. In a production
  // build with NO lead storage and NO email, the API deliberately returns 503 instead
  // of silently dropping the lead — both outcomes are valid, anything else is a bug.
  const ok = page.getByText("Thank you — enquiry received");
  const unavailable = page.getByText("We couldn't send your enquiry right now");
  await ok.or(unavailable).waitFor({ timeout: 10000 });
  if (await unavailable.isVisible()) console.log("  (note) enquiry backend not configured — got the expected 503 message");
  await page.close();
});

await test("sitemap and robots are valid", async () => {
  const page = await browser.newPage();
  const sm = await (await page.request.get(BASE + "/sitemap.xml")).text();
  assert(sm.includes("<urlset") && sm.includes("/packages/kashmir-valley-escape"), "sitemap incomplete");
  const rb = await (await page.request.get(BASE + "/robots.txt")).text();
  assert(/Sitemap:/i.test(rb) && /Disallow: \/studio/.test(rb), "robots.txt incomplete");
  await page.close();
});

await test("security headers are set", async () => {
  const page = await browser.newPage();
  const res = await page.request.get(BASE + "/");
  const h = res.headers();
  for (const k of ["x-content-type-options", "referrer-policy", "x-frame-options", "permissions-policy"]) assert(h[k], `missing ${k}`);
  assert(!h["x-powered-by"], "x-powered-by should be hidden");
  await page.close();
});

await browser.close();
console.log(results.join("\n"));
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
