/** Trip planner data model (managed in Studio → Trip planner). All rates are in INR. */
export type HotelCategory = "standard" | "deluxe" | "premium";

export const HOTEL_CATEGORIES: { value: HotelCategory; label: string; hint: string }[] = [
  { value: "standard", label: "Standard", hint: "2–3★ or similar" },
  { value: "deluxe", label: "Deluxe", hint: "3–4★ or similar" },
  { value: "premium", label: "Premium", hint: "4–5★ or similar" },
];

export type PlannerSight = { name: string; note?: string; extraPerPerson?: number };

export type PlannerPlace = {
  key: string;
  name: string;
  description?: string;
  defaultNights?: number;
  sightseeing?: PlannerSight[];
  /** Price per room per night by hotel category. */
  hotelRates?: Partial<Record<HotelCategory, number>>;
};

export type PlannerVehicle = { name: string; seats?: number; ratePerDay?: number };
export type PlannerMealPlan = { name: string; ratePerPersonPerNight?: number };
export type PlannerSeason = { name: string; from: string; to: string; percent: number };

export type PlannerDestination = {
  slug: string;
  title: string;
  intro?: string;
  destinationSlug?: string;
  startPoint?: string;
  endPoint?: string;
  places: PlannerPlace[];
  vehicles: PlannerVehicle[];
  mealPlans: PlannerMealPlan[];
  seasons?: PlannerSeason[];
  gstPercent?: number;
  advancePercent?: number;
  /** Only when ticked in Studio are calculated prices shown to customers. */
  ratesConfirmed?: boolean;
};

/** What the visitor chose. */
export type TripChoice = {
  startDate?: string; // YYYY-MM-DD
  adults: number;
  children: number; // 5–11 yrs (charged)
  infants: number; // under 5 (free)
  rooms: number;
  stops: { placeKey: string; nights: number; sights: string[] }[];
  hotel: HotelCategory;
  meal?: string;
  vehicle?: string;
};

export type PlanDay = { day: number; date?: string; title: string; lines: string[]; stay?: string; meals?: string };

export type PriceLine = { label: string; amount: number; note?: string };
export type PriceBreakdown = {
  lines: PriceLine[];
  subtotal: number;
  gstPercent: number;
  gst: number;
  total: number;
  perPerson: number;
  advance?: number;
};
