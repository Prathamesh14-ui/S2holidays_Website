# Testing report

**Date:** 1 November 2026 · **Build:** Next.js 16.4.3, Sanity 6.21, Node 22 · **Environment:** sandboxed
Linux container with Chromium (headless)

## Summary

| Check | Result |
| --- | --- |
| TypeScript (`npm run typecheck`) | ✅ 0 errors |
| ESLint (`npm run lint`, max warnings 0) | ✅ clean |
| Unit tests (`npm test`) | ✅ 32 / 32 passed |
| Production build (`npm run build`) | ✅ 50 static pages, no warnings |
| E2E smoke tests, **sample mode**, production server | ✅ 46 / 46 passed |
| E2E smoke tests, **CMS mode** (mock Sanity API), production server | ✅ 46 / 46 passed |
| Sanity schema validation (`sanity schema validate`) | ✅ 0 errors, 0 warnings |
| Studio boots at `/studio` | ✅ bundle loads, no errors (live login not possible offline, see limitations) |
| Lighthouse (mobile, simulated throttling) | ✅ see table |

### Lighthouse

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 98 | 100 | 100 | 100 | 1.0 s | 0.027 |
| `/packages/kashmir-valley-escape` | 99 | 100 | 100 | 100 | 1.0 s | 0 |
| `/contact` | 94 | 100 | 100 | 100 | 0.8 s | 0 |
| `/destinations/kerala` | 97 | 100 | 100 | 100 | 0.8 s | 0 |
| `/blog/exploring-rajasthans-forts` | 100 | 100 | 100 | 100 | 0.8 s | 0 |

Scores were measured with lightweight SVG sample art. Real photos are served from Sanity's image CDN
at the right size in AVIF/WebP, but expect slightly higher LCP once they are in place. Re-run
Lighthouse after launch.

## What the automated tests cover

**Unit (`tests/unit`)**
- Enquiry schema: valid input, normalisation (lower-cased email, coerced numbers), and rejection of
  every invalid field. This includes a path-traversal-style `packageSlug`, an unknown `enquiryType`,
  oversized messages and the honeypot.
- Email builder: HTML-escapes all user input (XSS) and strips newlines from the subject (header
  injection).
- Price and duration formatting (Indian digit grouping, hidden prices) and WhatsApp link building.
- Rate limiter behaviour.
- Sample-content safety: **no prices, no testimonials, no contact details**, every record flagged as
  sample, unique slugs, valid references, sequential itinerary days.

**End-to-end (`tests/e2e/smoke.mjs`)**, at desktop 1440 px and mobile 390 px, for all 18 page
types. Each page is checked for:
- HTTP 200 and no console errors;
- exactly one `<h1>`, a `<title>`, a meta description and a canonical link;
- `alt` attributes on every image and a label on every form control;
- no horizontal overflow on mobile;
- valid JSON-LD.

**Plus these interactions:**
- 404 page.
- Mobile menu navigation.
- Desktop dropdown.
- Hero trip finder.
- Package filters, including the URL sync and "clear filters".
- Itinerary accordion.
- Enquiry form validation messages and `aria-invalid`.
- Package enquiry submission.
- Sitemap and robots.txt.
- Security headers.

## Manual and API checks

