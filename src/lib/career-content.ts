export type CareerChapter = {
  id: string;
  path: 1 | 2;
  pathLabel: string;
  eligibility: string;
  title: string;
  supporting?: string;
  body: string;
  location?: string;
  earnings?: string;
  cta: string;
  href: string;
  bridge?: string;
  visualLabel: string;
};

export const careerChapters: readonly CareerChapter[] = [
  {
    id: "training",
    path: 1,
    pathLabel: "Path 1 of 2 · Start with training",
    eligibility: "No experience needed",
    title: "Training Programs",
    body: "Start with training. Learn the skill, pass the role assessment and move into a paid role on our team or our clients' accounts.",
    cta: "View Training Programs",
    href: "/training-programs/appointment-setter",
    visualLabel: "Skills taking shape",
  },
  {
    id: "jobs",
    path: 2,
    pathLabel: "Path 2 of 2 · Bring your experience",
    eligibility: "For experienced professionals",
    title: "Jobs",
    body: "Bring your experience in sales, design, video, development, AI, recruitment or operations. Apply directly for an open role.",
    cta: "See Open Jobs",
    href: "/jobs",
    visualLabel: "A connected team",
  },
];

// Destination page details are separate from the two homepage path cards.
export const careerPrograms: readonly CareerChapter[] = [
  {
    id: "setter",
    path: 1,
    pathLabel: "Path 1 of 2 · Training",
    eligibility: "Freshers welcome",
    title: "Appointment Setter Program",
    body: "Learn to start professional conversations with US healthcare contacts and book qualified meetings.",
    location: "Onsite in Rawalpindi or Islamabad",
    earnings: "Rs 30,000–200,000",
    cta: "Explore the Setter Program",
    href: "/training-programs/appointment-setter",
    visualLabel: "Conversations become connections",
  },
  {
    id: "va",
    path: 1,
    pathLabel: "Path 1 of 2 · Training",
    eligibility: "Women Empowerment Program",
    title: "Virtual Assistant Program",
    body: "Learn the research, coordination, and support work behind US healthcare accounts. Part of our Women Empowerment Program.",
    location: "Fully remote",
    earnings: "Rs 20,000–150,000",
    cta: "Explore the VA Program",
    href: "/training-programs/virtual-assistant",
    visualLabel: "Connected, wherever you work",
  },
];

export const careerMotion = {
  holds: [0.1, 0.9],
  exchange: [0.2, 0.8],
  travelScreens: 1.8,
  scrub: 0.4,
} as const;

export const clamp = (n: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, n));
export const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};

export function careerFrame(progress: number) {
  const exchange = clamp(
    (progress - careerMotion.exchange[0]) /
      (careerMotion.exchange[1] - careerMotion.exchange[0]),
  );
  return {
    exchange,
    chapter: exchange < 0.5 ? 0 : 1,
    morph: smooth(exchange),
    dispersion: Math.sin(exchange * Math.PI) ** 2,
  };
}

export type CareerFrame = ReturnType<typeof careerFrame>;
