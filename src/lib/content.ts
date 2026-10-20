export const whatsapp = (subject = "a career at PractiScale") =>
  `https://wa.me/923334000600?text=${encodeURIComponent(`Hi PractiScale, I would like to ask about ${subject}. Please share current availability, eligibility and compensation details.`)}`;
export const siteUrl = process.env.SITE_URL || "https://practiscale.pk";
export const routes = [
  "/",
  "/about/our-story",
  "/about/how-we-work",
  "/about/why-practiscale",
  "/training-programs/appointment-setter",
  "/training-programs/virtual-assistant",
  "/jobs",
  "/who-we-serve",
];
export const roles = [
  {
    title: "Remote Closer",
    team: "Sales",
    mode: "Remote",
    experience: "B2B sales experience",
    summary:
      "Run conversations with US healthcare business owners and help them decide whether referral partnerships fit their growth plans.",
  },
  {
    title: "Onsite Closer",
    team: "Sales",
    mode: "Onsite",
    experience: "B2B sales experience",
    summary:
      "Work alongside the sales team, answer prospects’ questions and bring new clients on board.",
  },
  {
    title: "Graphic Designer",
    team: "Creative",
    mode: "Hybrid",
    experience: "Portfolio required",
    summary:
      "Create social content, ads, presentations and website graphics with a clear, consistent brand identity.",
  },
  {
    title: "Video Editor",
    team: "Creative",
    mode: "Hybrid",
    experience: "Portfolio required",
    summary:
      "Edit short videos, founder content and campaigns with a strong sense of pacing and story.",
  },
  {
    title: "Script Writer",
    team: "Creative",
    mode: "Hybrid",
    experience: "Writing samples required",
    summary:
      "Write clear, specific scripts for videos, ads and founder-led content.",
  },
  {
    title: "AI Engineer",
    team: "Technology",
    mode: "Remote / Onsite",
    experience: "Projects to share",
    summary:
      "Build and improve AI tools for training, call scoring and internal workflows.",
  },
  {
    title: "CRM and AI Expert",
    team: "Technology",
    mode: "Remote / Onsite",
    experience: "CRM and automation experience",
    summary:
      "Build pipelines and automations, maintain data quality and support the teams using the CRM.",
  },
  {
    title: "WordPress Developer",
    team: "Technology",
    mode: "Remote / Onsite",
    experience: "Live websites to share",
    summary:
      "Build pages, improve performance and maintain WordPress websites.",
  },
  {
    title: "Web Developer",
    team: "Technology",
    mode: "Remote / Onsite",
    experience: "Shipped projects to share",
    summary:
      "Develop web applications, dashboards and the internal tools behind hiring and operations.",
  },
  {
    title: "Onsite HR Recruiter",
    team: "People & Operations",
    mode: "Onsite",
    experience: "Strong communication",
    summary: "Source, screen and schedule candidates for PractiScale teams.",
  },
  {
    title: "Remote HR Recruiter",
    team: "People & Operations",
    mode: "Remote",
    experience: "Recruitment experience preferred",
    summary:
      "Source and screen candidates remotely, with organized follow-up and clear communication.",
  },
  {
    title: "Associate Manager",
    team: "People & Operations",
    mode: "Onsite",
    experience: "Discuss eligibility with hiring",
    summary:
      "Support day-to-day operations, coordinate people and help teams stay on track.",
  },
];
export const industries = [
  [
    "Home care & home health",
    "Helping care providers connect with discharge planners, case managers and the professionals families turn to.",
  ],
  [
    "Assisted living & senior care",
    "Building relationships with placement advisors, care teams and social workers.",
  ],
  [
    "Non-emergency medical transport",
    "Connecting transport providers with clinics, dialysis centers and facilities that coordinate patient rides.",
  ],
  [
    "Behavioral & mental health",
    "Researching professionals who see patients needing therapy and behavioral care.",
  ],
  [
    "Rehab & therapy",
    "Connecting therapy providers with physician offices and practices that refer patients for treatment.",
  ],
  [
    "Clinics & specialty services",
    "Supporting relationships across physician networks, specialists and care coordinators.",
  ],
];
export const homeFaqs = [
  [
    "What does PractiScale do?",
    "We help US healthcare businesses build professional referral relationships. Our Pakistan teams research, reach out, qualify partners and coordinate introductions.",
  ],
  [
    "Do I need experience to apply?",
    "Training paths are designed for freshers and career switchers. Experienced applicants can explore sales, creative, technology and operations roles. Ask the hiring team about current eligibility.",
  ],
  [
    "Can I work from home?",
    "Remote, onsite and hybrid opportunities depend on the role. Confirm the current work arrangement with our hiring team before applying.",
  ],
  [
    "How does compensation work?",
    "Compensation depends on the role and its performance structure. Ask for the current terms during screening. Earnings and offers are not guaranteed.",
  ],
  [
    "How do I apply?",
    "Contact us on WhatsApp at 0333 4000 600 or send your CV to hiring@practiscale.com. Include the role or program you’re interested in.",
  ],
];
