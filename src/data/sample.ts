/**
 * SAMPLE CONTENT — used only when no Sanity project is configured.
 *
 * Everything here is placeholder material for layout and testing. It is NOT
 * verified S2 Holidays information. No prices, reviews or company facts are
 * invented: prices are left empty ("Price on request"), testimonials are empty,
 * and company contact details are explicit placeholders.
 * Replace it all through the CMS (see README > Content).
 */
import type {
  Destination,
  Faq,
  HolidayPackage,
  LegalPage,
  Post,
  RichText,
  Service,
  SiteImage,
  SiteSettings,
  Testimonial,
} from "@/lib/types";

const img = (name: string, alt: string): SiteImage => ({
  kind: "local",
  src: `/sample/${name}.svg`,
  alt: `${alt} (sample illustration)`,
  isSample: true,
});

let key = 0;
/** Minimal Portable Text builder for sample copy. */
export function pt(...paragraphs: (string | { h2: string })[]): RichText {
  return paragraphs.map((p) => {
    const k = `s${++key}`;
    const isHeading = typeof p !== "string";
    return {
      _type: "block",
      _key: k,
      style: isHeading ? "h2" : "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `${k}c`, text: isHeading ? p.h2 : p, marks: [] }],
    };
  });
}

export const sampleSettings: SiteSettings = {
  companyName: "S2 Holidays",
  tagline: "Holidays across India and around the world",
  description:
    "S2 Holidays plans domestic and international holidays, Mumbai sightseeing, car rentals and tourist guide services. (Sample description — replace with verified copy.)",
  phone: undefined,
  whatsapp: undefined,
  email: undefined,
  address: undefined,
  officeHours: undefined,
  socials: [],
  heroHeading: "Journeys crafted around you",
  heroSubheading:
    "Domestic and international holidays, Mumbai sightseeing, car rentals and local guides — planned with care from enquiry to return.",
  heroImage: img("hero", "Mountain range at dusk"),
  aboutTitle: "About S2 Holidays",
  aboutBody: pt(
    "This section is placeholder text. Replace it in the CMS (Site settings → About) with S2 Holidays' verified story: when the company was founded, who leads it, where the office is and what makes its service distinctive.",
    "Until verified information is supplied, no years in business, traveller counts, awards or affiliations are shown anywhere on this website."
  ),
  aboutImage: img("about", "Backwaters at sunrise"),
  values: [
    { title: "Personal planning", description: "Itineraries shaped around each traveller's dates, budget and interests. (Sample — confirm wording.)" },
    { title: "Clear communication", description: "Inclusions, exclusions and terms set out before you book. (Sample — confirm wording.)" },
    { title: "Support while travelling", description: "A point of contact for questions during the trip. (Sample — confirm wording.)" },
  ],
  isSample: true,
};

const d = (x: Omit<Destination, "isSample">): Destination => ({ ...x, isSample: true });

