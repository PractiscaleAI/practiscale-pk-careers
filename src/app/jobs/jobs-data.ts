export type JobTeam = "Sales" | "Media" | "Operations";
export type WorkMode = "Remote" | "Onsite";

export type JobRole = {
  title: string;
  team: JobTeam;
  mode: WorkMode;
  experience: string;
  earnings: string;
  summary: string;
  duties: string;
  requirements: string;
  applyUrl: string;
  schedule?: string;
};

export const jobTeams: { id: string; name: JobTeam; short: string }[] = [
  { id: "sales", name: "Sales", short: "Sales" },
  { id: "media", name: "Media", short: "Media" },
  { id: "operations", name: "Operations", short: "Operations" },
];

const salesForms = {
  onsiteCloser:
    "https://docs.google.com/forms/d/e/1FAIpQLSeRjN3wxPGVbLnqgEMONaZL-ma5KxsyMo94R-CDkIBgwqXwDQ/viewform",
  onsiteSetter:
    "https://docs.google.com/forms/d/e/1FAIpQLSfY-KNuiBVQWo5ZCGNvg4KFZWHLku8zcieyJnt6e7Eng_ppTw/viewform",
  remoteSetter:
    "https://docs.google.com/forms/d/e/1FAIpQLSchmjp3-kiZUvu0b2EotiH8nm8dqPnROuwN5qOzzGQXSERZQg/viewform",
  remoteCloser:
    "https://docs.google.com/forms/d/e/1FAIpQLSf0Isf_bbOa6Tt0ntPcX9Pj_JrrX3QEZElx5e3VBjC9ExWokw/viewform",
};
const mediaForm =
  "https://docs.google.com/forms/d/e/1FAIpQLSdnu6NQ0gvWKLKgGrS1zUbi_GKyWCLSn35ATJchiUszKiVBEg/viewform";
const operationsForm =
  "https://docs.google.com/forms/d/e/1FAIpQLScvwNjI0FKQAH2pdhy5-Ig6Gob9NHxEBX-QfGa39PNaiinffA/viewform";

