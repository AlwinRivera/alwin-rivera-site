export const profile = {
  name: "Alwin Rivera",
  firstName: "Alwin",
  lastName: "Rivera",
  role: "Front-End Developer",
  location: "Cebu, Philippines",
  timezone: "Asia/Manila",
  email: "aimrivera@gmail.com",
  // Shown in the hero badge and given to the digital twin, so both say the same thing.
  availability: "Open to select engagements",
  links: {
    linkedin: "https://www.linkedin.com/in/alwin-rivera",
    github: "https://github.com/AlwinRivera",
    codepen: "https://codepen.io/devAlwinRivera/",
    portfolio: "https://alwinrivera.github.io/portfolio/",
  },
};

/* Derived facts. The page is prerendered, so these are computed at build time and refresh on each deploy. */
const careerStart = new Date("2019-01-01");
export const careerStartYear = careerStart.getFullYear();
export const yearsExperience = Math.floor((Date.now() - careerStart.getTime()) / (365.25 * 86_400_000));
const NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];
export const yearsInWords = NUMBER_WORDS[yearsExperience] ?? String(yearsExperience);
// e.g. "UTC+8", from the time zone rather than hard-coded.
export const utcOffset =
  new Intl.DateTimeFormat("en-US", { timeZone: profile.timezone, timeZoneName: "shortOffset" })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName")
    ?.value.replace("GMT", "UTC") ?? "";

export const stats = [
  { value: `${yearsExperience}+`, label: "Years shipping production front-end" },
  { value: "4", label: "Organizations, one standard" },
  { value: String(careerStartYear), label: "First line of production code" },
  { value: utcOffset, label: "Cebu-based, working globally" },
];

export const pillars = [
  {
    kicker: "Who I am",
    title: "A seasoned front-end developer.",
    body: `Over ${yearsInWords} years crafting modern, accessible, high-performance web experiences — from scrappy landing pages to platform-scale marketing systems.`,
  },
  {
    kicker: "What I bring",
    title: "Craft with discipline.",
    body: "Deep expertise in HTML, CSS and JavaScript, a firm belief in mobile-first architecture, and an obsession with clean, reviewable, maintainable code.",
  },
  {
    kicker: "What I do for clients",
    title: "Design, made functional.",
    body: "I bridge the gap between design and engineering — delivering responsive websites, reusable UI components and conversion-tuned landing pages built around your business.",
  },
];

export const principles = [
  { id: "01", title: "Mobile-first", body: "Every layout starts at the smallest screen and scales up with intent." },
  {
    id: "02",
    title: "Accessible by default",
    body: "Semantic markup, keyboard paths and contrast are requirements, not extras.",
  },
  {
    id: "03",
    title: "Performance-obsessed",
    body: "Lean payloads, fast paint, zero jank. Speed is a feature users feel.",
  },
  { id: "04", title: "Pixel-perfect", body: "Designs ship the way they were drawn — across every modern browser." },
];

export const skills = [
  "HTML5",
  "CSS3",
  "JavaScript",
  "Responsive Design",
  "Landing Pages",
  "UI Components",
  "Accessibility",
  "Web Performance",
  "Cross-Browser QA",
  "API Integration",
  "Code Review",
  "Front-End Design",
];

export type Role = {
  title: string;
  period: string;
  duration: string;
  bullets: string[];
};

export type Company = {
  company: string;
  location: string;
  span: string;
  current?: boolean;
  tags: string[];
  roles: Role[];
};

