import Link from "next/link";
import {
  appointmentSetterTrainingFormUrl,
  virtualAssistantTrainingFormUrl,
} from "@/lib/content";
import styles from "./training-program-page.module.css";

type Item = { title: string; body: string };
type Question = { question: string; answer: string };
type Program = {
  href: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  eyebrow: string;
  title: string;
  introduction: string;
  facts: string[];
  applyLink: string;
  premiseTitle: string;
  premiseBody: string;
  premiseBefore: string;
  premiseAfter: string;
  workTitle: string;
  workBody?: string;
  workItems: Item[];
  audience: string[];
  audienceLabels?: string[];
  audienceQualifier?: string;
  exclusion?: string;
  steps: Item[];
  quote?: {
    text: string;
    attribution: string;
    introduction: string;
    skills: string[];
    nextRole: string;
    earnings: string;
  };
  questions: Question[];
  closingTitle: string;
  other: { label: string; href: string };
};

export const trainingPrograms = {
  "appointment-setter": {
    href: "/training-programs/appointment-setter",
    seoTitle:
      "Appointment Setter Training and Jobs in Pakistan | Freshers Welcome",
    seoDescription:
      "Get trained in appointment setting for US healthcare accounts, then get hired onsite in Rawalpindi or Islamabad. No experience needed. Earn Rs 30,000 to Rs 200,000 monthly.",
    keywords: [
      "appointment setter jobs in Pakistan",
      "appointment setting training",
      "sales training in Pakistan",
      "jobs for freshers in Rawalpindi",
      "sales jobs in Islamabad",
    ],
    eyebrow: "Training and hiring program",
    title: "Appointment Setter Training and Hiring Program",
    introduction:
      "No experience? This is where you get it. Learn to open professional conversations with US healthcare contacts and book qualified meetings, then move into a paid role on our team.",
    facts: [
      "Freshers welcome",
      "Onsite in Rawalpindi or Islamabad",
      "Rs 30,000 to Rs 200,000 per month after hiring",
    ],
    applyLink: appointmentSetterTrainingFormUrl,
    premiseTitle: "Every job wants experience. Nobody wants to give it.",
    premiseBody:
      "Learn the work itself, then show what you can do in a real role assessment. Candidates who pass are offered a paid appointment setting role.",
    premiseBefore: "No prior sales experience",
    premiseAfter: "A skill you can demonstrate",
    workTitle: "The first conversation behind every introduction",
    workBody:
      "Appointment setters start the conversations our clients depend on. You reach the right professionals, confirm their interest and book the meeting. Every introduction PractiScale makes begins with this work.",
    workItems: [
      {
        title: "Professional outreach",
        body: "How to start a conversation with a busy healthcare professional.",
      },
      {
        title: "Qualifying",
        body: "How to tell a genuine fit from a polite no.",
      },
      {
        title: "Handling objections",
        body: "How to respond calmly, without pressure.",
      },
      {
        title: "Follow up",
        body: "How to stay consistent without becoming a nuisance.",
      },
      {
        title: "The US referral landscape",
        body: "Who discharge planners, case managers and social workers are, and why they matter.",
      },
      {
        title: "Tools and tracking",
        body: "How to log every conversation so nothing slips.",
      },
    ],
    audience: [
      "Fresh graduates who want a skill employers pay for.",
      "Career switchers from customer service, retail or call centers.",
      "Anyone who communicates clearly and wants to get better at it.",
    ],
    exclusion:
      "People looking only for a certificate. This program exists to train the people we plan to hire.",
    steps: [
      {
        title: "Apply",
        body: "Send your CV and a 60 second video on why you fit.",
      },
      {
        title: "Screen",
        body: "A short call to confirm fit and explain compensation.",
      },
      {
        title: "Train",
        body: "Learn through structured lessons, tests and practice.",
      },
      { title: "Assess", body: "Show what you learned in a real role test." },
      {
        title: "Start",
        body: "Join the team in a paid role, onsite in Rawalpindi or Islamabad.",
      },
    ],
    quote: {
      text: "Before you learn how to build a business, learn how to sell.",
      attribution: "Afrasyab Ahmed, Founder and CEO",
      introduction:
        "Learn to listen, qualify and follow up on real US healthcare accounts.",
      skills: ["Communication", "Confidence", "Persistence"],
      nextRole:
        "Our Closer roles require B2B sales experience. This is where that experience starts.",
      earnings: "Rs 3 to 8 lakh",
    },
    questions: [
      {
        question: "Do I need sales experience?",
        answer: "No. Freshers are welcome.",
      },
      {
        question: "Is there a job after training?",
        answer:
          "Yes. The program exists to hire. Candidates who pass the role assessment are offered a paid role on our team.",
      },
      {
        question: "Is this role remote?",
        answer:
          "No. Appointment setters work onsite in Rawalpindi or Islamabad.",
      },
      {
        question: "How much will I earn after hiring?",
        answer:
          "The earning range is Rs 30,000 to Rs 200,000 per month, depending on performance. Exact compensation is confirmed during your screening call.",
      },
      {
        question: "How do I apply?",
        answer:
          "Complete the application form or email your CV to hiring@practiscale.com.",
      },
    ],
    closingTitle: "Learn the skill. Then get paid to use it.",
    other: {
      label: "Virtual Assistant Program",
      href: "/training-programs/virtual-assistant",
    },
  },
  "virtual-assistant": {
    href: "/training-programs/virtual-assistant",
    seoTitle:
      "Work From Home Jobs for Women in Pakistan | Virtual Assistant Program",
    seoDescription:
      "A women only training and hiring program for remote virtual assistant roles on US healthcare accounts. Work from home and earn Rs 20,000 to Rs 150,000 per month.",
    keywords: [
      "work from home jobs for women in Pakistan",
      "online jobs for women in Pakistan",
      "virtual assistant jobs in Pakistan",
      "remote virtual assistant training",
    ],
    eyebrow: "Women Empowerment Program",
    title: "Virtual Assistant Training and Hiring Program for Women",
    introduction:
      "Professional, fully remote work on US healthcare accounts. We train you in the skills the role requires, then hire from the program.",
    facts: [
      "Women only",
      "Fully remote",
      "Rs 20,000 to Rs 150,000 per month after hiring",
    ],
    applyLink: virtualAssistantTrainingFormUrl,
    premiseTitle: "Ability was never the problem. Access was.",
    premiseBody:
      "For women in Pakistan, location can limit access to stable professional work. This program offers remote training and a path to paid work on US healthcare accounts.",
    premiseBefore: "Commuting limits access",
    premiseAfter: "Professional remote work",
    workTitle: "The work that keeps accounts running",
    workBody:
      "From verified research to clear reporting, the details you manage help US healthcare teams act with confidence.",
    workItems: [
      {
        title: "Research",
        body: "Find and verify healthcare professionals and organizations.",
      },
      {
        title: "Data and records",
        body: "Keep contact lists and account records accurate.",
      },
      {
        title: "Coordination",
        body: "Manage schedules, messages and follow ups.",
      },
      { title: "Reporting", body: "Prepare clear updates for the team." },
    ],
    audience: [
      "Graduates and students who want professional remote work.",
      "Women returning to work after a career break.",
      "Women who are organized, reliable and detail oriented.",
    ],
    audienceLabels: ["Starting out", "Returning to work", "Your strengths"],
    audienceQualifier: "Women only / Fully remote",
    steps: [
      {
        title: "Apply",
        body: "Send your CV and a 60 second video on why you fit.",
      },
      {
        title: "Screen",
        body: "A short call to confirm fit and explain compensation.",
      },
      {
        title: "Train",
        body: "Learn the tools and tasks through structured lessons and tests.",
      },
      { title: "Assess", body: "Complete a real role task." },
      { title: "Start", body: "Begin remote work on PractiScale accounts." },
    ],
    questions: [
      {
        question: "Is this program only for women?",
        answer: "Yes. It is part of our Women Empowerment Program.",
      },
      {
        question: "Is there a job after training?",
        answer:
          "Yes. The program exists to hire. Candidates who pass the role assessment are offered a paid remote role.",
      },
      {
        question: "Do I need to come to an office?",
        answer:
          "No. The role is fully remote. You will need a reliable device and internet connection.",
      },
      {
        question: "Do I need experience?",
        answer: "No prior virtual assistant experience is required.",
      },
      {
        question: "How much will I earn after hiring?",
        answer:
          "The earning range is Rs 20,000 to Rs 150,000 per month, depending on performance. Exact compensation is confirmed during your screening call.",
      },
      {
        question: "How do I apply?",
        answer:
          "Complete the application form or email your CV to hiring@practiscale.com.",
      },
    ],
    closingTitle: "Build a professional career from home.",
    other: {
      label: "Appointment Setter Program",
      href: "/training-programs/appointment-setter",
    },
  },
} satisfies Record<string, Program>;

