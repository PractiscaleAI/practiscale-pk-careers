import type { Metadata } from "next";
import Image from "next/image";
import { webinar, webinarDate, webinarTime } from "@/config/webinar";
import WebinarEffects from "./webinar-effects";
import WebinarForm from "./webinar-form";
import styles from "./webinar.module.css";

const workspaceDesktop = "/media/va-webinar/home-workspace-desktop-v1.webp";
const workspaceMobile = "/media/va-webinar/home-workspace-mobile-v1.webp";
const shiftHours = "6 PM to 3 AM PKT";

export const metadata: Metadata = {
  title: {
    absolute:
      "Free live webinar: start a remote VA career from home | PractiScale",
  },
  description:
    "Explore a remote Virtual Assistant career with PractiScale. Learn about the work, training, 6 PM to 3 AM hours, and the first unpaid training month at our free live webinar.",
  alternates: { canonical: "/virtual-assistent" },
  openGraph: {
    title: "Start a remote VA career from home | PractiScale webinar",
    description:
      "A free, live, one-hour webinar on the Virtual Assistant career path at PractiScale.",
    type: "website",
    url: "/virtual-assistent",
    images: [workspaceDesktop],
  },
};

const requirements = [
  [
    "Who can apply",
    "Women only",
    "Good English, a laptop, and steady internet.",
  ],
  ["Work hours", shiftHours, "Full-shift availability after training."],
  ["Training", "First month", "The first month of training is unpaid."],
] as const;

const stories = [
  {
    name: "Kanwal Fayaz",
    shortName: "Kanwal",
    role: "Virtual Assistant",
    start: "Returned to work after time as a homemaker.",
    outcome: "Rs 113,000",
    linkedin: webinar.LINKEDIN_KANWAL,
  },
  {
    name: "Mahnoor Naeem",
    shortName: "Mahnoor",
    role: "Team Leader",
    start: "Joined with no remote experience and became a team leader.",
    outcome: "Rs 189,000",
    linkedin: webinar.LINKEDIN_MAHNOOR,
  },
  {
    name: "Nayab Fatima",
    shortName: "Nayab",
    role: "Team Leader · Interviewer · Designer · Expert VA",
    start: "Joined during her final year of medical school.",
    outcome: "Rs 183,000",
    linkedin: webinar.LINKEDIN_NAYAB,
  },
] as const;

const chapters = [
  ["stories", "Stories"],
  ["agenda", "Agenda"],
  ["requirements", "Requirements"],
  ["webinar-faq", "FAQ"],
  ["reserve", "Register"],
] as const;

const agenda = [
  [
    "00",
    "What is remote VA work?",
    "See the role and the US healthcare accounts behind it.",
  ],
  [
    "12",
    "Can I start without experience?",
    "Understand who the program is built for.",
  ],
  [
    "24",
    "What does training involve?",
    "Learn what the first month of training asks of you.",
  ],
  [
    "36",
    "How do hours and earnings work?",
    "Hear the shift requirements and real individual outcomes.",
  ],
  [
    "48",
    "What happens next?",
    "Know how to apply and what happens during qualification.",
  ],
] as const;

const companyMetrics = [
  ["500+", "US healthcare clients"],
  ["100%", "Women-led VA department"],
  ["5,000", "Jobs for Pakistani women, our goal"],
  ["2025", "Year PractiScale started"],
] as const;

const agendaRoute = "M24 83 C78 78 90 18 155 38 S218 93 293 40";

