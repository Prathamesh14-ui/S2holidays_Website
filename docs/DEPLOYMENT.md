# Deployment guide

> ⚠️ **Do not point the s2holidays.com domain at the new site, or change any DNS records, until the
> client has approved the launch in writing.** Everything below up to step 6 can be done on a
> `*.vercel.app` preview URL without touching the live website.

## 1. Create the Sanity project (CMS)

1. Sign in at https://www.sanity.io/manage using an account **owned by S2 Holidays** (not a
   developer's personal account).
2. **Create project** → name "S2 Holidays" → dataset `production`.
3. **Make the dataset private:** Project → **Datasets** → `production` → set visibility to
   **Private**. Leads are already protected by their ID prefix; a private dataset adds a second layer.
4. **API → Tokens**, then create:
   - `website-write`: **Editor**. Becomes `SANITY_API_WRITE_TOKEN` (used only to save enquiries).
   - `website-read`: **Viewer**. Becomes `SANITY_API_READ_TOKEN` (required because the dataset is
     private).
   - `backup`: **Viewer**. Becomes the `SANITY_AUTH_TOKEN` GitHub secret (backups).
5. **API → CORS origins**: add `http://localhost:3000`, your `https://<project>.vercel.app` URL and
   later `https://www.s2holidays.com`, each with **Allow credentials** ticked (needed by the Studio).
6. **Members**: invite staff with the lowest role they need (Editor for content and lead managers).
7. Note the **Project ID**.

## 2. Email notifications (Resend)

1. Create an account at https://resend.com.
2. **Domains → Add domain** `s2holidays.com`. Resend shows SPF/DKIM DNS records. *Adding these
   records is a DNS change, so get the client's approval first.* They don't affect the existing
   website.
3. Create an API key. Set these variables:
   - `RESEND_API_KEY`
   - `ENQUIRY_FROM_EMAIL`, e.g. `S2 Holidays Website <enquiries@s2holidays.com>`
   - `ENQUIRY_NOTIFY_EMAIL`: the staff inbox(es), comma-separated

## 3. Deploy to Vercel

1. Push this repository to a **private** GitHub repository owned by S2 Holidays.
2. At https://vercel.com, **Add New → Project** → import the repository. The framework is detected as
   Next.js and the defaults are fine.
3. Add the **Environment Variables** (Production and Preview):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://www.s2holidays.com` (or the vercel.app URL before launch) |
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | from step 1 |
   | `NEXT_PUBLIC_SANITY_DATASET` | `production` |
   | `NEXT_PUBLIC_SANITY_API_VERSION` | `2025-10-01` |
   | `SANITY_API_WRITE_TOKEN` | `website-write` token |
   | `SANITY_API_READ_TOKEN` | `website-read` token |
   | `SANITY_REVALIDATE_SECRET` | a long random string, e.g. the output of `openssl rand -hex 32` |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | optional fallback; prefer the Site settings field |
   | `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL`, `ENQUIRY_NOTIFY_EMAIL` | from step 2 |

4. **Deploy.** Vercel preview deployments automatically get `robots: Disallow /`, so previews are not
   indexed.

## 4. Connect publishing to the website (webhook)

sanity.io/manage → project → **API → Webhooks → Create webhook**:

| Setting | Value |
| --- | --- |
| Name | `Revalidate website` |
| URL | `https://<your-domain>/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type != "lead"` |
| Projection | `{_type}` |
| HTTP method | `POST` |
| Secret | the same value as `SANITY_REVALIDATE_SECRET` |

Test it: publish a small change, then reload the page. The change should appear within seconds.

## 5. Load content

- Option A (recommended): enter real content directly in `/studio`, following
  [ADMIN_GUIDE.md](ADMIN_GUIDE.md) → *First-time setup*.
- Option B: start from the sample content so editors can see a worked example of every content
  type. Run this locally with the write token, then replace everything labelled "Sample":

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxx SANITY_API_WRITE_TOKEN=xxxx npm run seed:sample -- --confirm
```

Once the CMS is connected, the "Preview build" banner disappears automatically.

## 6. Pre-launch checklist

- [ ] Every "Sample" item replaced or deleted (search the Studio for "Sample").
- [ ] Site settings: phone, WhatsApp, email, address and hours verified by S2 Holidays.
- [ ] Privacy policy and terms approved by S2 Holidays' legal adviser.
- [ ] Real, licensed photos uploaded, with alt text.
- [ ] A test enquiry arrives in the Studio **and** by email.
- [ ] WhatsApp button opens a chat with the right number.
- [ ] `https://<preview>/sitemap.xml` and `/robots.txt` look correct.
- [ ] Redirects: map important old s2holidays.com URLs to new ones (see below).
- [ ] Client sign-off received.

### Redirects from the old site

The existing site's URLs couldn't be crawled from the build environment. Before launch, list the old
URLs (e.g. from Google Search Console → Pages) and add permanent redirects in `next.config.ts`:

```ts
async redirects() {
  return [{ source: "/old-kerala-page", destination: "/destinations/kerala", permanent: true }];
}
```

## 7. Go live (only after written approval)

1. Vercel → Project → **Settings → Domains** → add `www.s2holidays.com` and `s2holidays.com`
   (redirecting to www).
2. Vercel shows the DNS records to set at the domain registrar. **Before changing them, record the
   existing DNS values** so you can roll back, and check that email (MX) records are kept unchanged.
3. After DNS propagates, add `https://www.s2holidays.com` to Sanity CORS origins and update the
   webhook URL.
4. Set `NEXT_PUBLIC_SITE_URL=https://www.s2holidays.com` and redeploy.
5. Submit `https://www.s2holidays.com/sitemap.xml` in Google Search Console.

**Rollback:** restore the recorded DNS values. The old hosting is untouched by this project.

## 8. Backups

- `.github/workflows/sanity-backup.yml` exports the whole dataset (content, enquiries and images)
  every Sunday and keeps it as a private workflow artifact for 90 days. Add the repository secrets
  `SANITY_AUTH_TOKEN` (Viewer token) and `NEXT_PUBLIC_SANITY_PROJECT_ID`, then use **Run workflow**
  once to test it.
- For long-term retention, download a backup monthly and store it in S2 Holidays' own secure storage.
- **Restore:** `npx sanity dataset import backup-YYYY-MM-DD.tar.gz production --replace` (test on a
  separate dataset first).
- Sanity also keeps document history, which editors can restore from the Studio.

## 9. Optional hardening

- **Shared rate limiting:** the built-in limiter is per server instance. If spam becomes an issue,
  add Upstash Redis / Vercel KV and swap `src/lib/rate-limit.ts`, or add Cloudflare Turnstile to the
  form.
- **Monitoring:** enable Vercel Analytics / Speed Insights, and add an uptime monitor for `/` and
  `/api/enquiry` (expects 405 on GET).
- **Access reviews:** check Sanity members and tokens every quarter, and rotate tokens if staff leave.
