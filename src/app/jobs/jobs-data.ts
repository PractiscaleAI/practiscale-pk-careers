export type JobTeam =
  "Sales" | "Creative" | "Technology" | "People and Operations";
export type WorkMode = "Remote" | "Onsite" | "Hybrid";

export type JobRole = {
  title: string;
  team: JobTeam;
  mode: string;
  modes: WorkMode[];
  experience: string;
  earnings: string;
  summary: string;
  duties: string;
  requirements: string;
};

export const jobTeams: { id: string; name: JobTeam; short: string }[] = [
  { id: "sales", name: "Sales", short: "Sales" },
  { id: "creative", name: "Creative", short: "Creative" },
  { id: "technology", name: "Technology", short: "Technology" },
  {
    id: "operations",
    name: "People and Operations",
    short: "People & Operations",
  },
];

export const jobRoles: JobRole[] = [
  {
    title: "Remote Closer",
    team: "Sales",
    mode: "Remote",
    modes: ["Remote"],
    experience: "2 to 3 years in B2B sales",
    earnings: "Rs 3 to 8 lakh",
    summary:
      "Speak with US healthcare business owners and help them decide if our referral partner service fits their growth plans.",
    duties:
      "Run sales calls with qualified US prospects, answer questions honestly and close new clients.",
    requirements:
      "Confident spoken English, a track record in B2B sales and the discipline to work remotely.",
  },
  {
    title: "Onsite Closer",
    team: "Sales",
    mode: "Onsite, Rawalpindi or Islamabad",
    modes: ["Onsite"],
    experience: "2 to 3 years in B2B sales",
    earnings: "Rs 3 to 8 lakh",
    summary: "The same closing role, working alongside our sales floor.",
    duties:
      "Run sales calls with qualified US prospects and close new clients.",
    requirements: "Confident spoken English and a track record in B2B sales.",
  },
  {
    title: "Graphic Designer",
    team: "Creative",
    mode: "Hybrid",
    modes: ["Hybrid"],
    experience: "Portfolio required",
    earnings: "Rs 30,000 to Rs 200,000",
    summary: "Design the visuals behind PractiScale in the US and Pakistan.",
    duties:
      "Create social posts, carousels, ads, presentations and website graphics.",
    requirements:
      "A strong portfolio, clean layout skills and the ability to follow a brand system.",
  },
  {
    title: "Video Editor",
    team: "Creative",
    mode: "Hybrid",
    modes: ["Hybrid"],
    experience: "Portfolio required",
    earnings: "Rs 30,000 to Rs 200,000",
    summary: "Edit the videos that tell the PractiScale story.",
    duties: "Edit short form videos, founder content, testimonials and ads.",
    requirements:
      "A portfolio of edited work, a sense of pacing and fast turnaround.",
  },
  {
    title: "Script Writer",
    team: "Creative",
    mode: "Hybrid",
    modes: ["Hybrid"],
    experience: "Portfolio required",
    earnings: "Rs 30,000 to Rs 200,000",
    summary: "Write the words behind our videos and content.",
    duties: "Write scripts for short videos, ads and founder content.",
    requirements:
      "Writing samples that are clear, specific and natural to say out loud.",
  },
  {
    title: "AI Engineer",
    team: "Technology",
    mode: "Onsite or remote",
    modes: ["Onsite", "Remote"],
    experience: "Shared during the screening call",
    earnings: "Shared during the screening call",
    summary:
      "Build the AI systems behind our training, quality and operations.",
    duties:
      "Develop and improve AI tools for training, call scoring and internal workflows.",
    requirements:
      "Hands on experience building with AI models and APIs, and examples of shipped work.",
  },
  {
    title: "CRM and AI Expert",
    team: "Technology",
    mode: "Onsite or remote",
    modes: ["Onsite", "Remote"],
    experience: "1 to 2 years in IT",
    earnings: "Rs 50,000 to Rs 300,000",
    summary:
      "Keep the CRM and automation systems the company runs on working smoothly.",
    duties:
      "Build pipelines and automations, maintain data quality and support teams using the CRM.",
    requirements:
      "Experience with CRM platforms and automation, and a problem solving mindset.",
  },
  {
    title: "WordPress Developer",
    team: "Technology",
    mode: "Onsite or remote",
    modes: ["Onsite", "Remote"],
    experience: "Shared during the screening call",
    earnings: "Shared during the screening call",
    summary: "Build and maintain our WordPress websites.",
    duties:
      "Build pages, update layouts, improve speed and keep our sites secure.",
    requirements:
      "Experience with WordPress and Elementor, and live websites you can show us.",
  },
  {
    title: "Web Developer",
    team: "Technology",
    mode: "Onsite or remote",
    modes: ["Onsite", "Remote"],
    experience: "Shared during the screening call",
    earnings: "Shared during the screening call",
    summary:
      "Build the web apps and internal tools behind our hiring, training and operations.",
    duties:
      "Develop and maintain web applications, dashboards and internal portals.",
    requirements:
      "Experience with modern web frameworks and projects you can walk us through.",
  },
  {
    title: "Onsite HR Recruiter",
    team: "People and Operations",
    mode: "Onsite, Rawalpindi or Islamabad",
    modes: ["Onsite"],
    experience: "Freshers welcome",
    earnings: "Rs 30,000 to Rs 100,000",
    summary: "Find the next people to join our growing teams.",
    duties: "Source, screen and schedule candidates.",
    requirements: "Strong communication and good judgment about people.",
  },
  {
    title: "Remote HR Recruiter",
    team: "People and Operations",
    mode: "Remote, project based",
    modes: ["Remote"],
    experience: "Recruitment experience preferred",
    earnings: "Rs 30,000 to Rs 100,000",
    summary: "Recruit for our teams remotely, on a project basis.",
    duties: "Source and screen candidates for open roles.",
    requirements:
      "Organized, responsive and comfortable working independently.",
  },
  {
    title: "Associate Manager",
    team: "People and Operations",
    mode: "Onsite",
    modes: ["Onsite"],
    experience: "1 to 2 years in customer support. Women only",
    earnings: "Rs 30,000 to Rs 200,000",
    summary: "Support team members and keep daily operations on track.",
    duties:
      "Coordinate daily work, support team members and resolve issues quickly.",
    requirements:
      "Customer support experience, calm under pressure and a willingness to lead.",
  },
];
