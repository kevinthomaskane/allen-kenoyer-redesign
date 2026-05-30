// Site-wide config: contact info and nav structure.
// Nav structure per the docs/website-outline.md decisions (Services dropdown
// for the four service pages; Classes/Supplies dropdowns each with one sub-route).

// The studio's wall-clock timezone. Hardcoded, single source of truth for every
// UTC↔local conversion and datetime display (dev-guide § Date/time handling);
// there is no per-record or admin-editable zone (ADR-0015, ADR-0020, ADR-0021).
// Consumed by src/lib/studio-time.ts and src/lib/datetime.ts.
export const STUDIO_TZ = "America/Los_Angeles";

export const siteContact = {
  phone: "(310) 542-6225",
  phoneHref: "tel:3105426225",
  email: "akglass@allenkenoyerglass.com",
  emailHref: "mailto:akglass@allenkenoyerglass.com",
  classesEmail: "classes@allenkenoyerglass.com",
  classesEmailHref: "mailto:classes@allenkenoyerglass.com",
  address: {
    line1: "4571 Artesia Blvd",
    line2: "Lawndale, CA 90260",
    mapHref:
      "https://www.google.com/maps/search/?api=1&query=4571+Artesia+Blvd+Lawndale+CA+90260",
  },
  social: {
    facebook:
      "https://www.facebook.com/p/Allen-Kenoyer-Stained-Glass-100057584555674/",
    instagram: "https://www.instagram.com/allenkenoyerglass/",
    pinterest: "https://www.pinterest.com/allenkenoyersta/",
  },
  // Studio hours per the design reference in demo/index.html. Mirrored on
  // the home page (above-the-fold per the website outline) and the contact
  // page so editing one place is enough.
  hours: [
    { days: "Tuesday – Thursday", time: "11am – 5pm" },
    { days: "Friday – Saturday", time: "11am – 4pm" },
    { days: "Sunday & Monday", time: "Closed" },
  ],
};

// Constant Contact-hosted newsletter links per ADR-0011. Kept here so the
// contact page and footer reference the same URLs.
export const newsletter = {
  signupHref:
    "https://visitor.r20.constantcontact.com/d.jsp?llr=esl98jcab&p=oi&m=esl98jcab&sit=isv9h4adb&f=2814a778-a8e2-407e-ac91-b129e1952bfe",
  latestHref: "https://conta.cc/4wgxUUr",
};

export type NavItem =
  | { label: string; href: string }
  | { label: string; children: { label: string; href: string }[] };

export const headerNav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    children: [
      { label: "Custom Design", href: "/custom-design" },
      { label: "Repairs", href: "/repairs" },
      { label: "Cabinet Doors", href: "/cabinet-doors" },
      { label: "Portfolio", href: "/portfolio" },
    ],
  },
  {
    label: "Classes",
    children: [
      { label: "All Classes", href: "/classes" },
      { label: "Class Calendar", href: "/classes/calendar" },
    ],
  },
  {
    label: "Supplies",
    children: [
      { label: "All Supplies", href: "/supplies" },
      { label: "Patterns", href: "/supplies/patterns" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

// Footer is the sitemap; groups mirror the header dropdowns plus standalone items.
export const footerSections = [
  {
    heading: "Services",
    links: [
      { label: "Custom Design", href: "/custom-design" },
      { label: "Repairs", href: "/repairs" },
      { label: "Cabinet Doors", href: "/cabinet-doors" },
      { label: "Portfolio", href: "/portfolio" },
    ],
  },
  {
    heading: "Classes",
    links: [
      { label: "All Classes", href: "/classes" },
      { label: "Class Calendar", href: "/classes/calendar" },
    ],
  },
  {
    heading: "Supplies",
    links: [
      { label: "All Supplies", href: "/supplies" },
      { label: "Patterns", href: "/supplies/patterns" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { label: "Home", href: "/" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];
