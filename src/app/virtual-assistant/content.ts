/**
 * Copy for the Virtual Assistant webinar funnel:
 * landing → register popup → qualification → thank-you / not eligible.
 * Event specifics and links live in `@/config/webinar`.
 */
import { webinar } from "@/config/webinar";

export const routes = {
  landing: "/virtual-assistant",
  qualify: "/virtual-assistant/qualify",
  thanks: "/virtual-assistant/thank-you",
  notEligible: "/virtual-assistant/not-eligible",
} as const;

export const contact = {
  email: "hiring@practiscale.com",
  site: "practiscale.com",
  siteHref: "https://practiscale.com/",
};

export const vsl = {
  id: "gTAy42y0bBc",
  title: "Work From Home in Pakistan | Build a Remote Career With PractiScale",
  /** The YouTube thumbnail: it carries its own headline on the left and the host on the right. */
  poster: "/media/va-stories/vsl-poster-v2.webp",
};

export const host = {
  name: "Afrasyab Ahmed",
  role: "Founder & CEO · Your webinar host",
  photo: "/media/about/about-founder-portrait-desktop-v2.webp",
};

export const hero = {
  eyebrow: "Free live webinar for Pakistani women",
  /** The approved headline, split only for emphasis: the figure is the visual. */
  headlineTop: "How Pakistani Women Are Earning",
  headlineFigure: "189,000 Rupees",
  headlineRest: "a Month Without Leaving Their Home",
  subLead: "Hard to believe?",
  sub: "Scroll down to see the women who are already doing it.",
  urgency: "Seats are filling up. Register before it's too late.",
  countdownLabel: "Registration closing in:",
  cta: "See How It Works",
  assurances: ["100% free", "Online", "60 minutes"],
  forYouTitle: "This is for you if…",
  forYou: [
    "You have a degree but no career to show for it yet",
    "You want to work but stepping out of the home is not possible",
    "You have seen online opportunities before and wondered if any of them are actually real",
  ],
  proof: {
    strong: "Real women on our team.",
    rest: " Verify them yourself on LinkedIn.",
  },
};

/** The proof ticker under the hero, built from the case studies. */
export const ticker = [
  ["Kanwal · homemaker", "₨113,000 a month"],
  ["Mahnoor · no remote experience", "Team Leader, ₨189,000"],
  ["Nayab · medical student", "4 roles, ₨183,000"],
  ["100%", "female VA department"],
  ["500+", "US healthcare clients"],
] as const;

export const trust = [
  { figure: "189,000", label: "rupees earned by our top performers" },
  { figure: "100%", label: "female department, built and led by women" },
];

export const learn = {
  kicker: "The webinar",
  title: "What you will learn in this one hour",
  sub: "Everything you need to know before deciding if this is for you, in one session.",
  items: [
    {
      title: "What does a PractiScale Virtual Assistant actually do?",
      body: "A real look at what the work looks like day to day. What you will be doing, who you will be working with, and what a normal week feels like from home.",
    },
    {
      title: "What the 15-day training program looks like",
      body: "What you will learn inside it, how it is structured, and what happens once you complete it.",
    },
    {
      title: "What the career path looks like after training",
      body: "The responsibilities, the growth opportunities, and the earning potential at every stage.",
    },
    {
      title: "How women with no prior experience got here",
      body: "Kanwal was a homemaker. Mahnoor heard about us through her sister. Nayab was still in medical school. None of them had remote work experience when they started. You will hear exactly how they got to where they are now.",
      featured: true,
    },
    {
      title: "Whether you are the right fit",
      body: "We will be honest about who this is for and who it is not for. By the end of this session, you will know exactly whether this is the right next step for you.",
    },
  ],
  cta: "Count Me In",
  assurances: ["Free", "Takes 30 seconds"],
};

export const fit = {
  kicker: "Honest fit check",
  title: "Read this before you register",
  yesTitle: "This is for you if:",
  yes: [
    "You are a woman",
    "You are a graduate, final semester student, or housewife ready to build a professional career",
    "You have a laptop and a reliable internet connection",
    "You can communicate in English",
    "You are available to work from 6 PM to 3 AM after completing training",
    "You are serious about building a real remote career",
  ],
  noTitle: "This is probably not for you if:",
  no: [
    "You are looking for a casual part‑time role",
    "You cannot commit to the working hours after training",
    "You are not willing to go through an unpaid first month of training",
    "You want quick money without putting in real work",
  ],
};