export const career: Company[] = [
  {
    company: "Channext",
    location: "Cebu, Central Visayas",
    span: "2025 — Now",
    current: true,
    tags: ["Landing Pages", "Marketing Automation", "Performance"],
    roles: [
      {
        title: "Front-End Developer",
        period: "Sep 2025 — Present",
        duration: "1 yr 2 mos",
        bullets: [
          "Build high-converting landing pages for Channext's marketing automation platform, translating complex UI/UX designs into clean, production-ready code.",
          "Deliver pixel-perfect, cross-browser execution that closes the gap between design specification and working interface.",
          "Optimize performance and mobile responsiveness to power partner marketing campaigns.",
        ],
      },
    ],
  },
  {
    company: "Forty Degrees Celsius Inc.",
    location: "Cebu, Central Visayas",
    span: "2022 — 2026",
    tags: ["Code Review", "Accessibility", "UI Components", "API Integration"],
    roles: [
      {
        title: "Front-End Analyst",
        period: "Jul 2025 — Apr 2026",
        duration: "10 mos",
        bullets: [
          "Analyzed and optimized front-end code for performance and long-term maintainability.",
          "Conducted code reviews and gave junior developers actionable feedback.",
          "Aligned engineering with business requirements alongside PMs and designers.",
          "Implemented accessibility and usability best practices across projects.",
        ],
      },
      {
        title: "Front-End Developer",
        period: "Feb 2022 — Aug 2025",
        duration: "3 yrs 7 mos",
        bullets: [
          "Built and maintained responsive websites in HTML, CSS and JavaScript.",
          "Created reusable UI components and implemented designer mockups.",
          "Improved site performance and ensured cross-browser compatibility.",
          "Integrated APIs and data-driven features with back-end engineers.",
        ],
      },
    ],
  },
  {
    company: "Acer Service Center",
    location: "Metro Cebu",
    span: "2021 — 2022",
    tags: ["Client Communication", "Research"],
    roles: [
      {
        title: "Customer Service Associate",
        period: "Aug 2021 — Jan 2022",
        duration: "6 mos",
        bullets: [
          "Handled customer inquiries end-to-end, reviewing history to resolve issues fast.",
          "Researched and relayed technical information, verifying customer understanding.",
        ],
      },
    ],
  },
  {
    company: "Customer Benefits Services",
    location: "Metro Cebu",
    span: "2019 — 2021",
    tags: ["Web Build", "Scripting", "Landing Pages"],
    roles: [
      {
        title: "Junior Front-End Developer",
        period: "Jan 2019 — Dec 2021",
        duration: "3 yrs",
        bullets: [
          "Designed and coded websites from layout to function to client specification.",
          "Wrote and tested site scripts; optimized home and landing pages.",
          "Filed reports, gathered requirements and performed research.",
        ],
      },
    ],
  },
];

export const education = {
  school: "AMA University",
  degree: "Bachelor of Technology — Information Technology",
  period: "2014 — 2017",
};

export type Project = {
  id: string;
  title: string;
  category: string;
  blurb: string;
  href?: string;
  status: "live" | "soon";
};

// Add real case studies here — set status to "live" and provide an href.
export const projects: Project[] = [
  {
    id: "P/01",
    title: "Case study in progress",
    category: "Landing Page · Conversion",
    blurb: "A deep dive into a high-converting marketing page — from design handoff to production metrics.",
    status: "soon",
  },
  {
    id: "P/02",
    title: "Component system",
    category: "UI Library · Design Systems",
    blurb: "Reusable, accessible components engineered to scale across products and teams.",
    status: "soon",
  },
  {
    id: "P/03",
    title: "Performance teardown",
    category: "Optimization · Core Web Vitals",
    blurb: "Before-and-after of a real-world performance overhaul, measured in milliseconds.",
    status: "soon",
  },
];

export const profiles = [
  { label: "GitHub", handle: "@AlwinRivera", href: profile.links.github, note: "Source & experiments" },
  { label: "CodePen", handle: "devAlwinRivera", href: profile.links.codepen, note: "UI sketches & demos" },
  { label: "Portfolio v1", handle: "alwinrivera.github.io", href: profile.links.portfolio, note: "Previous portfolio" },
  { label: "LinkedIn", handle: "in/alwin-rivera", href: profile.links.linkedin, note: "Professional profile" },
];