export default function VirtualAssistentWebinarPage() {
  return (
    <div className={styles.page} data-webinar-page>
      <WebinarEffects />
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <a
            className={styles.brandLink}
            href="/"
            aria-label="PractiScale home"
          >
            <Image
              src="/brand/logos/practiscale-logo-reversed.png"
              alt="PractiScale"
              width={272}
              height={86}
              preload
              className={styles.brandLogo}
            />
          </a>
          <nav
            className={styles.chapterNav}
            aria-label="Webinar sections"
            data-webinar-chapters
          >
            {chapters.map(([id, label]) => (
              <a key={id} href={"#" + id}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main">
        <section
          id="top"
          className={styles.hero}
          aria-labelledby="webinar-title"
          data-webinar-hero
        >
          <div className={styles.heroStage} data-webinar-stage>
            <div className={styles.heroArt} aria-hidden="true">
              <picture className={styles.workScene}>
                <source media="(max-width: 680px)" srcSet={workspaceMobile} />
                <img
                  src={workspaceDesktop}
                  alt=""
                  width={1440}
                  height={960}
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
              <div className={styles.windowLight} />
              <div className={styles.nearEdge} />
            </div>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>
                Free live webinar for <span>women in Pakistan</span>
              </p>
              <h1 id="webinar-title">
                Start a remote VA career <em>from home.</em>
              </h1>
              <p className={styles.lead}>
                See what Virtual Assistants do, how training works, and what the
                night shift requires.
              </p>
              <div className={styles.heroMeta}>
                <p>
                  Online <span aria-hidden="true">·</span> 60 minutes{" "}
                  <span aria-hidden="true">·</span> {webinarDate}
                </p>
                {webinar.TIME && <p>Webinar time: {webinarTime} PKT</p>}
                <p className={styles.shiftHours}>
                  After training <span aria-hidden="true">·</span> {shiftHours}
                </p>
              </div>
              <div className={styles.actions}>
                <a
                  className={styles.primaryAction}
                  href={webinar.FORM_ENDPOINT ? "#reserve" : "#event-details"}
                >
                  {webinar.FORM_ENDPOINT
                    ? "Reserve my free seat"
                    : "See webinar details"}{" "}
                  <span aria-hidden="true">↗</span>
                </a>
                <a className={styles.secondaryAction} href="#stories">
                  Explore the stories <span aria-hidden="true">↓</span>
                </a>
              </div>
              {webinar.VSL_URL && (
                <a
                  className={styles.textLink}
                  href={webinar.VSL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch Afrasyab Ahmed explain it{" "}
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>
        </section>

        <section
          className={styles.storiesSection}
          id="stories"
          aria-labelledby="stories-title"
          data-webinar-stories
          data-webinar-wash
        >
          <div className={styles.split}>
            <div>
              <p className={styles.kicker}>Real stories</p>
              <h2 id="stories-title">
                Three paths
                <br className={styles.storyBreak} /> into remote work.
              </h2>
              <p className={styles.lead}>
                See where each woman started and what she reports earning today.
              </p>
            </div>
            <div data-story-reel>
              <div className={styles.reelWindow}>
                <div className={styles.reelTrack} data-story-track>
                  {stories.map((story, index) => (
                    <article
                      className={styles.story}
                      key={story.name}
                      data-story-card
                    >
                      <p className={styles.storyChapter}>
                        Path {String(index + 1).padStart(2, "0")} / 03
                      </p>
                      <h3>{story.name}</h3>
                      <p className={styles.storyRole}>{story.role}</p>
                      <div className={styles.storyJourney}>
                        <div>
                          <span className={styles.storyLabel}>Started</span>
                          <p className={styles.storyStart}>{story.start}</p>
                        </div>
                        <div>
                          <span className={styles.storyLabel}>Now</span>
                          <strong className={styles.earnings}>
                            {story.outcome}
                          </strong>
                          <p className={styles.disclaimer}>
                            Per month · Self-reported individual result
                          </p>
                        </div>
                      </div>
                      {story.linkedin && (
                        <a
                          href={story.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Verify on LinkedIn ↗
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </div>
              <div
                className={styles.storyPicker}
                role="group"
                aria-label="Choose a VA story"
                data-story-picker
                hidden
              >
                {stories.map((story, index) => (
                  <button
                    type="button"
                    key={story.name}
                    data-story-select={index}
                    aria-label={story.name}
                  >
                    <span aria-hidden="true">0{index + 1}</span>
                    {story.shortName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.companySection}
          aria-labelledby="company-title"
          data-webinar-wash
        >
          <div className={styles.content}>
            <p className={styles.kicker}>The company</p>
            <h2 id="company-title">The work behind the opportunity.</h2>
            <p className={styles.lead}>
              A women-led team supporting US healthcare clients.
            </p>
            <dl className={styles.metrics}>
              {companyMetrics.map(([amount, label]) => (
                <div key={label}>
                  <dt>{amount}</dt>
                  <dd>{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section
          className={styles.agendaSection}
          id="agenda"
          aria-labelledby="agenda-title"
          data-webinar-agenda
          data-webinar-wash
        >
          <div className={styles.split}>
            <div>
              <p className={styles.kicker}>Webinar agenda</p>
              <h2 id="agenda-title">One hour. Five answers.</h2>
              <p className={styles.agendaReadout} aria-hidden="true">
                <strong data-agenda-minute>00</strong>
                <span> / 60 min</span>
              </p>
              <svg
                className={styles.agendaRoute}
                viewBox="0 0 320 116"
                aria-hidden="true"
              >
                <circle cx="24" cy="83" r="11" fill="#0d746e" />
                <circle cx="293" cy="40" r="14" fill="#9be3d6" />
                <path
                  d={agendaRoute}
                  fill="none"
                  stroke="#6a8987"
                  strokeWidth="2"
                  strokeDasharray="3 5"
                />
                <path
                  data-agenda-route
                  d={agendaRoute}
                  pathLength="1"
                  fill="none"
                  stroke="#08766d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="1 1"
                  strokeDashoffset="1"
                />
                <circle
                  data-agenda-marker
                  cx="24"
                  cy="83"
                  r="4"
                  fill="#134143"
                />
              </svg>
              <p className={styles.agendaDetail} data-agenda-detail hidden>
                {agenda[0][2]}
              </p>
            </div>
            <ol className={styles.agendaList} data-agenda-list>
              {agenda.map(([minute, question, answer], index) => (
                <li key={minute} data-agenda-row>
                  <div className={styles.agendaStatic} data-agenda-static>
                    <span>{minute}m</span>
                    <div>
                      <strong>{question}</strong>
                      <p id={"agenda-answer-" + minute} data-agenda-answer>
                        {answer}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-agenda-select={index}
                    aria-describedby={"agenda-answer-" + minute}
                    hidden
                  >
                    <span>{minute}m</span> {question}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className={styles.requirementsSection}
          id="requirements"
          aria-labelledby="requirements-title"
          data-webinar-wash
        >
          <div className={styles.content}>
            <p className={styles.kicker}>Before you apply</p>
            <h2 id="requirements-title">The details to know first.</h2>
            <div className={styles.requirementsGrid}>
              {requirements.map(([name, value, detail]) => (
                <article key={name} data-requirement>
                  <h3 className={styles.kicker}>{name}</h3>
                  <strong>{value}</strong>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
            <p className={styles.fit}>
              For graduates, final-semester students, and homemakers ready for a
              long-term remote career and the full shift.
            </p>
          </div>
        </section>

        <section
          className={styles.peopleSection}
          aria-labelledby="people-title"
          data-webinar-wash
        >
          <div className={styles.split}>
            <div>
              <p className={styles.kicker}>The people</p>
              <h2 id="people-title">Meet your webinar host.</h2>
              <ul className={styles.teamNotes}>
                <li>
                  Every trainer, team leader, and manager in the VA department
                  is a woman.
                </li>
                <li>
                  <strong>5,000 jobs for Pakistani women</strong> is the
                  company’s goal.
                </li>
              </ul>
              <div className={styles.verifyRow}>
                {webinar.LINKEDIN_COMPANY_URL && (
                  <a
                    href={webinar.LINKEDIN_COMPANY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn ↗
                  </a>
                )}
                {webinar.TRUSTPILOT_URL && (
                  <a
                    href={webinar.TRUSTPILOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Trustpilot ↗
                  </a>
                )}
                <a
                  href="https://practiscale.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  practiscale.com ↗
                </a>
              </div>
            </div>
            <article className={styles.founderCard}>
              <div className={styles.founderImage}>
                <Image
                  src="/media/about/about-founder-portrait-desktop-v2.webp"
                  alt="Afrasyab Ahmed, PractiScale founder and CEO"
                  fill
                  sizes="(max-width: 680px) 100vw, 46vw"
                />
              </div>
              <div className={styles.founderInfo}>
                <h3>Afrasyab Ahmed</h3>
                <p>Founder and CEO · Webinar host</p>
              </div>
            </article>
          </div>
        </section>

        <section
          className={styles.eventSection}
          id="event-details"
          aria-labelledby="event-title"
          data-webinar-wash
        >
          <div className={styles.split}>
            <div>
              <p className={styles.kicker}>Event details</p>
              <h2 id="event-title">Your webinar at a glance.</h2>
              <div className={styles.actions}>
                <a className={styles.primaryAction} href="#reserve">
                  {webinar.FORM_ENDPOINT
                    ? "Reserve my free seat"
                    : "View registration status"}{" "}
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <div className={styles.ticket}>
              <p className={styles.kicker}>Free live webinar</p>
              <dl>
                <div>
                  <dt>Topic</dt>
                  <dd>Starting a remote VA career from home</dd>
                </div>
                <div>
                  <dt>Host</dt>
                  <dd>Afrasyab Ahmed, CEO</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{webinarDate}</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>
                    {webinarTime}
                    {webinar.TIME ? " PKT" : ""}
                  </dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>Online · 60 minutes</dd>
                </div>
              </dl>
              <p className={styles.ticketStatus}>
                {webinar.FORM_ENDPOINT
                  ? "Free registration"
                  : "Free seat · Registration opening soon"}
              </p>
            </div>
          </div>
        </section>

        <section
          className={styles.faqSection}
          id="webinar-faq"
          aria-labelledby="faq-title"
          data-webinar-wash
        >
          <div className={styles.split}>
            <div>
              <p className={styles.kicker}>FAQ</p>
              <h2 id="faq-title">Good questions, clear answers.</h2>
            </div>
            <div className={styles.faq}>
              <details name="va-webinar-faq">
                <summary>Do I need experience?</summary>
                <p>
                  No. Most of our team started with no remote work experience.
                </p>
              </details>
              <details name="va-webinar-faq">
                <summary>I’m still studying. Can I join?</summary>
                <p>Yes. Nayab joined in her final year of medical school.</p>
              </details>
              <details name="va-webinar-faq">
                <summary>What happens after the webinar?</summary>
                <p>
                  There’s a short qualification step. Candidates who meet the
                  criteria are invited to training.
                </p>
              </details>
              <details name="va-webinar-faq">
                <summary>Is PractiScale a real company?</summary>
                <p>
                  PractiScale works with 500+ healthcare businesses in the US.
                  You can review the company’s work at{" "}
                  <a
                    href="https://practiscale.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    practiscale.com
                  </a>
                  .
                </p>
              </details>
              <details name="va-webinar-faq">
                <summary>Is the first month unpaid?</summary>
                <p>
                  Yes. Paid roles follow successful training and assessment.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section
          className={styles.registration}
          id="reserve"
          aria-labelledby="reserve-title"
          data-webinar-wash
        >
          <div className={styles.split}>
            <div>
              <p className={styles.kicker}>Registration</p>
              <h2 id="reserve-title">
                {webinar.FORM_ENDPOINT
                  ? "Your seat is waiting."
                  : "Registration opens soon."}
              </h2>
              <p className={styles.lead}>
                {webinar.WHATSAPP_GROUP_URL
                  ? "Register, then join the webinar WhatsApp group for the link and reminders."
                  : webinar.FORM_ENDPOINT
                    ? "Complete your details to reserve a free seat."
                    : "Sign-up details will appear once the webinar date is confirmed."}
              </p>
              {typeof webinar.SEATS_TAKEN === "number" && (
                <p className={styles.seatsTaken}>
                  {webinar.SEATS_TAKEN} women have reserved a seat
                </p>
              )}
              {webinar.REGISTRATION_CLOSES_AT && (
                <div
                  className={styles.countdown}
                  data-countdown={webinar.REGISTRATION_CLOSES_AT}
                >
                  <p className={styles.kicker}>Registration closes in</p>
                  <div className={styles.countdownGrid}>
                    {["Days", "Hours", "Minutes", "Seconds"].map((unit) => (
                      <div key={unit}>
                        <strong data-countdown-unit>00</strong>
                        <span>{unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <WebinarForm />
          </div>
        </section>
      </main>

      <footer className={styles.footer} data-webinar-wash>
        <div className={styles.content}>
          <div className={styles.footerTop}>
            <a
              className={styles.brandLink}
              href="/"
              aria-label="PractiScale home"
            >
              <Image
                src="/brand/logos/practiscale-logo-reversed.png"
                alt="PractiScale"
                width={230}
                height={73}
                className={styles.brandLogo}
              />
            </a>
            <p>Built for growth, built in Pakistan.</p>
          </div>
          <p className={styles.footerNote}>
            Individual outcomes vary. Earnings shown are self-reported and
            depend on individual performance, effort, and consistency during and
            after training.
          </p>
          <div className={styles.footerBottom}>
            <span>© 2026 PractiScale. All rights reserved.</span>
            {webinar.PRIVACY_URL && (
              <a href={webinar.PRIVACY_URL}>Privacy Policy</a>
            )}
            <a href="#top">Back to webinar ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
