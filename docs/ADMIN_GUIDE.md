# S2 Holidays — Admin guide

This guide is for S2 Holidays staff who update the website and handle enquiries. You don't need any
technical knowledge.

## Signing in

1. Go to **https://www.s2holidays.com/studio** (or the preview URL you were given).
2. Sign in with the Google account, GitHub account or email you were invited with.
3. If you see "You don't have access", ask the website owner to invite you
   (sanity.io/manage → project → **Members**).

**Roles:**
- **Administrator:** everything, including inviting people.
- **Editor:** create, edit and publish content, and manage enquiries.
- **Viewer:** read only.

Give staff the lowest role they need.

## How editing works

- Changes are saved automatically as a **draft**. Visitors don't see them until you click
  **Publish** (bottom right).
- After publishing, the live website updates on the **next page visit**, usually within a few
  seconds.
- **History** (clock icon, top right of a document) lets you see and restore older versions.
- Required fields are marked. You can't publish until any red errors are fixed.

## The menu (left-hand side)

| Section | What it's for |
| --- | --- |
| **Enquiries** | Leads from the website, grouped by status |
| **Holiday packages** | All / Featured on homepage / Domestic / International |
| **Destinations** | Domestic and international destination pages |
| **Service pages** | Mumbai sightseeing, Car rental, Tourist guide |
| **Blog posts**, **Testimonials**, **FAQs**, **Policy pages** | As named |
| **Site settings** | Company details, phone, WhatsApp, email, address, homepage hero, About page |

## First-time setup (do this before launch)

1. **Site settings → Company & contact.** Enter the verified phone number, WhatsApp number (digits
   only, with country code, e.g. `919800000000`), email, office address, office hours and social
   links. These appear in the header, footer and contact page and power every WhatsApp button.
2. **Site settings → Homepage hero.** Add the heading, sub-heading and a high-quality landscape photo
   (at least 2400 px wide).
3. **Site settings → About page.** Add the company story and the three "Our approach" points.
4. **Policy pages.** Create **Privacy Policy** (page: `privacy-policy`) and **Terms & Conditions**
   (page: `terms`) using text approved by your legal adviser.
5. Create the three **Service pages** (one each for Mumbai sightseeing, Car rental, Tourist guide).
6. Add your **Destinations**, then your **Holiday packages**.
7. Delete or replace every item whose text says "Sample".

## Holiday packages

**Add a package:** Holiday packages → All packages → **+** (top) → fill in the tabs.

| Tab | Fields |
| --- | --- |
| **Overview** | Name, URL slug (click *Generate*), destinations (one or more), region, holiday types, nights/days, starting city, short summary, highlights |
| **Price** | Starting price, currency, basis (e.g. "per person on twin sharing"). **Leave the amount empty to show "Price on request".** Untick *Show price on website* to hide a price temporarily. |
| **Itinerary** | Click **Add item** for each day: day number, title, description, meals, overnight stay. Drag the handle to reorder days. |
| **Inclusions** | Inclusions, exclusions and important notes / terms |
| **Images** | Main image (required) and gallery. Always fill in *Alternative text*, a short description of the photo. |
| **Homepage** | Tick **Feature on homepage** and set **Homepage position** (1 = first) |
| **SEO** | Optional custom Google title and description |

- **Change a price:** open the package → **Price** tab → change the amount → **Publish**.
- **Remove a package:** open it → **⋯** menu (next to Publish) → **Unpublish** (keeps it as a
  draft) or **Delete**.
- **Featured packages:** *Holiday packages → Featured on homepage* lists what's currently featured.
  The homepage shows up to 6, ordered by *Homepage position*. If none are featured, the first six
  packages are shown.

## Offers and discounts

Every holiday package has an **Offer** tab. Offers appear on the website automatically and **disappear by
themselves after their end date** (within about an hour).

**Add an offer to a package**
1. Holiday packages → open the package → **Offer** tab.
2. Fill in:
   - **Offer is on**: leave ticked (untick later to hide the offer without deleting it).
   - **Offer name**: e.g. "Diwali Special" (required).
   - **Offer price**: the discounted price. If the normal price is set on the **Price** tab, the website
     shows it crossed out (~~₹45,999~~ **₹39,999**) and works out "Save 13%" automatically.
   - **Badge text** (optional): short label on the photo, e.g. "Free airport pickup". Leave empty to show
     "Save X%".
   - **Offer details**: conditions, e.g. "Book before 15 Nov. Minimum 2 adults."
   - **Valid until**: the last day of the offer.
   - **Show in "Special offers" on the homepage**: ticked by default.
3. Click **Publish**.

**Where offers appear:** a red badge on the package photo, the offer price on package cards, an offer box on
the package page, the **Special offers** section on the homepage (only while at least one offer is live),
and the **Offers** filter on the Packages page (`/packages?offer=1`).

**Announcement bar (festival sales):** Site settings → **Announcement bar** tab → tick **Show the bar**,
write the text (e.g. "🪔 Diwali sale: up to 15% off — book by 15 Nov"), add a link such as
`/packages?offer=1` (opens all offers), set **Show until**, and click **Publish**. It shows at the very top of
every page and hides itself after the date.