| Scenario | Expected | Result |
| --- | --- | --- |
| Valid enquiry (dev, no Sanity) | 200, saved to `.data/leads.ndjson` (file mode 600) | ✅ |
| Valid enquiry (CMS mode) | `lead.<uuid>` created, weak reference to the package, `status: new` | ✅ verified in the mock's mutation log |
| Production with no lead store and no email | 503 with a friendly message (never silently lose leads) | ✅ |
| Invalid fields | 422 with per-field messages | ✅ |
| Honeypot filled / submitted in < 2.5 s | 200 (silent), not stored | ✅ |
| Missing or foreign `Origin` header | 403 | ✅ |
| Malformed JSON / body > 10 KB / GET | 400 / 413 / 405 | ✅ |
| 6th request in 10 minutes from one IP | 429 + `Retry-After` | ✅ |
| Revalidate webhook with a bad signature / valid signature / `lead` type | 401 / 200 revalidated / ignored | ✅ |
| CMS mode: price set / price hidden | `₹45,999` + `Offer` JSON-LD / "Price on request" | ✅ |
| CMS mode: consented testimonial | Testimonials section appears | ✅ |
| CMS mode: images | `srcset` points at `cdn.sanity.io` with `w`, `q`, `auto=format` | ✅ |
| Lighthouse contrast audit | Gold/WhatsApp colours darkened to meet WCAG AA (≥ 4.5:1) | ✅ fixed |

## Bugs found and fixed during testing

1. `Date.now()` was used during render in the enquiry form, which isn't allowed under prerendering.
   It moved to an effect.
2. The mobile "Plan my trip" button was showing because of a CSS conflict (`hidden` vs
   `inline-flex`).
3. Desktop dropdown: with a mouse, hover opened it and the following click immediately closed it.
4. Next's image optimiser re-processed Sanity images and would fail if the CDN was unreachable. A
   Sanity CDN loader replaced it.
5. Contrast failures on gold and WhatsApp buttons, a skipped heading level on the contact page, and
   the non-descriptive "Learn more" link.
6. A deprecated `priority` image prop was replaced by `loading="eager"` with `fetchPriority="high"`.
7. Layout shift on `/packages` while the filter UI hydrates was reduced with a placeholder.

## Limitations of this test run

- **Network restrictions.** The build environment couldn't reach `s2holidays.com`,
  `swastikholiday.com`, `api.sanity.io`, `cdn.sanity.io` or any image host. As a result:
  - the existing and reference websites weren't inspected;
  - the CMS path was tested against a **local mock of the Sanity HTTP API** (`tests/mock-sanity.mjs`),
    not a real project;
  - Studio login and editing, real webhooks, Resend email delivery and the seed script still need to
    be verified once credentials exist (see the DEPLOYMENT pre-launch checklist).
- Tested in Chromium only. Safari/iOS and Firefox should be checked manually before launch.
- No screen-reader walkthrough was done (automated checks only).

## Remaining issues & required inputs

| # | Item | Needed from | Impact |
| --- | --- | --- | --- |
| 1 | Verified company details: phone, WhatsApp, email, address, hours, social links, legal name | S2 Holidays | Placeholders are shown; WhatsApp buttons are hidden until a number is set |
| 2 | Real packages, itineraries, prices, inclusions and destinations | S2 Holidays | Sample content is currently shown |
| 3 | Licensed photography and a logo | S2 Holidays | Generated "SAMPLE IMAGE" illustrations and a text wordmark |
| 4 | Company story / About text and "Our approach" wording | S2 Holidays | Placeholder text |
| 5 | Privacy policy and terms reviewed by a legal adviser | S2 Holidays | Sample templates marked "requires legal review" |
| 6 | Genuine customer testimonials with consent | S2 Holidays | Section hidden until added |
| 7 | Sanity project, tokens, webhook; Resend account and domain verification | Owner/developer | Leads can't be stored or emailed in production until set |
| 8 | Access to the existing site and its URL list | Network allow-list / client | Needed for content migration and redirects |
| 9 | Approval before any DNS or domain change | Client | Launch is blocked until given |
| 10 | Optional: shared rate-limit store or Turnstile CAPTCHA | Developer | Current limiter is per instance (best effort) |
| 11 | Optional: analytics and cookie-consent requirements | Client | None installed, so no cookie banner is needed yet |

Unverified third-party directory listings mention a Kandivali (Mumbai) office, the trading name
"Shree Shakti Tours and Travels" and a phone number. **None of these were used on the site**; they
are recorded here only so S2 Holidays can confirm or correct them.
