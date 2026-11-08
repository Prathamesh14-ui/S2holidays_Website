/**
 * Minimal mock of the Sanity HTTP API for testing the CMS code path offline.
 * Serves the sample content in the same shape our GROQ projections return and
 * records mutations (lead creation) in memory.
 *
 *   node --experimental-strip-types tests/mock-sanity.mjs   (port 3333)
 *   SANITY_API_HOST_OVERRIDE=http://localhost:3333 NEXT_PUBLIC_SANITY_PROJECT_ID=mockproj ... next start
 *   GET http://localhost:3333/__mutations  → mutations received
 */
import http from "node:http";
import * as s from "../src/data/sample.ts";

const toSanityImg = (img) => (img ? { kind: "sanity", asset: { _ref: "image-abc123def456-1600x1000-jpg" }, alt: img.alt.replace(" (sample illustration)", "") } : null);
const strip = (o) => {
  const rest = { ...o };
  delete rest.isSample;
  return rest;
};
const dest = s.sampleDestinations.map((d) => ({ ...strip(d), heroImage: toSanityImg(d.heroImage), name: `${d.name}` }));
const pkgs = s.samplePackages.map((p, i) => ({
  ...strip(p),
  heroImage: toSanityImg(p.heroImage),
  // give two packages a CMS price to exercise price display
  price: i === 0 ? { amount: 45999, currency: "INR", basis: "per person", show: true } : i === 1 ? { amount: 30000, show: false } : null,
}));
if (process.env.MOCK_OFFERS) {
  // test offers: live with price cut, expired, switched off, badge-only (no price)
  pkgs[0].offer = { active: true, title: "Diwali Special", offerPrice: 39999, details: "Book before 15 Nov. Minimum 2 adults.", validUntil: "2099-11-15", showOnHomepage: true };
  pkgs[1].offer = { active: true, title: "Expired deal", offerPrice: 1000, validUntil: "2020-01-01" };
  pkgs[2].offer = { active: false, title: "Switched off" };
  pkgs[4].offer = { active: true, title: "Early-bird offer", badge: "Free desert safari", details: "Free desert safari on bookings this month." };
}
const settings = { ...strip(s.sampleSettings), companyName: "S2 Holidays", phone: "+91 00000 00000", email: "test@example.invalid", heroImage: process.env.MOCK_NO_HERO ? null : toSanityImg(s.sampleSettings.heroImage), aboutImage: null, announcement: process.env.MOCK_OFFERS ? { active: true, text: "🪔 Diwali sale: up to 15% off selected holidays — book by 15 Nov", link: "/packages?offer=1" } : null };
const services = s.sampleServices.map((x) => ({ ...strip(x), heroImage: toSanityImg(x.heroImage) }));
const posts = s.samplePosts.map((x) => ({ ...strip(x), coverImage: toSanityImg(x.coverImage) }));
const testimonials = [{ _id: "t1", name: "Mock Reviewer", location: "Test City", quote: "MOCK testimonial used only by the automated CMS test.", tripName: "Mock trip" }];
const mutations = [];
const store = new Map();
const assets = new Map();
let assetBytes = 0;

function resolve(query, params) {
  const m = query.match(/_id match "drafts\.(destination|package)-\*"/);
  if (m) return [...store.values()].filter((d) => d._id.startsWith(`drafts.${m[1]}-`));
  if (query.startsWith("*[_id in $ids]._id")) return params.ids.filter((id) => store.has(id));
  if (query.startsWith("*[_id in $ids]{")) return params.ids.filter((id) => store.has(id)).map((id) => store.get(id));
  if (query.startsWith("count(")) return mutations.filter((m) => params.id && [params.id, params.draft].includes((m.createIfNotExists || m.create || {})._id)).length;
  if (query.includes("sanity.imageAsset")) return assets.get(params.url) ?? null;
  if (process.env.MOCK_EMPTY) return /[\])]\[0\]/.test(query) ? null : []; // brand-new, empty project
  const slug = params.slug;
  if (query.includes('"siteSettings"')) return settings;
  if (query.includes('_type == "holidayPackage" && slug.current == $slug][0]._id')) return pkgs.find((p) => p.slug === slug)?._id ?? null;
  if (query.includes('_type == "destination" && slug.current == $slug')) return dest.find((d) => d.slug === slug) ?? null;
  if (query.includes('_type == "destination"')) return dest;
  if (query.includes('_type == "holidayPackage" && slug.current == $slug')) return pkgs.find((p) => p.slug === slug) ?? null;
  if (query.includes('_type == "holidayPackage"')) return pkgs;
  if (query.includes('_type == "service"')) return services;
  if (query.includes('_type == "testimonial"')) return testimonials;
  if (query.includes('_type == "post" && defined(slug.current) && slug.current == $slug') || query.includes('slug.current == $slug && publishedAt')) return posts.find((p) => p.slug === slug) ?? null;
  if (query.includes('_type == "post"')) return posts;
  if (query.includes('_type == "faq"')) return s.sampleFaqs;
  if (query.includes('_type == "legalPage"')) return s.sampleLegal.map(strip).find((l) => l.slug === slug) ?? null;
  console.warn("[mock-sanity] unhandled query", query.slice(0, 80));
  return null;
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    let body = "";
    for await (const c of req) body += c;
    const send = (obj, code = 200) => {
      res.writeHead(code, { "content-type": "application/json" });
      res.end(JSON.stringify(obj));
    };
    if (url.pathname === "/__mutations") return send(mutations);
    if (url.pathname === "/__assets") return send({ count: assets.size, bytes: assetBytes });
    if (url.pathname.includes("/assets/images/")) {
      const id = `image-mock${assets.size + 1}-800x600-jpg`;
      assetBytes += Buffer.byteLength(body, "binary");
      const src = url.searchParams.get("sourceId");
      if (src) assets.set(src, id);
      return send({ document: { _id: id, _type: "sanity.imageAsset", url: "https://cdn.sanity.io/x.jpg" } });
    }
    if (url.pathname.includes("/data/query/")) {
      let query = url.searchParams.get("query");
      const params = {};
      for (const [k, v] of url.searchParams) if (k.startsWith("$")) params[k.slice(1)] = JSON.parse(v);
      if (req.method === "POST") {
        const b = JSON.parse(body);
        query = b.query;
        Object.assign(params, b.params || {});
      }
      return send({ ms: 1, query, result: resolve(query, params) });
    }
    if (url.pathname.includes("/data/mutate/")) {
      const b = JSON.parse(body);
      mutations.push(...b.mutations);
      for (const mu of b.mutations) {
        const doc = mu.create || mu.createIfNotExists || mu.createOrReplace;
        if (doc && !(mu.createIfNotExists && store.has(doc._id))) store.set(doc._id, doc);
        if (mu.delete) store.delete(mu.delete.id);
      }
      return send({ transactionId: "tx1", results: b.mutations.map((m) => ({ id: (m.create || m.patch || {})._id || m.patch?.id, operation: "create" })) });
    }
    send({ error: "not found" }, 404);
  })
  .listen(3333, () => console.log("mock sanity on :3333"));
