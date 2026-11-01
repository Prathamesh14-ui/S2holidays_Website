# S2 Holidays — website & content management

A rebuild of the S2 Holidays website (https://www.s2holidays.com) as a fast, accessible, CMS-driven
travel website. It has domestic and international holidays, destination and package pages with
day-wise itineraries, Mumbai sightseeing, car rental and tourist-guide services, a blog and FAQs.
Enquiries can come in through web forms (saved as leads) or WhatsApp.

> **Status: preview build.** All content is clearly labelled **sample content** until S2 Holidays
> supplies verified information. No prices, reviews, contact details or company facts have been
> invented. See [Remaining issues](docs/TESTING_REPORT.md#remaining-issues--required-inputs).

| Document | For |
| --- | --- |
| [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | Staff who edit content and manage enquiries |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Going live on Vercel + Sanity, DNS, backups |
| [docs/TESTING_REPORT.md](docs/TESTING_REPORT.md) | What was tested, results, open issues |

---

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router, Cache Components) + React 19 + TypeScript | Static pages with on-demand refresh; excellent SEO and speed |
| Styling | **Tailwind CSS 4** | Design tokens in `src/app/globals.css` |
| CMS | **Sanity 6**, Studio embedded at **`/studio`** | Polished editor, image CDN with hotspots, roles, history, no server to maintain |
| Leads | Stored in Sanity as private `lead.*` documents | One admin tool for content *and* enquiries, with status tracking |
| Email | **Resend** REST API (no SDK) | Simple, reliable transactional email |
| Hosting | **Vercel** | Native Next.js support, preview deployments |
| Validation | **Zod** (shared client/server schema) | Same rules in the browser and on the server |

Fonts (Cormorant Garamond + Inter) are self-hosted via Fontsource, so there are no third-party font requests.

## Quick start

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Open http://localhost:3000. With **no** Sanity project ID set, the site runs on the bundled sample
content (`src/data/sample.ts`) and shows a "Preview build" banner. Enquiries submitted in local
development without Sanity are saved to `.data/leads.ndjson` (git-ignored).

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser smoke tests (Playwright) against `BASE_URL` (default `http://localhost:3000`) |
| `npm run seed:sample` | *Optional* — copy sample content into a Sanity dataset (`-- --confirm`) |
| `npm run generate:art` | Regenerate the sample illustrations in `public/sample/` |

## Environment variables

See [`.env.example`](.env.example). Only `NEXT_PUBLIC_*` values reach the browser; everything else
is server-only (`src/lib/server-env.ts` imports `server-only`, so the build fails if a secret is ever
imported into client code).

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | prod | Canonical URLs, sitemap, Open Graph |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` / `_API_VERSION` | for CMS | Connects the site and Studio to Sanity |
| `SANITY_API_WRITE_TOKEN` | for leads | **Editor** token used *only* by `/api/enquiry` to create leads |
| `SANITY_API_READ_TOKEN` | if dataset private | **Viewer** token for server-side reads (recommended) |
| `SANITY_REVALIDATE_SECRET` | for CMS | Verifies the publish webhook |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | optional | Fallback WhatsApp number (the CMS setting wins) |
| `RESEND_API_KEY`, `ENQUIRY_NOTIFY_EMAIL`, `ENQUIRY_FROM_EMAIL` | for email | Staff notification for every enquiry (comma-separate several recipients) |
| `NEXT_PUBLIC_HIDE_SAMPLE_BANNER` | optional | Hide the preview banner (sample mode only) |

## Project structure

```
src/
  app/
    (site)/                 public website (layout = header, footer, WhatsApp button)
      page.tsx              homepage
      destinations/         listing, domestic, international, [slug]
      packages/             listing with filters, [slug] with itinerary + enquiry form
      services/             index + [service] (mumbai-sightseeing | car-rental | tourist-guide)
      about, contact, blog, faq, privacy-policy, terms
    studio/[[...tool]]/     Sanity Studio (admin)
    api/enquiry/            POST — validated, rate-limited lead capture
    api/revalidate/         POST — signed Sanity webhook → refresh cached content
    sitemap.ts, robots.ts, not-found.tsx
  components/               UI, layout, cards, forms
  data/sample.ts            SAMPLE content (used only when Sanity isn't configured)
  lib/
    content.ts              ★ all data access (Sanity or sample), cached with 'use cache'
    enquiry/                schema (zod), store (Sanity / local file), notify (email)
    seo.ts, format.ts, whatsapp.ts, rate-limit.ts, env.ts, server-env.ts
  sanity/
    schemaTypes/            content model (documents + objects)
    structure.ts            Studio navigation (enquiries by status, featured packages…)
    lib/                    clients, GROQ queries, image URL builder, next/image loader
sanity.config.ts            Studio config (singletons, hidden "create lead" etc.)
tests/unit, tests/e2e       Vitest + Playwright
scripts/                    seed + sample-art generator
```

## Architecture notes

- **Rendering and caching.** Every public page is prerendered at build time. Data loaders in
  `src/lib/content.ts` use `'use cache'` with `cacheTag("sanity")`. When an editor publishes, Sanity
  calls `/api/revalidate`, which expires the tag, so the next visit gets fresh content (no rebuild
  needed). New slugs that weren't in the last build are rendered on first request and then cached.
  `partialPrefetching` is set to `false` so that detail pages behave like classic ISR.
- **Sample vs CMS mode.** `isSanityConfigured` (a valid project ID) switches all loaders from
  `src/data/sample.ts` to GROQ queries. Both return the same TypeScript types (`src/lib/types.ts`).
- **Images.** Editors upload to Sanity. `src/sanity/lib/image-loader.ts` asks Sanity's CDN for the
  exact width and the best format (AVIF/WebP), so Vercel's image optimisation quota isn't used.
  Editor-set hotspots and crops are respected.
- **Enquiries.** Here is what happens to each submission:
  1. The form posts JSON to `/api/enquiry`.
  2. The API checks the request comes from the site itself (same origin) and is JSON.
  3. It applies a per-IP rate limit (5 per 10 minutes) and caps the request size at 10 KB.
  4. It re-validates every field with Zod.
  5. It drops spam silently: a hidden honeypot field, or a form filled in faster than 2.5 seconds.
  6. It stores the lead as a `lead.<uuid>` document in Sanity.
  7. It sends the staff notification email (all values HTML-escaped).

  If neither storage nor email is configured in production, the API returns 503 so leads are never
  silently lost.
- **Structured data.** `TravelAgency` (site-wide), `BreadcrumbList`, `TouristDestination`,
  `TouristTrip` (with itinerary; an `Offer` appears only when a real price is set), `Service`,
  `BlogPosting`, and `FAQPage` (CMS mode only). No `AggregateRating` is emitted, since that would
  need verified reviews.

## Security summary

- **Secrets:** server-only modules, with no secrets in the client bundle. `.env*` is git-ignored.
- **Admin authentication:** handled by Sanity accounts. Access is controlled by project membership
  and roles at sanity.io/manage. The Studio is `noindex` and blocked in `robots.txt`.
- **Lead privacy:** documents use dot-prefixed IDs, which Sanity never returns to unauthenticated
  requests. Making the dataset **private** is recommended as well (see DEPLOYMENT).
- **Headers:** HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`; `X-Powered-By` is removed.
- **Rate limiting:** in-memory and per instance, which is best-effort on serverless. Upgrade to
  Upstash/Vercel KV if spam becomes an issue.
- **Backups:** a weekly GitHub Action exports the dataset (`.github/workflows/sanity-backup.yml`).

## Not affiliated with the design reference

https://swastikholiday.com/ was named as visual inspiration only. No branding, code, text, images or
layouts were copied. (Neither site was reachable from the build environment; see the testing report.)
