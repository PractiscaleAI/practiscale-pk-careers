/**
 * Every word on the /virtual-assistent page. Event specifics (date, time,
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
  title: "From home",
  srTitle: "Start a remote VA career ",
  kicker: "Free live webinar · for women in Pakistan",
  veil: "Scroll to begin your shift",
  route: "Pakistan ⇄ United States · Remote",
};

export const intro = {
  eyebrow: "Start here",
  heading: "Start a remote VA career from home.",
  body: "See what Virtual Assistants do, how training works, and what the night shift requires. Then join the free live webinar.",
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
      when: "Hour 1",
      title: "Free live webinar",
      body: "One hour online to see the work, the training and the night shift.",
    },
    {
      when: "Next",
      title: "Qualification",
      body: "A short qualification step. Candidates who meet the criteria are invited to training.",
    },
    {
      when: "Month 1",
      title: "Training",
      body: "Your first month is training. It is unpaid, and it is where the skills are built.",
    },
    {
      when: "After training",
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

export const agenda = {
  eyebrow: "Webinar agenda",
  heading: "One hour. Five answers.",
  items: [
    ["00", "What is remote VA work?", "See the role and the US healthcare accounts behind it."],
    ["12", "Can I start without experience?", "Understand who the program is built for."],
    ["24", "What does training involve?", "Learn what the first month of training asks of you."],
    ["36", "How do hours and earnings work?", "Hear the shift requirements and real individual outcomes."],
    ["48", "What happens next?", "Know how to apply and what happens during qualification."],
  ],
} as const;

export const host = {
  name: "Afrasyab Ahmed",
  role: "Founder and CEO · Webinar host",
  image: "/media/about/about-founder-portrait-desktop-v2.webp",
  notes: [
    "Every trainer, team leader, and manager in the VA department is a woman.",
    "5,000 jobs for Pakistani women is the company’s goal.",
  ],
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
