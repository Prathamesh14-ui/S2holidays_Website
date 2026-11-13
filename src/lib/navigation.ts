export type NavLink = { label: string; href: string; description?: string };
export type NavItem = NavLink & { children?: NavLink[] };

export const serviceLinks: NavLink[] = [
  { label: "Mumbai Sightseeing", href: "/services/mumbai-sightseeing", description: "City tours with vehicle and driver" },
  { label: "Car Rental", href: "/services/car-rental", description: "Transfers, local and outstation" },
  { label: "Tourist Guides", href: "/services/tourist-guide", description: "Local guides for sightseeing" },
];

export const footerLinks: { title: string; links: NavLink[] }[] = [
  {
    title: "Holidays",
    links: [
      { label: "Domestic holidays", href: "/destinations/domestic" },
      { label: "International holidays", href: "/destinations/international" },
      { label: "All packages", href: "/packages" },
      { label: "All destinations", href: "/destinations" },
      { label: "Mahabaleshwar hotel packages", href: "/mahabaleshwar-hotel-packages" },
      { label: "Goa hotel rates", href: "/goa-hotel-rates" },
    ],
  },
  { title: "Services", links: serviceLinks },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Travel journal", href: "/blog" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact us", href: "/contact" },
    ],
  },
];