export const jobRoles: JobRole[] = [
  {
    title: "Onsite Appointment Setter",
    team: "Sales",
    mode: "Onsite",
    experience: "Freshers welcome",
    earnings: "Up to PKR 100,000 + performance incentives",
    schedule: "6 PM to 3 AM PKT",
    summary:
      "Start conversations with potential US healthcare clients and book qualified meetings.",
    duties:
      "Contact leads, handle objections, qualify prospects and book appointments for the sales team.",
    requirements:
      "Strong spoken English. Sales or call center experience is a plus.",
    applyUrl: salesForms.onsiteSetter,
  },
  {
    title: "Onsite Sales Closer",
    team: "Sales",
    mode: "Onsite",
    experience: "Minimum 2 years in sales or closing",
    earnings: "Up to PKR 700,000 based on performance",
    schedule: "6 PM to 3 AM PKT",
    summary: "Turn qualified conversations into new client relationships.",
    duties:
      "Lead qualified calls, understand client needs, present the service, handle objections and close.",
    requirements:
      "Strong English, listening and negotiation skills. International client or service sales experience is preferred.",
    applyUrl: salesForms.onsiteCloser,
  },
  {
    title: "Remote Appointment Setter",
    team: "Sales",
    mode: "Remote",
    experience: "Freshers welcome",
    earnings: "Up to PKR 100,000 + performance incentives",
    schedule: "6 PM to 3 AM PKT",
    summary: "Qualify prospects and book meetings from a remote workspace.",
    duties:
      "Reach out to leads, handle objections, qualify their interest and schedule sales conversations.",
    requirements: "Strong spoken English. Sales experience is a plus.",
    applyUrl: salesForms.remoteSetter,
  },
  {
    title: "Remote Sales Closer",
    team: "Sales",
    mode: "Remote",
    experience: "Minimum 3 years in sales or closing",
    earnings: "Up to PKR 700,000 based on performance",
    schedule: "6 PM to 3 AM PKT",
    summary: "Close qualified opportunities while working remotely.",
    duties:
      "Run sales calls, identify needs, present the service, manage objections and negotiate agreements.",
    requirements:
      "Proven closing record, strong English, a laptop, stable internet and a quiet workspace. International client or service sales experience is preferred.",
    applyUrl: salesForms.remoteCloser,
  },
  {
    title: "Copywriter",
    team: "Media",
    mode: "Onsite",
    experience: "1 to 2 years",
    earnings: "PKR 50,000 to 100,000 + performance bonuses",
    summary: "Write clear, engaging copy for PractiScale's media channels.",
    duties:
      "Write video scripts, social captions, advertising copy and founder content.",
    requirements: "Strong writing, clear hooks and relevant writing samples.",
    applyUrl: mediaForm,
  },
  {
    title: "Female Content Creator",
    team: "Media",
    mode: "Onsite",
    experience: "6 months to 1 year",
    earnings: "PKR 25,000 to 50,000 + bonuses and incentives",
    summary: "Create on-camera content with the media team.",
    duties:
      "Develop ideas, present on camera and create reels and brand videos.",
    requirements:
      "Confident on-camera delivery, creativity and sample content.",
    applyUrl: mediaForm,
  },
  {
    title: "Videographer",
    team: "Media",
    mode: "Onsite",
    experience: "1 to 2 years",
    earnings: "PKR 50,000 to 100,000 + bonuses and incentives",
    summary: "Capture the people, places and stories behind PractiScale.",
    duties:
      "Film interviews, office content, events and promotions; manage lighting, audio and footage.",
    requirements:
      "Camera, lighting and audio skills with a relevant portfolio.",
    applyUrl: mediaForm,
  },
  {
    title: "Social Media Manager",
    team: "Media",
    mode: "Onsite",
    experience: "1 to 2 years",
    earnings: "PKR 30,000 to 70,000 + performance bonuses",
    summary: "Keep our social channels consistent and responsive.",
    duties:
      "Manage content calendars, publishing and community responses; track results.",
    requirements:
      "Social platform knowledge, organization and reporting skills.",
    applyUrl: mediaForm,
  },
  {
    title: "Content Strategist",
    team: "Media",
    mode: "Onsite",
    experience: "2 to 5 years",
    earnings: "PKR 40,000 to 150,000 + performance bonuses",
    summary: "Shape content around audience needs and measurable results.",
    duties:
      "Plan themes, campaigns and briefs; research audiences and use performance data to guide content.",
    requirements: "Content planning, audience research and analytical skills.",
    applyUrl: mediaForm,
  },
  {
    title: "Video Editor",
    team: "Media",
    mode: "Onsite",
    experience: "1 to 3 years",
    earnings: "PKR 40,000 to 200,000 + performance bonuses",
    summary: "Turn raw footage into clear, compelling stories.",
    duties:
      "Edit reels, interviews, testimonials and ads with effective pacing, audio, captions and motion graphics where needed.",
    requirements:
      "Editing portfolio, attention to detail and reliable turnaround.",
    applyUrl: mediaForm,
  },
  {
    title: "Graphic Designer",
    team: "Media",
    mode: "Onsite",
    experience: "1 to 3 years",
    earnings: "PKR 30,000 to 100,000 + performance bonuses",
    summary:
      "Design coherent visuals for PractiScale's campaigns and channels.",
    duties:
      "Create social posts, carousels, advertising visuals and other branded designs.",
    requirements:
      "Strong portfolio, typography and layout skills, and consistent use of brand guidelines.",
    applyUrl: mediaForm,
  },
  {
    title: "CRM + AI Expert",
    team: "Operations",
    mode: "Remote",
    experience: "Minimum 2 years",
    earnings: "PKR 70,000 to 150,000 + performance bonuses",
    summary:
      "Improve the systems that support leads, follow-ups and internal work.",
    duties:
      "Build and optimize CRM workflows and automations, and integrate AI tools and third-party platforms.",
    requirements:
      "Hands-on GoHighLevel, CRM workflows, automation, APIs or webhooks and AI integrations. n8n, Make or Zapier is a plus.",
    applyUrl: operationsForm,
  },
  {
    title: "IT Support Executive",
    team: "Operations",
    mode: "Onsite",
    experience: "1 to 2 years",
    earnings: "PKR 30,000 to 80,000",
    summary: "Keep our office systems reliable for the team.",
    duties:
      "Troubleshoot hardware, software and network issues; maintain systems and servers.",
    requirements:
      "Hardware, networking, server management, configuration, backups and general IT support knowledge.",
    applyUrl: operationsForm,
  },
  {
    title: "Onsite HR Recruiter",
    team: "Operations",
    mode: "Onsite",
    experience: "Freshers welcome",
    earnings: "PKR 30,000 to 100,000 + performance incentives",
    summary: "Help the right people find the right roles at PractiScale.",
    duties:
      "Manage postings, screening, interview coordination, follow-ups and hiring records.",
    requirements:
      "Good communication and interpersonal skills, basic English and candidate coordination.",
    applyUrl: operationsForm,
  },
  {
    title: "Full-Stack Marketer",
    team: "Operations",
    mode: "Onsite",
    experience: "3 to 5 years",
    earnings: "PKR 100,000 to 250,000 + performance bonuses",
    summary:
      "Own the marketing strategy from research through measurable growth.",
    duties:
      "Lead ICP research, positioning, offers, acquisition, funnels, CRM automation, conversion and performance analysis.",
    requirements:
      "B2B marketing, paid media, funnels, CRM, analytics and revenue attribution. US-market experience is preferred.",
    applyUrl: operationsForm,
  },
  {
    title: "Remote HR Recruiter",
    team: "Operations",
    mode: "Remote",
    experience: "Freshers welcome",
    earnings: "PKR 30,000 to 100,000 + performance incentives",
    summary: "Support recruiting remotely from Rawalpindi or Islamabad.",
    duties:
      "Source and screen candidates, coordinate interviews, follow up and maintain pipelines.",
    requirements:
      "Based in Rawalpindi or Islamabad, with good interpersonal skills and basic English.",
    applyUrl: operationsForm,
  },
];
