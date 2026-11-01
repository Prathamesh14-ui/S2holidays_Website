import type { StructureResolver } from "sanity/structure";
import { LEAD_STATUSES } from "@/lib/enquiry/schema";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("S2 Holidays")
    .items([
      S.listItem()
        .title("Enquiries")
        .child(
          S.list()
            .title("Enquiries")
            .items([
              S.listItem().title("All enquiries").child(
                S.documentTypeList("lead").title("All enquiries").defaultOrdering([{ field: "submittedAt", direction: "desc" }])
              ),
              S.divider(),
              ...LEAD_STATUSES.map((s) =>
                S.listItem()
                  .id(`lead-${s.value}`)
                  .title(s.title)
                  .child(
                    S.documentList()
                      .title(`${s.title} enquiries`)
                      .schemaType("lead")
                      .filter('_type == "lead" && status == $status')
                      .params({ status: s.value })
                      .defaultOrdering([{ field: "submittedAt", direction: "desc" }])
                  )
              ),
            ])
        ),
      S.divider(),
      S.listItem()
        .title("Holiday packages")
        .child(
          S.list()
            .title("Holiday packages")
            .items([
              S.listItem().title("All packages").child(S.documentTypeList("holidayPackage").title("All packages")),
              S.listItem().title("Featured on homepage").child(
                S.documentList()
                  .title("Featured on homepage")
                  .schemaType("holidayPackage")
                  .filter('_type == "holidayPackage" && featuredOnHomepage == true')
                  .defaultOrdering([{ field: "homepageOrder", direction: "asc" }])
              ),
              S.listItem().title("Domestic").child(
                S.documentList().title("Domestic packages").schemaType("holidayPackage")
                  .filter('_type == "holidayPackage" && coalesce(region, destinations[0]->region) == "domestic"')
              ),
              S.listItem().title("International").child(
                S.documentList().title("International packages").schemaType("holidayPackage")
                  .filter('_type == "holidayPackage" && coalesce(region, destinations[0]->region) == "international"')
              ),
            ])
        ),
      S.listItem()
        .title("Destinations")
        .child(
          S.list()
            .title("Destinations")
            .items([
              S.listItem().title("Domestic").child(
                S.documentList().title("Domestic").schemaType("destination").filter('_type == "destination" && region == "domestic"')
              ),
              S.listItem().title("International").child(
                S.documentList().title("International").schemaType("destination").filter('_type == "destination" && region == "international"')
              ),
            ])
        ),
      S.documentTypeListItem("service").title("Service pages"),
      S.divider(),
      S.documentTypeListItem("post").title("Blog posts"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("faq").title("FAQs"),
      S.documentTypeListItem("legalPage").title("Policy pages"),
      S.divider(),
      S.listItem().title("Site settings").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
