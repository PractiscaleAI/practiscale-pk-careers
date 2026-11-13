/**
 * Every word on the /virtual-assistant page. Event specifics (date, time,
 * form endpoint, verified links) live in `@/config/webinar`.
 */
import { webinar } from "@/config/webinar";

export const shiftHours = "6 PM to 3 AM PKT";

export const vsl = {
  id: "gTAy42y0bBc",
  title: "Work From Home in Pakistan | Build a Remote Career With PractiScale",
  poster: "/media/va-stories/vsl-poster-v1.webp",
};

export const nav = [
  { label: "Watch", href: "#watch" },
  { label: "Stories", href: "#stories" },
  { label: "Path", href: "#path" },
  { label: "Requirements", href: "#requirements" },
  { label: "FAQ", href: "#faq" },
] as const;

export const hero = {
  kicker: "Free live webinar · for women in Pakistan",
  lead: "Start a remote VA career",
  title: "From home",
  sub: "Work the night shift for US healthcare clinics, from your own desk. See exactly how in one free hour online.",
  facts: "Online · 60 minutes · Free",
  veil: "Scroll to begin your shift",
};

export const intro = {
  eyebrow: "Watch first",
  heading: "See the work before you decide.",
  body: "The founder explains the role, the training and the night shift — and you meet a woman already doing it.",
  covers: ["What Virtual Assistants do", "How training works", "What the night shift requires"],
};

export const companyMetrics = [
  ["500+", "US healthcare clients"],
  ["100%", "Women-led VA department"],
  ["5,000", "Jobs for Pakistani women, our goal"],
  ["2025", "Year PractiScale started"],
] as const;

/**
 * Portraits were supplied without names. Nayab is the medical-coat portrait
 * (her story); Kanwal is the maroon hijab, as she appears in the VSL
 * thumbnail; Mahnoor is the remaining one.
 */
export const stories = [
  {
    name: "Kanwal Fayaz",
    role: "Virtual Assistant",
    start: "Returned to work after time as a homemaker.",
    outcome: "Rs 113,000",
    image: "/media/va-stories/kanwal-portrait-v2.webp",
    linkedin: webinar.LINKEDIN_KANWAL,
  },
  {
    name: "Mahnoor Naeem",
    role: "Team Leader",
    start: "Joined with no remote experience and became a team leader.",
    outcome: "Rs 189,000",
    image: "/media/va-stories/mahnoor-portrait-v2.webp",
    linkedin: webinar.LINKEDIN_MAHNOOR,
  },
  {
    name: "Nayab Fatima",
    role: "Team Leader · Interviewer · Designer · Expert VA",
    start: "Joined during her final year of medical school.",
    outcome: "Rs 183,000",
    image: "/media/va-stories/nayab-portrait-v1.webp",
    linkedin: webinar.LINKEDIN_NAYAB,
  },
] as const;

export const storiesIntro = {
  eyebrow: "Real stories",
  heading: "Three paths into remote work.",
  body: "Where each woman started, and what she reports earning today.",
};

/** Legs of the career path, in drawing order. */
export const path = {
  eyebrow: "Your path",
  heading: "From webinar to paid role, drawn as you scroll.",
  legs: [
    {
      title: "Free live webinar",
      body: "One hour online to see the work, the training and the night shift.",
    },
    {
      title: "Qualification",
      body: "A short qualification step. Candidates who meet the criteria are invited to training.",
    },
    {
      title: "Training",
      body: "Your first month is training. It is unpaid, and it is where the skills are built.",
    },
    {
      title: "Paid role",
      body: "Paid roles follow successful training and assessment, on the full 6 PM to 3 AM shift.",
    },
  ],
};

export const requirements = {
  eyebrow: "Before you apply",
  heading: "Three things to know first.",
  fit: "For graduates, final-semester students, and homemakers ready for a long-term remote career and the full shift.",
  items: [
    {
      name: "Who can apply",
      value: "Women only",
      detail: "Good English, a laptop, and steady internet.",
      rings: 1,
    },
    {
      name: "Work hours",
      value: "6 PM – 3 AM",
      detail: "Pakistan time, the full shift, after training.",
      rings: 3,
      featured: true,
    },
    {
      name: "Training",
      value: "Month one",
      detail: "The first month of training is unpaid.",
      rings: 2,
    },
  ],
} as const;

/**
 * The agenda, told as the questions women ask and what the host covers live.
 * Replies describe the webinar's content only; they add no new claims.
 */
export const agenda = {
  eyebrow: "Webinar agenda",
  heading: "Your questions, answered live.",
  lead: "Five questions every woman asks before starting. In one free hour online, the founder answers each of them.",
  badge: "Preview",
  day: "What you'll hear live",
  replyNote: "Answered live in the webinar",
  closing: { strong: "Bring your own question", rest: " — there's time for yours too." },
  items: [
    { question: "What is remote VA work?", reply: "I'll show you the role, and the US healthcare accounts behind it." },
    { question: "Can I start without experience?", reply: "I'll explain exactly who the program is built for." },
    { question: "What does training involve?", reply: "You'll see what the first month of training asks of you." },
    { question: "How do hours and earnings work?", reply: "The shift requirements, and real individual outcomes." },
    { question: "What happens next?", reply: "How to apply, and what happens during qualification." },
  ],
} as const;

export const host = {
  name: "Afrasyab Ahmed",
  role: "Founder and CEO · Webinar host",
  image: "/media/about/about-founder-portrait-desktop-v2.webp",
  /** Head-and-shoulders crop of `image`, sized for the round avatars. */
  avatar: "/media/va-hero/host-avatar-v1.webp",
  /** [before, emphasis, after] */
  facts: [
    ["Every trainer, team leader and manager in the VA department is ", "a woman", "."],
    ["The company’s goal: ", "5,000 jobs", " for Pakistani women."],
  ],
} as const;

/** Contacts for webinar questions (the company's published details). */
export const contact = {
  email: "hiring@practiscale.com",
  phone: "+92 333 4000600",
  phoneHref: "tel:+923334000600",
  site: "practiscale.com",
  siteHref: "https://practiscale.com/",
};

export const faq = [
  ["Do I need experience?", "No. Most of our team started with no remote work experience."],
  ["I’m still studying. Can I join?", "Yes. Nayab joined in her final year of medical school."],
  [
    "What happens after the webinar?",
    "There’s a short qualification step. Candidates who meet the criteria are invited to training.",
  ],
  [
    "Is PractiScale a real company?",
    "PractiScale works with 500+ healthcare businesses in the US. You can review the company’s work at practiscale.com.",
  ],
  ["Is the first month unpaid?", "Yes. Paid roles follow successful training and assessment."],
] as const;