export const sampleDestinations: Destination[] = [
  d({
    _id: "dest-kashmir", name: "Kashmir", slug: "kashmir", region: "domestic", state: "Jammu & Kashmir", country: "India",
    tagline: "Lakes, meadows and Himalayan views",
    summary: "Houseboats on Dal Lake, the meadows of Gulmarg and Pahalgam, and Mughal gardens in Srinagar.",
    overview: pt("Kashmir is known for Dal Lake's houseboats and shikaras, the Mughal gardens of Srinagar, and mountain meadows such as Gulmarg, Pahalgam and Sonamarg.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("kashmir", "Snow peaks above a valley"),
    bestTimeToVisit: "April to October for meadows; December to February for snow",
    highlights: ["Dal Lake shikara ride", "Gulmarg", "Pahalgam", "Sonamarg", "Mughal gardens"],
    featured: true,
  }),
  d({
    _id: "dest-kerala", name: "Kerala", slug: "kerala", region: "domestic", state: "Kerala", country: "India",
    tagline: "Backwaters, hills and coastline",
    summary: "Houseboat stays in Alleppey, tea gardens in Munnar and the beaches of Kovalam and Varkala.",
    overview: pt("Kerala combines the backwaters around Alleppey and Kumarakom, the tea estates of Munnar, wildlife at Thekkady and a long Arabian Sea coastline.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("kerala", "Palm-lined backwaters with a houseboat"),
    bestTimeToVisit: "September to March",
    highlights: ["Alleppey houseboat", "Munnar tea estates", "Thekkady", "Kochi heritage"],
    featured: true,
  }),
  d({
    _id: "dest-rajasthan", name: "Rajasthan", slug: "rajasthan", region: "domestic", state: "Rajasthan", country: "India",
    tagline: "Forts, palaces and desert landscapes",
    summary: "Jaipur, Udaipur, Jodhpur and Jaisalmer — royal heritage and the Thar desert.",
    overview: pt("Rajasthan's circuit typically includes Jaipur's forts, Udaipur's lakes, Jodhpur's Mehrangarh Fort and the dunes around Jaisalmer.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("rajasthan", "Desert fort above sand dunes"),
    bestTimeToVisit: "October to March",
    highlights: ["Amber Fort", "Lake Pichola", "Mehrangarh Fort", "Jaisalmer dunes"],
    featured: true,
  }),
  d({
    _id: "dest-goa", name: "Goa", slug: "goa", region: "domestic", state: "Goa", country: "India",
    tagline: "Beaches, churches and coastal food",
    summary: "North Goa's lively beaches, quieter South Goa, and the heritage of Old Goa.",
    overview: pt("Goa offers beaches from Calangute and Baga in the north to Palolem in the south, along with Portuguese-era churches in Old Goa.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("goa", "Sunset over a beach with palms"),
    bestTimeToVisit: "November to February",
    highlights: ["North Goa beaches", "Old Goa churches", "South Goa", "Fontainhas"],
  }),
  d({
    _id: "dest-himachal", name: "Himachal Pradesh", slug: "himachal-pradesh", region: "domestic", state: "Himachal Pradesh", country: "India",
    tagline: "Hill stations and mountain passes",
    summary: "Shimla, Manali, Dharamshala and the Kullu valley.",
    overview: pt("Himachal Pradesh includes hill stations such as Shimla and Manali, the Kullu valley and Dharamshala–McLeod Ganj.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("himachal", "Layered hills at sunrise"),
    bestTimeToVisit: "March to June; December to February for snow",
    highlights: ["Shimla", "Manali", "Solang Valley", "Dharamshala"],
  }),
  d({
    _id: "dest-andaman", name: "Andaman Islands", slug: "andaman", region: "domestic", state: "Andaman & Nicobar Islands", country: "India",
    tagline: "Clear water and island beaches",
    summary: "Port Blair, Havelock (Swaraj Dweep) and Neil Island (Shaheed Dweep).",
    overview: pt("The Andaman Islands are known for beaches such as Radhanagar, snorkelling and diving, and the Cellular Jail in Port Blair.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("andaman", "Turquoise sea and palms"),
    bestTimeToVisit: "October to May",
    highlights: ["Radhanagar Beach", "Cellular Jail", "Neil Island", "Snorkelling"],
  }),
  d({
    _id: "dest-dubai", name: "Dubai", slug: "dubai", region: "international", country: "United Arab Emirates",
    tagline: "Skyline, desert and shopping",
    summary: "Burj Khalifa, desert safaris, Dubai Marina and day trips to Abu Dhabi.",
    overview: pt("Dubai combines landmark architecture such as the Burj Khalifa with desert safaris, Dubai Creek and large shopping destinations.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("dubai", "City skyline at golden hour"),
    bestTimeToVisit: "November to March",
    highlights: ["Burj Khalifa", "Desert safari", "Dubai Marina", "Abu Dhabi day trip"],
    featured: true,
  }),
  d({
    _id: "dest-thailand", name: "Thailand", slug: "thailand", region: "international", country: "Thailand",
    tagline: "Temples, islands and street food",
    summary: "Bangkok, Pattaya, Phuket and Krabi.",
    overview: pt("Popular Thailand itineraries combine Bangkok's temples and markets with beach time in Pattaya, Phuket or Krabi.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("thailand", "Temple silhouette at sunset"),
    bestTimeToVisit: "November to April",
    highlights: ["Bangkok temples", "Phi Phi Islands", "Pattaya", "Floating markets"],
    featured: true,
  }),
  d({
    _id: "dest-singapore", name: "Singapore", slug: "singapore", region: "international", country: "Singapore",
    tagline: "Gardens, attractions and a modern skyline",
    summary: "Gardens by the Bay, Sentosa, Marina Bay and Universal Studios.",
    overview: pt("Singapore suits families and first-time international travellers, with Sentosa, Gardens by the Bay and Marina Bay close together.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("singapore", "City skyline across the bay at dusk"),
    bestTimeToVisit: "Year-round; February to April is typically drier",
    highlights: ["Gardens by the Bay", "Sentosa", "Night Safari", "Marina Bay"],
  }),
  d({
    _id: "dest-bali", name: "Bali", slug: "bali", region: "international", country: "Indonesia",
    tagline: "Temples, rice terraces and beaches",
    summary: "Ubud, Seminyak, Nusa Penida and clifftop temples.",
    overview: pt("Bali offers Ubud's rice terraces and culture, beach areas such as Seminyak and Nusa Dua, and temples like Tanah Lot and Uluwatu.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("bali", "Temple by a lagoon"),
    bestTimeToVisit: "April to October",
    highlights: ["Ubud", "Tanah Lot", "Nusa Penida", "Uluwatu"],
  }),
  d({
    _id: "dest-maldives", name: "Maldives", slug: "maldives", region: "international", country: "Maldives",
    tagline: "Island resorts and lagoons",
    summary: "Overwater villas, reef snorkelling and private-island resorts.",
    overview: pt("The Maldives is known for one-island resorts, overwater villas and reef snorkelling, typically reached by speedboat or seaplane from Malé.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("maldives", "Lagoon and beach"),
    bestTimeToVisit: "November to April",
    highlights: ["Overwater villas", "Snorkelling", "Sandbank picnics"],
  }),
  d({
    _id: "dest-switzerland", name: "Switzerland", slug: "switzerland", region: "international", country: "Switzerland",
    tagline: "Alpine lakes and scenic railways",
    summary: "Lucerne, Interlaken, Zermatt and mountain excursions.",
    overview: pt("Switzerland itineraries commonly include Lucerne, Interlaken and mountain excursions, connected by scenic railways.", "Sample overview — replace with S2 Holidays' own destination copy."),
    heroImage: img("switzerland", "Alpine peaks above a valley"),
    bestTimeToVisit: "May to September; December to March for snow",
    highlights: ["Lucerne", "Interlaken", "Scenic trains", "Alpine excursions"],
  }),
];

const ref = (slug: string) => {
  const x = sampleDestinations.find((y) => y.slug === slug)!;
  return { _id: x._id, name: x.name, slug: x.slug, region: x.region };
};

const SAMPLE_NOTE =
  "SAMPLE PACKAGE — the itinerary, inclusions and duration are placeholders for layout and testing. They are not an S2 Holidays offer.";

const p = (x: Omit<HolidayPackage, "isSample" | "priceNote"> & { priceNote?: string }): HolidayPackage => ({
  priceNote: "Price on request — share your dates for a quote.",
  importantNotes: pt(SAMPLE_NOTE),
  ...x,
  isSample: true,
});

export const samplePackages: HolidayPackage[] = [
  p({
    _id: "pkg-kashmir", title: "Kashmir Valley Escape", slug: "kashmir-valley-escape", region: "domestic",
    destinations: [ref("kashmir")], themes: ["Family", "Honeymoon", "Nature"],
    durationNights: 5, durationDays: 6, startingCity: "Srinagar",
    summary: "Srinagar's lakes and gardens with day trips to Gulmarg, Pahalgam and Sonamarg.",
    heroImage: img("kashmir", "Snow peaks above a valley"),
    highlights: ["Houseboat night on Dal Lake", "Gulmarg day trip", "Pahalgam valleys", "Mughal gardens"],
    itinerary: [
      { day: 1, title: "Arrive in Srinagar", description: "Arrival transfer, check in and an evening shikara ride on Dal Lake.", meals: ["Dinner"], overnight: "Srinagar (houseboat)" },
      { day: 2, title: "Gulmarg excursion", description: "Day trip to Gulmarg; optional gondola ride at own cost.", meals: ["Breakfast", "Dinner"], overnight: "Srinagar" },
      { day: 3, title: "Srinagar to Pahalgam", description: "Drive to Pahalgam via saffron fields and Avantipura ruins.", meals: ["Breakfast", "Dinner"], overnight: "Pahalgam" },
      { day: 4, title: "Pahalgam sightseeing", description: "Explore the valleys around Pahalgam at leisure.", meals: ["Breakfast", "Dinner"], overnight: "Pahalgam" },
      { day: 5, title: "Sonamarg excursion", description: "Return towards Srinagar with a day trip to Sonamarg.", meals: ["Breakfast", "Dinner"], overnight: "Srinagar" },
      { day: 6, title: "Departure", description: "Visit Mughal gardens if time permits, then airport transfer.", meals: ["Breakfast"] },
    ],
    inclusions: ["Sample: accommodation", "Sample: breakfast and dinner", "Sample: private transfers and sightseeing"],
    exclusions: ["Sample: flights", "Sample: entry tickets and activities", "Sample: personal expenses"],
    featuredOnHomepage: true, homepageOrder: 1,
  }),
  p({
    _id: "pkg-kerala", title: "Kerala Backwaters & Hills", slug: "kerala-backwaters-and-hills", region: "domestic",
    destinations: [ref("kerala")], themes: ["Family", "Honeymoon", "Nature"],
    durationNights: 5, durationDays: 6, startingCity: "Kochi",
    summary: "Munnar's tea country, Thekkady's forests and a night on an Alleppey houseboat.",
    heroImage: img("kerala", "Palm-lined backwaters with a houseboat"),
    highlights: ["Munnar tea gardens", "Thekkady spice plantations", "Alleppey houseboat", "Fort Kochi"],
    itinerary: [
      { day: 1, title: "Kochi to Munnar", description: "Scenic drive to Munnar with waterfall stops.", overnight: "Munnar" },
      { day: 2, title: "Munnar sightseeing", description: "Tea estates, Mattupetty Dam and Echo Point.", overnight: "Munnar" },
      { day: 3, title: "Munnar to Thekkady", description: "Drive to Thekkady; spice plantation visit.", overnight: "Thekkady" },
      { day: 4, title: "Thekkady to Alleppey", description: "Board a houseboat and cruise the backwaters.", overnight: "Houseboat" },
      { day: 5, title: "Alleppey to Kochi", description: "Fort Kochi, Chinese fishing nets and Jew Town.", overnight: "Kochi" },
      { day: 6, title: "Departure", description: "Transfer to Kochi airport or railway station." },
    ],
    inclusions: ["Sample: accommodation", "Sample: daily breakfast", "Sample: private vehicle"],
    exclusions: ["Sample: flights or trains", "Sample: entry fees", "Sample: personal expenses"],
    featuredOnHomepage: true, homepageOrder: 2,
  }),
  p({
    _id: "pkg-rajasthan", title: "Royal Rajasthan Circuit", slug: "royal-rajasthan-circuit", region: "domestic",
    destinations: [ref("rajasthan")], themes: ["Heritage", "Family"],
    durationNights: 7, durationDays: 8, startingCity: "Jaipur",
    summary: "Jaipur, Jodhpur, Jaisalmer and Udaipur — forts, palaces and a desert evening.",
    heroImage: img("rajasthan", "Desert fort above sand dunes"),
    highlights: ["Amber Fort", "Mehrangarh Fort", "Jaisalmer dunes", "Lake Pichola"],
    itinerary: [
      { day: 1, title: "Arrive in Jaipur", description: "Check in; evening at leisure.", overnight: "Jaipur" },
      { day: 2, title: "Jaipur sightseeing", description: "Amber Fort, City Palace, Hawa Mahal and Jantar Mantar.", overnight: "Jaipur" },
      { day: 3, title: "Jaipur to Jodhpur", description: "Drive to Jodhpur.", overnight: "Jodhpur" },
      { day: 4, title: "Jodhpur to Jaisalmer", description: "Mehrangarh Fort, then drive to Jaisalmer.", overnight: "Jaisalmer" },
      { day: 5, title: "Jaisalmer and the dunes", description: "Jaisalmer Fort and havelis; evening at the dunes.", overnight: "Jaisalmer (camp)" },
      { day: 6, title: "Jaisalmer to Udaipur", description: "Long drive to Udaipur.", overnight: "Udaipur" },
      { day: 7, title: "Udaipur sightseeing", description: "City Palace and a boat ride on Lake Pichola.", overnight: "Udaipur" },
      { day: 8, title: "Departure", description: "Transfer to Udaipur airport." },
    ],
    inclusions: ["Sample: accommodation", "Sample: breakfast", "Sample: private vehicle"],
    exclusions: ["Sample: flights", "Sample: monument fees", "Sample: personal expenses"],
    featuredOnHomepage: true, homepageOrder: 3,
  }),
  p({
    _id: "pkg-goa", title: "Goa Beach Break", slug: "goa-beach-break", region: "domestic",
    destinations: [ref("goa")], themes: ["Beach", "Friends", "Honeymoon"],
    durationNights: 3, durationDays: 4, startingCity: "Goa",
    summary: "A short beach holiday with North and South Goa sightseeing.",
    heroImage: img("goa", "Sunset over a beach with palms"),
    highlights: ["North Goa beaches", "Old Goa churches", "South Goa", "Free time"],
    itinerary: [
      { day: 1, title: "Arrive in Goa", description: "Transfer to hotel; evening on the beach.", overnight: "Goa" },
      { day: 2, title: "North Goa", description: "Fort Aguada, Calangute, Baga and Anjuna.", overnight: "Goa" },
      { day: 3, title: "South Goa & Old Goa", description: "Basilica of Bom Jesus, Miramar and Colva.", overnight: "Goa" },
      { day: 4, title: "Departure", description: "Transfer to airport or station." },
    ],
    inclusions: ["Sample: accommodation", "Sample: breakfast", "Sample: sightseeing"],
    exclusions: ["Sample: travel to Goa", "Sample: water sports", "Sample: personal expenses"],
  }),
  p({
    _id: "pkg-dubai", title: "Dubai City & Desert", slug: "dubai-city-and-desert", region: "international",
    destinations: [ref("dubai")], themes: ["Family", "Shopping", "Friends"],
    durationNights: 4, durationDays: 5, startingCity: "Dubai",
    summary: "Dubai's landmarks, a desert safari and a day in Abu Dhabi.",
    heroImage: img("dubai", "City skyline at golden hour"),
    highlights: ["Burj Khalifa", "Desert safari", "Dhow cruise", "Abu Dhabi tour"],
    itinerary: [
      { day: 1, title: "Arrive in Dubai", description: "Airport transfer; evening dhow cruise.", overnight: "Dubai" },
      { day: 2, title: "City tour & Burj Khalifa", description: "Half-day city tour; Burj Khalifa visit.", overnight: "Dubai" },
      { day: 3, title: "Desert safari", description: "Morning free; afternoon desert safari.", overnight: "Dubai" },
      { day: 4, title: "Abu Dhabi", description: "Full-day Abu Dhabi city tour.", overnight: "Dubai" },
      { day: 5, title: "Departure", description: "Airport transfer." },
    ],
    inclusions: ["Sample: hotel stay", "Sample: breakfast", "Sample: listed tours", "Sample: visa assistance"],
    exclusions: ["Sample: flights", "Sample: tourism dirham fee", "Sample: personal expenses"],
    featuredOnHomepage: true, homepageOrder: 4,
  }),
  p({
    _id: "pkg-thailand", title: "Bangkok & Phuket", slug: "bangkok-and-phuket", region: "international",
    destinations: [ref("thailand")], themes: ["Beach", "Honeymoon", "Friends"],
    durationNights: 6, durationDays: 7, startingCity: "Bangkok",
    summary: "City temples and markets followed by island time in Phuket.",
    heroImage: img("thailand", "Temple silhouette at sunset"),
    highlights: ["Bangkok temples", "Phi Phi Islands tour", "Phuket beaches", "Night markets"],
    itinerary: [
      { day: 1, title: "Arrive in Bangkok", description: "Airport transfer; evening free.", overnight: "Bangkok" },
      { day: 2, title: "Bangkok city tour", description: "Temple and city tour.", overnight: "Bangkok" },
      { day: 3, title: "Bangkok at leisure", description: "Optional Safari World or shopping.", overnight: "Bangkok" },
      { day: 4, title: "Fly to Phuket", description: "Transfer and flight to Phuket.", overnight: "Phuket" },
      { day: 5, title: "Phi Phi Islands", description: "Full-day island tour by speedboat.", overnight: "Phuket" },
      { day: 6, title: "Phuket at leisure", description: "Beach day or optional tours.", overnight: "Phuket" },
      { day: 7, title: "Departure", description: "Airport transfer." },
    ],
    inclusions: ["Sample: hotels", "Sample: breakfast", "Sample: listed tours"],
    exclusions: ["Sample: international flights", "Sample: visa fees", "Sample: personal expenses"],
    featuredOnHomepage: true, homepageOrder: 5,
  }),
  p({
    _id: "pkg-singapore", title: "Singapore Family Discovery", slug: "singapore-family-discovery", region: "international",
    destinations: [ref("singapore")], themes: ["Family"],
    durationNights: 4, durationDays: 5, startingCity: "Singapore",
    summary: "Sentosa, Gardens by the Bay, Universal Studios and the Night Safari.",
    heroImage: img("singapore", "City skyline across the bay at dusk"),
    highlights: ["Sentosa", "Universal Studios", "Gardens by the Bay", "Night Safari"],
    itinerary: [
      { day: 1, title: "Arrive in Singapore", description: "Transfer; evening Night Safari.", overnight: "Singapore" },
      { day: 2, title: "City tour & Gardens by the Bay", description: "Half-day city tour; Gardens by the Bay.", overnight: "Singapore" },
      { day: 3, title: "Universal Studios", description: "Full day at Universal Studios Singapore.", overnight: "Singapore" },
      { day: 4, title: "Sentosa", description: "Cable car and Sentosa attractions.", overnight: "Singapore" },
      { day: 5, title: "Departure", description: "Airport transfer." },
    ],
    inclusions: ["Sample: hotel", "Sample: breakfast", "Sample: listed attractions"],
    exclusions: ["Sample: flights", "Sample: visa fees", "Sample: personal expenses"],
    featuredOnHomepage: true, homepageOrder: 6,
  }),
  p({
    _id: "pkg-bali", title: "Bali Island Retreat", slug: "bali-island-retreat", region: "international",
    destinations: [ref("bali")], themes: ["Honeymoon", "Nature"],
    durationNights: 5, durationDays: 6, startingCity: "Denpasar",
    summary: "Ubud's culture and rice terraces with a beach stay in the south.",
    heroImage: img("bali", "Temple by a lagoon"),
    highlights: ["Ubud", "Kintamani", "Tanah Lot sunset", "Nusa Penida"],
    itinerary: [
      { day: 1, title: "Arrive in Bali", description: "Transfer to Ubud.", overnight: "Ubud" },
      { day: 2, title: "Kintamani & Ubud", description: "Volcano views, rice terraces and Ubud market.", overnight: "Ubud" },
      { day: 3, title: "Ubud to the coast", description: "Transfer south; Tanah Lot at sunset.", overnight: "Seminyak" },
      { day: 4, title: "Nusa Penida", description: "Day trip by fast boat.", overnight: "Seminyak" },
      { day: 5, title: "At leisure", description: "Beach day or spa.", overnight: "Seminyak" },
      { day: 6, title: "Departure", description: "Airport transfer." },
    ],
    inclusions: ["Sample: hotels", "Sample: breakfast", "Sample: private transfers"],
    exclusions: ["Sample: flights", "Sample: visa on arrival", "Sample: personal expenses"],
  }),
];

export const sampleServices: Service[] = [
  {
    _id: "svc-mumbai", key: "mumbai-sightseeing", title: "Mumbai Sightseeing", slug: "mumbai-sightseeing",
    tagline: "See the city's landmarks with a planned route",
    intro: "Half-day and full-day Mumbai sightseeing with a vehicle and driver. Routes and timings below are sample content — replace with S2 Holidays' actual tours.",
    heroImage: img("mumbai", "Seafront promenade with city lights"),
    offerings: [
      { title: "South Mumbai heritage", description: "Gateway of India, Chhatrapati Shivaji Maharaj Terminus (exterior), Kala Ghoda and Marine Drive. (Sample route.)" },
      { title: "Spiritual Mumbai", description: "Siddhivinayak Temple, Haji Ali Dargah and Mahalaxmi Temple. (Sample route.)" },
      { title: "City highlights full day", description: "South Mumbai landmarks, Bandra–Worli Sea Link, Bandstand and Juhu Beach. (Sample route.)" },
      { title: "Elephanta Caves", description: "Ferry from the Gateway of India to the Elephanta Caves UNESCO site. (Sample route.)" },
    ],
    faqs: [
      { question: "Can the route be customised?", answer: "Sample answer — confirm with S2 Holidays. Most private tours can be adjusted to your interests and time." },
      { question: "Are entry tickets included?", answer: "Sample answer — confirm with S2 Holidays before publishing." },
    ],
    isSample: true,
  },
  {
    _id: "svc-car", key: "car-rental", title: "Car Rental", slug: "car-rental",
    tagline: "Chauffeur-driven cars for city and outstation travel",
    intro: "Chauffeur-driven cars for airport transfers, local use and outstation trips. The fleet below is a sample — replace with S2 Holidays' actual vehicles.",
    heroImage: img("car-rental", "Open road towards the mountains"),
    offerings: [
      { title: "Airport & railway transfers", description: "Pick-up and drop for flights and trains. (Sample.)" },
      { title: "Local hire", description: "Hourly or full-day hire within the city. (Sample.)" },
      { title: "Outstation trips", description: "One-way and round trips to nearby destinations. (Sample.)" },
    ],
    vehicles: [
      { name: "Sedan (sample)", seats: 4, airConditioned: true, description: "Suitable for small families and business travel." },
      { name: "SUV (sample)", seats: 6, airConditioned: true, description: "Extra space for luggage and longer journeys." },
      { name: "Tempo Traveller (sample)", seats: 12, airConditioned: true, description: "Group travel and family outings." },
    ],
    faqs: [
      { question: "Are tolls and parking included?", answer: "Sample answer — confirm S2 Holidays' policy before publishing." },
    ],
    isSample: true,
  },
  {
    _id: "svc-guide", key: "tourist-guide", title: "Tourist Guide Services", slug: "tourist-guide",
    tagline: "Local guides for heritage sites and city walks",
    intro: "Local guides for sightseeing and heritage sites. Languages and coverage below are sample content — confirm with S2 Holidays.",
    heroImage: img("tourist-guide", "Temple and palms at dawn"),
    offerings: [
      { title: "City guides", description: "Guided sightseeing tours in Mumbai. (Sample.)" },
      { title: "Heritage site guides", description: "Guides for sites such as the Elephanta Caves. (Sample.)" },
      { title: "Language support", description: "Guides in languages to be confirmed. (Sample.)" },
    ],
    faqs: [{ question: "How far in advance should I book a guide?", answer: "Sample answer — confirm with S2 Holidays." }],
    isSample: true,
  },
];

/** Intentionally empty: real testimonials must come from verified customers via the CMS. */
export const sampleTestimonials: Testimonial[] = [];

export const samplePosts: Post[] = [
  {
    _id: "post-1", title: "How to plan your first international holiday", slug: "plan-your-first-international-holiday",
    excerpt: "Passports, visas, budgets and choosing a destination — a starter checklist. (Sample article.)",
    coverImage: img("blog-1", "Beach at sunrise"), author: "S2 Holidays (sample)", publishedAt: "2026-10-01",
    categories: ["Planning"],
    body: pt(
      "This is a sample article used to demonstrate the blog layout. Replace it with your own writing in the CMS.",
      { h2: "1. Check your passport" },
      "Many countries require a passport with at least six months' validity beyond your travel dates. Check the requirements for your destination with the official embassy or consulate.",
      { h2: "2. Understand visa rules" },
      "Visa requirements vary by nationality and change from time to time, so always confirm with official sources before booking.",
      { h2: "3. Set a realistic budget" },
      "Include flights, accommodation, transfers, sightseeing, meals, insurance and a buffer for personal expenses."
    ),
    isSample: true,
  },
  {
    _id: "post-2", title: "Packing for a hill-station trip", slug: "packing-for-a-hill-station-trip",
    excerpt: "Layers, footwear and small essentials for mountain holidays. (Sample article.)",
    coverImage: img("blog-2", "Mountains at sunset"), author: "S2 Holidays (sample)", publishedAt: "2026-09-15",
    categories: ["Tips"],
    body: pt(
      "This is a sample article used to demonstrate the blog layout.",
      { h2: "Dress in layers" },
      "Mountain temperatures can change quickly through the day. Thermal base layers, a fleece and a waterproof outer layer cover most conditions.",
      { h2: "Comfortable footwear" },
      "Choose shoes with good grip for walks and sightseeing."
    ),
    isSample: true,
  },
  {
    _id: "post-3", title: "Exploring Rajasthan's forts", slug: "exploring-rajasthans-forts",
    excerpt: "An overview of the forts most travellers include in a Rajasthan circuit. (Sample article.)",
    coverImage: img("blog-3", "Desert landscape at dusk"), author: "S2 Holidays (sample)", publishedAt: "2026-08-20",
    categories: ["Destinations"],
    body: pt(
      "This is a sample article used to demonstrate the blog layout.",
      { h2: "Amber Fort, Jaipur" },
      "A hilltop fort-palace on the outskirts of Jaipur.",
      { h2: "Mehrangarh Fort, Jodhpur" },
      "One of the largest forts in India, overlooking the blue city.",
      { h2: "Jaisalmer Fort" },
      "A living fort built from yellow sandstone, with homes and shops inside its walls."
    ),
    isSample: true,
  },
];

export const sampleFaqs: Faq[] = [
  { _id: "faq-1", category: "Booking", question: "How do I enquire about a package?", answer: "Use the enquiry form on any package page or the contact page, or message us on WhatsApp. The team will respond with availability and a quote. (Sample answer — confirm wording.)" },
  { _id: "faq-2", category: "Booking", question: "Can packages be customised?", answer: "Sample answer — confirm S2 Holidays' policy. Itineraries shown on the website can usually be adapted to your dates, hotel preferences and budget." },
  { _id: "faq-3", category: "Payments", question: "What payment methods are accepted?", answer: "Sample placeholder — S2 Holidays to provide accepted payment methods and deposit terms." },
  { _id: "faq-4", category: "Payments", question: "What is the cancellation policy?", answer: "Sample placeholder — S2 Holidays to provide the cancellation and refund policy." },
  { _id: "faq-5", category: "Travel", question: "Do you help with visas?", answer: "Sample placeholder — confirm whether visa assistance is offered and for which countries." },
  { _id: "faq-6", category: "Travel", question: "Is travel insurance included?", answer: "Sample placeholder — confirm whether insurance is included or available as an add-on." },
];

const legalNotice =
  "SAMPLE TEMPLATE — NOT LEGAL ADVICE. This page must be reviewed and replaced by S2 Holidays with policy text approved by a qualified professional before the website goes live.";

export const sampleLegal: LegalPage[] = [
  {
    _id: "legal-privacy", title: "Privacy Policy", slug: "privacy-policy", isSample: true, updatedAt: "2026-11-01",
    body: pt(
      legalNotice,
      { h2: "Information we collect" },
      "When you submit an enquiry we collect the details you provide, such as your name, email address, phone number, travel dates, number of travellers and message.",
      { h2: "How we use it" },
      "We use these details to respond to your enquiry, prepare quotations and provide the services you request.",
      { h2: "Storage and security" },
      "Enquiries are stored in an access-controlled system available only to authorised staff.",
      { h2: "Your choices" },
      "You may ask us to access, correct or delete your personal information using the contact details on this website.",
      { h2: "Contact" },
      "Contact details to be added once verified."
    ),
  },
  {
    _id: "legal-terms", title: "Terms & Conditions", slug: "terms", isSample: true, updatedAt: "2026-11-01",
    body: pt(
      legalNotice,
      { h2: "Bookings" },
      "Placeholder — booking confirmation process to be supplied by S2 Holidays.",
      { h2: "Payments" },
      "Placeholder — payment schedule and accepted methods to be supplied by S2 Holidays.",
      { h2: "Cancellations and refunds" },
      "Placeholder — cancellation charges and refund timelines to be supplied by S2 Holidays.",
      { h2: "Website content" },
      "Package details on this website are indicative and subject to confirmation at the time of booking."
    ),
  },
];