**Remove an offer:** untick **Offer is on** (keeps it for next year) or clear the fields, then **Publish**.

## Trip planner ("Plan my trip")

Customers build their own trip at **/plan-my-trip**: they choose a destination, dates and travellers, add places
with nights, tick sightseeing, pick hotel category, meals and vehicle, and get a **day-wise plan with dates**.
They can **send it** (it arrives in **Enquiries** with the full plan, type "trip-planner"), share it on WhatsApp,
or print / save it as PDF.

**Edit it in Studio → Trip planner** (one document per destination):
- **Basics:** name, arrival and departure points, link to the destination page, "Show in the trip planner".
- **Places & sightseeing:** add/remove places (click **Generate** for the key), suggested nights, sightseeing list.
  Add "(en route)" to a sightseeing name to show it on the travel day. Optional extra cost per person.
- **Rates:** hotel rate **per room per night** for Standard / Deluxe / Premium (on each place), vehicle rate per day,
  meal plan rate per person per night (0 = included), peak-season % supplements with dates, GST %, advance %.
- **Show calculated prices to customers:** tick this ONLY when every rate is correct. Until then — or if any
  rate needed for a customer's choice is missing — the planner shows the **rough estimate** below instead.
- **Rough estimate** (Rates tab): until real rates are confirmed, the planner shows an estimated price per person
  worked out from your approved package prices (Standard hotel, twin sharing): *base price + price per night × nights*.
  Children 5–11 pay the "child %" of the adult price; under-5s are free. The customer sees a "Rough estimate" label.
  You can change the two numbers, or untick **Show the estimate** to show "Get your free quote" instead.
  Once you tick "Show calculated prices to customers" and all rates are filled in, the real calculation replaces the estimate automatically.

Prices shown by the planner are estimates; the team confirms hotel names, availability and the final price.

## Homepage layout (section order)

**Site settings → Homepage → Homepage sections (order)** controls the order of the sections under the big
photo: Featured packages, Special offers, India destinations, International destinations, Mumbai services,
How we plan, Testimonials and Travel journal.

1. Click **Add item** and choose a section; repeat for each section you want.
2. **Drag** the ⋮⋮ handle to change the order (e.g. put **Special offers** first during a sale).
3. A section that is **not in the list is hidden**. An **empty list** shows all sections in the standard order.
4. Click **Publish**.

The big photo at the top, the five service tiles and the enquiry banner at the bottom always stay in place.
"Special offers" and "Testimonials" only appear when there is at least one live offer / approved testimonial.

## Homepage slideshow

The big photo at the top of the homepage is a slideshow that fades to a new, randomly chosen photo every
few seconds.

- **Site settings → Homepage hero → Hero slideshow photos:** click **Add item**, upload a photo, add the
  alternative text, and optionally a short **Caption** (e.g. "Kerala backwaters") and a **Link to
  destination**. Add 2–6 photos and click **Publish**.
- Use wide landscape photos (at least 2400 px wide) **without text printed on them**: the heading sits on top.
- If no slideshow photos are added, the main photos of your destinations are used automatically.
- Visitors can pause it with the ⏸ button. Visitors who have "reduce motion" switched on see a still photo.

## Images: tips

- Use your own photos or properly licensed stock. Don't copy images from other websites.
- Upload large landscape images (2000–3000 px wide, JPG). The website resizes them automatically.
- Click the **crop/hotspot** button on an image to mark the important area. Mobile crops will keep it
  in view.

## Testimonials

Only add **genuine reviews from real customers**. Tick **Customer consent confirmed** only if the
customer agreed to publication. Unticked testimonials are never shown. The homepage testimonial
section appears automatically once at least one consented testimonial exists.

## Blog posts

Add a title, slug, publish date, cover image (with alt text), excerpt and the article text. You can
use headings, lists, quotes and links. A post with a future publish date stays hidden until that date.
It then appears within a few hours, or straight away the next time anything is published.

## Managing enquiries (leads)

Every website enquiry appears under **Enquiries → New**. You will also get an email if email
notifications are set up.

1. Open the enquiry. The **Submitted details** tab shows what the customer sent; it can't be edited.
2. On the **Manage** tab:
   - Set **Status**: New → Contacted → Quote sent → Follow-up → Booked / Not proceeding (or Spam).
   - **Assigned to:** the person handling it.
   - **Follow-up date:** when to contact the customer next.
   - **Internal notes:** add a dated note for each call or quote.
3. Click **Publish** to save the changes.

The **Enquiries** menu groups leads by status, so *New* works as your inbox and *Follow-up* as your
to-do list.

> Enquiries contain customers' personal data. Don't export or share them outside the team, and delete
> old enquiries in line with your privacy policy.

## WhatsApp

The floating WhatsApp button, the "WhatsApp us" buttons on forms and the WhatsApp card on the
contact page all use the **WhatsApp number** in Site settings. Package pages pre-fill the message
with the package name.

## Getting help

If something looks wrong on the website after publishing, wait 30 seconds and refresh. If it still
looks wrong, contact your developer with the page link and a screenshot.