export type TrainingProgramSlug = keyof typeof trainingPrograms;

function Answer({ text, applyLink }: { text: string; applyLink: string }) {
  return text
    .split(/(application form|hiring@practiscale\.com)/g)
    .map((part, i) => {
      if (part === "application form")
        return (
          <a key={i} href={applyLink} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      if (part === "hiring@practiscale.com")
        return (
          <a key={i} href="mailto:hiring@practiscale.com">
            {part}
          </a>
        );
      return part;
    });
}

export default function TrainingProgramPage({ program }: { program: Program }) {
  const isAppointmentSetter = program.href.endsWith("appointment-setter");
  const visualSteps = isAppointmentSetter
    ? ["Open", "Qualify", "Book"]
    : ["Research", "Organize", "Support"];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: program.questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="program-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>{program.eyebrow}</span>
            <h1 id="program-title">{program.title}</h1>
            <p>{program.introduction}</p>
            <a
              className={styles.action}
              href={program.applyLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply for the Program <span aria-hidden="true">↗</span>
            </a>
          </div>
          <ul className={styles.facts} aria-label="Program facts">
            {program.facts.map((fact, i) => (
              <li key={fact}>
                <span>0{i + 1}</span>
                {fact}
              </li>
            ))}
          </ul>
          <div
            className={`${styles.visual} ${isAppointmentSetter ? styles.visualSetter : styles.visualAssistant}`}
            aria-hidden="true"
          >
            <div className={styles.visualTop}>
              <span>
                {isAppointmentSetter
                  ? "APPOINTMENT SETTING / THE WORK"
                  : "VIRTUAL ASSISTANT / THE WORK"}
              </span>
              <span>{isAppointmentSetter ? "ONSITE" : "REMOTE"}</span>
            </div>
            <div className={styles.scene}>
              <div className={styles.sceneHeading}>
                <span>{isAppointmentSetter ? "FROM FIRST CONTACT" : "REMOTE ACCOUNT SUPPORT"}</span>
                <strong>
                  {isAppointmentSetter ? (
                    <>A conversation becomes a <em>qualified meeting.</em></>
                  ) : (
                    <>The details keep <em>work moving.</em></>
                  )}
                </strong>
              </div>
              <ol className={styles.sceneSteps}>
                {visualSteps.map((step, i) => (
                  <li key={step}>
                    <span>0{i + 1}</span>
                    <strong>{step}</strong>
                  </li>
                ))}
              </ol>
              <p className={styles.sceneOutcome}>
                <span aria-hidden="true" />
                {isAppointmentSetter ? "Qualified introduction booked" : "US healthcare account supported"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.premise} aria-labelledby="program-premise">
        <div className={styles.premiseInner}>
          <div className={styles.premiseIntro}>
            <span className={styles.eyebrow}>The starting point</span>
            <h2 id="program-premise">{program.premiseTitle}</h2>
          </div>
          <div className={styles.premiseResponse}>
            <span className={styles.premiseResponseLabel}>
              What changes here
            </span>
            <p>{program.premiseBody}</p>
            <div className={styles.premiseShift}>
              <div>
                <span>Starting point</span>
                <p>{program.premiseBefore}</p>
              </div>
              <div>
                <span>What you build</span>
                <strong>{program.premiseAfter}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.work} aria-labelledby="program-work">
        <div className={styles.split}>
          <div className={styles.workIntro}>
            <span className={styles.eyebrow}>The real work</span>
            <h2 id="program-work">{program.workTitle}</h2>
            {program.workBody && <p>{program.workBody}</p>}
          </div>
          <div className={styles.workList}>
            <span className={styles.listLabel}>
              {program.href.endsWith("appointment-setter")
                ? "What you will learn"
                : "What you will do"}
            </span>
            <ol>
              {program.workItems.map((item, i) => (
                <li key={item.title}>
                  <span className={styles.number}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className={`${styles.audience} ${program.exclusion ? styles.audienceWithNote : ""} ${program.audienceLabels ? styles.audienceLabeled : ""}`}
        aria-labelledby="program-audience"
      >
        <div className={`${styles.split} ${styles.audienceGrid}`}>
          <div className={styles.audienceLead}>
            <div>
              <span className={styles.eyebrow}>The right fit</span>
              <h2 id="program-audience">Who this program is for</h2>
            </div>
            {program.audienceQualifier && (
              <p className={styles.audienceQualifier}>{program.audienceQualifier}</p>
            )}
          </div>
          <div className={styles.audienceList}>
            <ul>
              {program.audience.map((person, index) => (
                <li key={person}>
                  {program.audienceLabels ? (
                    <span className={styles.audienceDescriptor}>
                      {program.audienceLabels[index]}
                    </span>
                  ) : (
                    <span className={styles.audienceNumber} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span>{person}</span>
                </li>
              ))}
            </ul>
          </div>
          {program.exclusion && (
            <p className={styles.exclusion}>
              <strong>Not for:</strong> {program.exclusion}
            </p>
          )}
        </div>
      </section>

      <section className={styles.process} aria-labelledby="program-process">
        <div className={styles.processInner}>
          <div className={styles.processLead}>
            <span className={styles.eyebrow}>
              From application to paid work
            </span>
            <h2 id="program-process">How the program works</h2>
          </div>
          <ol className={styles.steps}>
            {program.steps.map((step, i) => (
              <li key={step.title}>
                <span className={styles.stepNumber}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {program.quote && (
        <section className={styles.outcome} aria-labelledby="program-outcome">
          <div className={styles.outcomeInner}>
            <header className={styles.outcomeHead}>
              <div>
                <span className={styles.eyebrow}>Where it leads</span>
                <h2 id="program-outcome">The first step in a sales career</h2>
              </div>
              <p>{program.quote.introduction}</p>
            </header>

            <div className={styles.careerPath}>
              <div className={styles.pathStage}>
                <span className={styles.pathLabel}>Start here</span>
                <h3>Appointment setting</h3>
                <p>Start professional conversations and book qualified meetings.</p>
                <ul className={styles.pathSkills} aria-label="Skills you build">
                  {program.quote.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.pathConnector} aria-hidden="true">
                <span>→</span>
              </div>
              <div className={styles.pathStage}>
                <span className={styles.pathLabel}>A path ahead</span>
                <h3>Closer roles</h3>
                <p>{program.quote.nextRole}</p>
                <div className={styles.pathEarnings}>
                  <span>Individual closer earnings</span>
                  <strong>{program.quote.earnings} / month</strong>
                  <p className={styles.pathEarningsNote}>
                    These are individual results, not typical or guaranteed
                    monthly earnings. What you earn depends on your role, skill,
                    effort and performance.
                  </p>
                </div>
                <Link className={styles.textLink} href="/jobs#sales">
                  Explore sales roles <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>

            <div className={styles.outcomeFoot}>
              <blockquote>
                <p>“{program.quote.text}”</p>
                <footer>{program.quote.attribution}</footer>
              </blockquote>
            </div>
          </div>
        </section>
      )}

      <section className={styles.faq} aria-labelledby="program-faq">
        <div className={styles.split}>
          <div>
            <span className={styles.eyebrow}>Good to know</span>
            <h2 id="program-faq">Questions before you apply</h2>
          </div>
          <div className={styles.faqList}>
            {program.questions.map((item, i) => (
              <details key={item.question}>
                <summary>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{item.question}</strong>
                  <b aria-hidden="true">+</b>
                </summary>
                <p>
                  <Answer text={item.answer} applyLink={program.applyLink} />
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="program-closing">
        <div className={styles.closingInner}>
          <div className={styles.closingIntro}>
            <span className={styles.eyebrow}>Your next move</span>
            <h2 id="program-closing">{program.closingTitle}</h2>
          </div>
          <div className={styles.closingPanel}>
            <p>Send your CV and a 60 second video on why you fit.</p>
            <a
              className={styles.action}
              href={program.applyLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply for the Program <span aria-hidden="true">↗</span>
            </a>
            <Link
              className={styles.closingAlternative}
              href={program.other.href}
            >
              Explore the {program.other.label}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
