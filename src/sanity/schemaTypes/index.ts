import { seo } from "./objects/seo";
import { itineraryDay } from "./objects/itineraryDay";
import { price } from "./objects/price";
import { siteSettings } from "./documents/siteSettings";
import { destination } from "./documents/destination";
import { holidayPackage } from "./documents/holidayPackage";
import { service } from "./documents/service";
import { testimonial } from "./documents/testimonial";
import { post } from "./documents/post";
import { faq } from "./documents/faq";
import { legalPage } from "./documents/legalPage";
import { lead } from "./documents/lead";
import { plannerDestination } from "./documents/plannerDestination";

export const schemaTypes = [seo, itineraryDay, price, siteSettings, destination, holidayPackage, service, testimonial, post, faq, legalPage, lead, plannerDestination];

/** Types that exist exactly once and must not be created/duplicated/deleted from the Studio. */
export const SINGLETONS = ["siteSettings"];
/** Types created only by the website (never manually). */
export const SYSTEM_CREATED = ["lead"];