export const stories = {
  kicker: "Real team members",
  title: "Women who started where you are",
  sub: "These are not actors. These are real women on our team. You can find them on LinkedIn.",
  featuredTag: "Our headline figure",
  noteTitle: "About these results",
  note: "Individual outcomes vary. The results shown here represent real team members. Earnings are not guaranteed and depend on individual performance and consistency.",
  items: [
    {
      name: "Kanwal Fayaz",
      role: "Virtual Assistant",
      photo: "/media/va-stories/kanwal-portrait-v2.webp",
      earn: "₨113,000",
      earnNote: "a month, from home",
      before:
        "Kanwal was a homemaker. She had stepped away from professional life and was not sure if a real career was still possible for her.",
      started: "She started with us from humble beginnings.",
      today: "She earns 113,000 rupees from her home.",
      linkedin: webinar.LINKEDIN_KANWAL,
    },
    {
      name: "Mahnoor Naeem",
      role: "Team Leader",
      photo: "/media/va-stories/mahnoor-portrait-v2.webp",
      earn: "₨189,000",
      earnNote: "a month · team leader",
      /** The figure in the hero headline: her row is highlighted. */
      featured: true,
      before:
        "Mahnoor heard about PractiScale through her sister. She had no prior remote work experience when she applied.",
      started: "She started with us at a modest salary.",
      today: "She is a Team Leader earning 189,000 rupees.",
      linkedin: webinar.LINKEDIN_MAHNOOR,
    },
    {
      name: "Nayab Fatima",
      role: "Team Leader · Interviewer · Designer · Expert VA",
      photo: "/media/va-stories/nayab-portrait-v1.webp",
      earn: "₨183,000",
      earnNote: "a month · 4 roles",
      before:
        "Nayab joined us in her final year of medical school. She did not wait to finish her degree.",
      started: "She started small and built from there.",
      today:
        "She holds four roles at PractiScale and earns 183,000 rupees, while maintaining a CGPA of 3.8.",
      linkedin: webinar.LINKEDIN_NAYAB,
    },
  ],
};

export const about = {
  kicker: "Your host",
  title: "Who is running this webinar",
  credentials: [
    { figure: "500+", label: "US clients served" },
    { figure: "100%", label: "Female VA department" },
  ],
};

export const details = {
  kicker: "The details",
  title: "Before you register",
  what: "A live one-hour webinar where Afrasyab Ahmed, CEO of PractiScale, walks you through exactly how to start a remote career as a Virtual Assistant from home.",
  where:
    "Online. You will receive the link on WhatsApp after registering. Accessible from anywhere in Pakistan.",
  cta: "Claim My Free Seat",
  lede: "Everything about the session in one place, and straight answers to what women ask us most.",
  passTag: "Free · Live · 60 minutes",
  stubUrgency: "Seats are filling up",
  noCountdown: "Seats are limited. Register early.",
  faqTitle: "Common questions",
  askTitle: "Still have a question?",
};

export const faq = [
  [
    "Do I need prior experience?",
    "No. Most of our team members started with zero remote work experience.",
  ],
  [
    "What if I am still studying?",
    "You can join. Nayab was in her final year of medical school when she started with us.",
  ],
  [
    "What happens after the webinar?",
    "You will go through a short qualification step. If you meet the criteria, you will receive an invitation to join the training program.",
  ],
  [
    "Is PractiScale a real company?",
    "Yes. We serve 500+ healthcare businesses across the US. You can verify us on LinkedIn and Trustpilot before you register.",
  ],
  [
    "Is the training really unpaid for the first month?",
    "Yes. We say this upfront because we want the right women in the program. The first month is where you build the foundation. From Month 2, you are earning.",
  ],
] as const;

export const final = {
  title: "Your seat is waiting",
  sub: "Register now and join our WhatsApp group for the webinar.",
  cta: "Claim My Free Seat Now",
  fine: "By registering, you confirm that you meet the eligibility requirements listed above.",
};

export const disclaimer =
  "Individual outcomes vary. The case studies shown on this page represent real PractiScale team members. Salary figures are self-reported. Earnings shown are not a guarantee of future results and depend entirely on individual performance, effort, and consistency during and after the training program.";

export const popup = {
  title: "Save your free seat",
  step: "Step 1 of 2 · takes 30 seconds",
  cta: "Continue",
  privacy: "We never share your details. No spam.",
};

export const qualify = {
  title: "A Few Quick Questions",
  sub: "Step 2 of 2. Just two answers and you're done.",
  q1: "Are you a woman?",
  q2: "Do you have access to a laptop and a reliable internet connection?",
  cta: "Continue",
};

export const thanks = {
  title: "You’re Qualified!",
  sub: "Your spot for the Remote Virtual Assistant Webinar is almost confirmed.",
  listTitle: "Join our WhatsApp community now to receive:",
  list: [
    "Webinar date and time",
    "Joining instructions",
    "Important updates and reminders",
    "Support from our team",
  ],
  buttonIntro: "Click the button below to join the official community:",
  button: "Join the WhatsApp Community",
  warn: "Please join now—your registration will be completed after you join the community.",
  fallback: "If the button does not work, copy and open this link in WhatsApp:",
  closing: "We look forward to seeing you inside!",
};

export const notEligible = {
  title: "Thank you for your interest",
  body: "At this time, the webinar is designed specifically for women who have access to a laptop and reliable internet connection. We appreciate your interest and wish you the best.",
};
