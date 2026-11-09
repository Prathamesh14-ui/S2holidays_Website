/**
 * Starting data for the trip planner (6 destinations). Places and sightseeing come from the
 * owner's "S2 Holidays Travel Knowledge Base" itineraries. NO RATES are included — the owner adds
 * hotel, vehicle and meal rates in Studio → Trip planner; until then the planner offers a free quote.
 * GST 5% is from the knowledge base ("GST currently 5% on tour packages").
 */
import type { PlannerDestination } from "@/lib/planner/types";

const s = (...names: string[]) => names.map((name) => ({ name }));
const indiaVehicles = [
  { name: "Sedan (Dzire / Etios or similar)", seats: 4 },
  { name: "SUV (Innova / Ertiga or similar)", seats: 6 },
  { name: "Tempo Traveller", seats: 12 },
];
const indiaMeals = [{ name: "Breakfast" }, { name: "Breakfast + dinner" }, { name: "All meals" }];

export const plannerDefaults: PlannerDestination[] = [
  {
    slug: "goa",
    title: "Goa",
    destinationSlug: "goa",
    intro: "Beaches, forts, churches and Goan food.",
    startPoint: "Goa airport (Dabolim or Mopa) or Madgaon / Thivim railway station",
    endPoint: "Goa airport or railway station",
    places: [
      {
        key: "north-goa",
        name: "North Goa",
        description: "Calangute, Baga, Candolim and Anjuna — lively beaches and forts",
        defaultNights: 3,
        sightseeing: s("Fort Aguada and lighthouse", "Calangute and Baga beaches", "Candolim and Sinquerim beaches", "Anjuna beach", "Vagator beach and Chapora Fort", "Old Goa churches (Basilica of Bom Jesus, Se Cathedral)", "Mangueshi Temple", "Panjim Latin Quarter (Fontainhas)", "Dona Paula viewpoint and Miramar beach"),
      },
      {
        key: "south-goa",
        name: "South Goa",
        description: "Colva, Benaulim and Palolem — quieter beaches",
        defaultNights: 2,
        sightseeing: s("Colva beach", "Benaulim beach", "Cabo de Rama Fort", "Palolem beach"),
      },
    ],
    vehicles: indiaVehicles,
    mealPlans: indiaMeals,
    gstPercent: 5,
  },
  {
    slug: "kerala",
    title: "Kerala",
    destinationSlug: "kerala",
    intro: "Tea hills, spice gardens, backwaters and beaches.",
    startPoint: "Kochi airport",
    endPoint: "Kochi or Trivandrum airport",
    places: [
      { key: "kochi", name: "Kochi", description: "Fort Kochi heritage and Chinese fishing nets", defaultNights: 1, sightseeing: s("Fort Kochi", "Chinese fishing nets", "St. Francis Church", "Mattancherry Palace", "Jew Town") },
      { key: "munnar", name: "Munnar", description: "Tea gardens and misty hills", defaultNights: 2, sightseeing: s("Cheeyappara and Valara waterfalls (en route)", "Tea gardens and Tea Museum", "Eravikulam National Park (Rajamala)", "Mattupetty Dam", "Echo Point", "Kundala Lake", "Top Station viewpoint") },
      { key: "thekkady", name: "Thekkady", description: "Periyar wildlife and spice plantations", defaultNights: 1, sightseeing: s("Periyar Lake", "Spice plantation visit") },
      { key: "alleppey", name: "Alleppey houseboat", description: "Overnight cruise on the backwaters", defaultNights: 1, sightseeing: s("Vembanad backwaters by houseboat") },
      { key: "kovalam", name: "Kovalam", description: "Beach stay near Trivandrum", defaultNights: 2, sightseeing: s("Lighthouse beach", "Hawa beach", "Padmanabhaswamy Temple, Trivandrum (dress code applies)", "Napier Museum") },
    ],
    vehicles: indiaVehicles,
    mealPlans: indiaMeals,
    gstPercent: 5,
  },
  {
    slug: "kashmir",
    title: "Kashmir",
    destinationSlug: "kashmir",
    intro: "Dal Lake, Mughal gardens and Himalayan meadows.",
    startPoint: "Srinagar airport",
    endPoint: "Srinagar airport",
    places: [
      { key: "srinagar-houseboat", name: "Srinagar – Dal Lake houseboat", description: "A night on a traditional houseboat", defaultNights: 1, sightseeing: s("Shikara ride on Dal Lake") },
      { key: "srinagar", name: "Srinagar", description: "Base for day trips to Gulmarg, Sonamarg and Doodhpathri", defaultNights: 3, sightseeing: s("Mughal Gardens (Nishat, Shalimar, Cheshma Shahi)", "Shankaracharya Temple viewpoint", "Gulmarg day trip", "Sonamarg day trip", "Doodhpathri meadows day trip") },
      { key: "pahalgam", name: "Pahalgam", description: "Valleys and river views", defaultNights: 2, sightseeing: s("Pampore saffron fields and Avantipura (en route)", "Aru Valley (local taxi)", "Betaab Valley (local taxi)", "Chandanwari (local taxi)") },
    ],
    vehicles: indiaVehicles,
    mealPlans: indiaMeals,
    gstPercent: 5,
  },
  {
    slug: "himachal",
    title: "Himachal",
    destinationSlug: "himachal-pradesh",
    intro: "Shimla, Manali, Dharamshala and Dalhousie.",
    startPoint: "Delhi or Chandigarh",
    endPoint: "Delhi or Chandigarh",
    places: [
      { key: "shimla", name: "Shimla", description: "Colonial hill town", defaultNights: 2, sightseeing: s("The Ridge and Mall Road", "Christ Church", "Jakhu Temple", "Kufri") },
      { key: "manali", name: "Manali", description: "Snow views and adventure", defaultNights: 3, sightseeing: s("Hadimba Devi Temple", "Vashisht hot springs", "Manu Temple", "Old Manali and Mall Road", "Solang Valley", "Kullu valley and Manikaran Sahib") },
      { key: "dharamshala", name: "Dharamshala", description: "McLeodganj and the Dhauladhar range", defaultNights: 2, sightseeing: s("HPCA Cricket Stadium", "McLeodganj", "Dalai Lama Temple complex", "Bhagsu Nag waterfall", "St. John in the Wilderness church") },
      { key: "dalhousie", name: "Dalhousie", description: "Pine forests and Khajjiar meadow", defaultNights: 2, sightseeing: s("Panchpula", "Subhash Baoli", "St. John’s Church", "Khajjiar meadow and lake") },
      { key: "amritsar", name: "Amritsar", description: "Golden Temple city", defaultNights: 1, sightseeing: s("Golden Temple", "Jallianwala Bagh", "Wagah / Attari border ceremony") },
    ],
    vehicles: indiaVehicles,
    mealPlans: indiaMeals,
    gstPercent: 5,
  },
  {
    slug: "rajasthan",
    title: "Rajasthan",
    destinationSlug: "rajasthan",
    intro: "Forts, palaces, lakes and desert camps.",
    startPoint: "Jaipur airport or railway station",
    endPoint: "Jaipur, Jodhpur or Udaipur",
    places: [
      { key: "jaipur", name: "Jaipur", description: "The Pink City", defaultNights: 2, sightseeing: s("Amber Fort", "Jal Mahal", "Hawa Mahal", "City Palace", "Jantar Mantar", "Albert Hall", "Nahargarh Fort at sunset", "Birla Mandir") },
      { key: "jodhpur", name: "Jodhpur", description: "The Blue City", defaultNights: 1, sightseeing: s("Mehrangarh Fort", "Jaswant Thada", "Clock Tower market") },
      { key: "jaisalmer", name: "Jaisalmer", description: "The Golden City", defaultNights: 1, sightseeing: s("Jaisalmer Fort (Sonar Quila)", "Patwon ki Haveli", "Gadisar Lake") },
      { key: "sam-dunes", name: "Sam sand dunes camp", description: "A night in a desert camp", defaultNights: 1, sightseeing: s("Sam sand dunes at sunset") },
      { key: "udaipur", name: "Udaipur", description: "City of lakes", defaultNights: 2, sightseeing: s("City Palace", "Lake Pichola", "Jagdish Temple", "Saheliyon ki Bari", "Fateh Sagar Lake", "Bagore ki Haveli", "Ranakpur Jain Temple (en route)", "Kumbhalgarh Fort day trip") },
    ],
    vehicles: indiaVehicles,
    mealPlans: indiaMeals,
    gstPercent: 5,
  },
  {
    slug: "dubai",
    title: "Dubai",
    destinationSlug: "dubai",
    intro: "Skyline, desert and a day in Abu Dhabi.",
    startPoint: "Dubai International Airport (DXB)",
    endPoint: "Dubai International Airport (DXB)",
    places: [
      { key: "dubai", name: "Dubai", description: "City sights, desert safari and Marina", defaultNights: 4, sightseeing: s("Dubai city tour (Jumeirah, Burj Al Arab photo stop, Palm Jumeirah, souks)", "Burj Khalifa (124th/125th floor)", "Dubai Fountain", "Dubai Marina cruise", "Desert safari", "Atlantis The Palm – Lost Chambers Aquarium", "Dubai Frame", "Miracle Garden (seasonal, Nov–May)", "Global Village (seasonal, Oct–May)", "Abu Dhabi day trip (Sheikh Zayed Grand Mosque, Corniche)", "Ferrari World, Yas Island") },
    ],
    vehicles: [{ name: "Private car with driver", seats: 4 }, { name: "Private van with driver", seats: 7 }],
    mealPlans: [{ name: "Breakfast" }, { name: "Breakfast + dinner" }],
    gstPercent: 5,
  },
];
