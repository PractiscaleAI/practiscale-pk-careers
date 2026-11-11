import type { Metadata } from "next";
import Image from "next/image";
import { webinar, webinarDate, webinarTime } from "@/config/webinar";
import WebinarEffects from "./webinar-effects";
import WebinarForm from "./webinar-form";
import styles from "./webinar.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "Free live webinar: start a remote VA career from home | PractiScale",
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
  },
};

const stories = [
  {
    name: "Kanwal Fayaz",
    role: "Virtual Assistant",
    start: "A homemaker who had stepped away from work and wasn't sure a career was still possible.",
    today: "Rs 113,000 a month, from home.",
    linkedin: webinar.LINKEDIN_KANWAL,
  },
  {
    name: "Mahnoor Naeem",
    role: "Team Leader",
    start: "Heard about PractiScale from her sister. No remote experience. Started on a modest salary.",
    today: "Team Leader. Rs 189,000 a month.",
    linkedin: webinar.LINKEDIN_MAHNOOR,
  },
  {
    name: "Nayab Fatima",
    role: "Team Leader · Interviewer · Designer · Expert VA",
    start: "Joined in her final year of medical school.",
    today: "Four roles, Rs 183,000 a month, and a 3.8 CGPA.",
    linkedin: webinar.LINKEDIN_NAYAB,
  },
] as const;

const agenda = [
  ["00", "What is remote VA work?", "See the role and the US healthcare accounts behind it."],
  ["12", "Can I start without experience?", "Understand who the program is built for."],
  ["24", "What does training involve?", "Learn what the first month asks of you."],
  ["36", "How do hours and earnings work?", "Hear the shift requirements and real individual results."],
  ["48", "What happens next?", "Know the qualification step and how to apply."],
] as const;

function ReserveLink({ light = false }: { light?: boolean }) {
  return (
    <a className={`${styles.reserveLink} ${light ? styles.reserveLinkLight : ""}`} href="#reserve">
      Reserve my free seat <span aria-hidden="true">↗</span>
    </a>
  );
}

export default function VirtualAssistentWebinarPage() {
  return (
    <div className={styles.page} data-webinar-page>
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.nightOverlay} aria-hidden="true" />
      <WebinarEffects />

      <header className={styles.siteHeader}>
        <a className={styles.brandLink} href="/" aria-label="PractiScale home">
          <Image
            src="/brand/logos/practiscale-logo-reversed.png"
            alt="PractiScale"
            width={272}
            height={86}
            priority
            className={styles.brandLogo}
          />
        </a>
        <a className={styles.headerAction} href="#reserve">Reserve my free seat <span aria-hidden="true">↗</span></a>
      </header>

      <main id="main" className={styles.main}>
        <section className={styles.hero} aria-labelledby="webinar-title">
          <div className={styles.heroNumber} aria-hidden="true">189,000</div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>PractiScale / Free live webinar</p>
            <h1 id="webinar-title">Rs 189,000 a month. <em>Earned from home.</em></h1>
            <p className={styles.heroLead}>That is what our top Team Leader earns. Results vary. Below are three women who started with no remote experience.</p>
            <p className={styles.heroMeta}>Free live webinar <span>·</span> {webinarDate} <span>·</span> {webinarTime}{webinar.TIME ? " PKT" : ""} <span>·</span> 60 minutes <span>·</span> Online</p>
            <div className={styles.heroActions}>
              <ReserveLink />
              {!webinar.FORM_ENDPOINT && <p className={styles.pendingNote}>Registration opens when the event details are confirmed.</p>}
            </div>
            {webinar.VSL_URL && (
              <a className={styles.videoLink} href={webinar.VSL_URL} target="_blank" rel="noopener noreferrer">Watch Afrasyab Ahmed explain it <span aria-hidden="true">↗</span></a>
            )}
          </div>
          <div className={styles.heroSide} aria-hidden="true"><span>6 PM</span><span className={styles.heroSideLine} /><span>3 AM</span></div>
          <div className={styles.heroBottom}><span>Scroll to explore ↓</span></div>
        </section>

        <section className={`${styles.section} ${styles.storiesSection}`} aria-labelledby="stories-title">
          <div className={styles.sectionTop}><span className={styles.stamp}>07:00 PM / REAL STORIES</span><span className={styles.sectionIndex}>01 / 06</span></div>
          <div className={styles.storiesIntro}>
            <h2 id="stories-title">Real names. Real roles. <em>Real outcomes.</em></h2>
            <p>Three different starting points. Three individual outcomes. The route is real work, practice and consistency.</p>
          </div>
          <div className={styles.storiesList}>
            {stories.map((story, index) => (
              <article className={styles.story} key={story.name}>
                <span className={styles.storyNumber}>0{index + 1} / 03</span>
                <div className={styles.storyBody}>
                  <h3>{story.name}</h3>
                  <p className={styles.storyRole}>{story.role}</p>
                  <p className={styles.storyStart}><span>Started as</span>{story.start}</p>
                </div>
                <div className={styles.storyResult}><span>Today</span><strong>{story.today}</strong>{story.linkedin && <a href={story.linkedin} target="_blank" rel="noopener noreferrer">Verify on LinkedIn ↗</a>}</div>
              </article>
            ))}
          </div>
          <p className={styles.resultsDisclaimer}>Individual outcomes vary. These are real PractiScale team members. Salary figures are self-reported and are not a guarantee of earnings, which depend on individual performance and consistency.</p>
        </section>

        <section className={`${styles.section} ${styles.statsSection}`} aria-labelledby="stats-title">
          <div className={styles.sectionTop}><span className={styles.stamp}>08:00 PM / THE COMPANY</span><span className={styles.sectionIndex}>02 / 06</span></div>
          <h2 id="stats-title" className={styles.smallSectionTitle}>The work behind the opportunity.</h2>
          <div className={styles.statsGrid}>
            <div><strong>500+</strong><span>US healthcare clients</span></div>
            <div><strong>100%</strong><span>Women-led VA department</span></div>
            <div><strong>5,000</strong><span>Jobs for Pakistani women: the goal</span></div>
            <div><strong>2025</strong><span>The year PractiScale started</span></div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.agendaSection}`} aria-labelledby="agenda-title">
          <div className={styles.sectionTop}><span className={styles.stamp}>09:00 PM / THE WEBINAR</span><span className={styles.sectionIndex}>03 / 06</span></div>
          <div className={styles.agendaIntro}><h2 id="agenda-title">One hour. <em>Five answers.</em></h2><p>Everything you need to decide whether this is for you.</p></div>
          <ol className={styles.agendaList}>
            {agenda.map(([minute, title, detail]) => <li key={minute}><span className={styles.agendaMinute}>{minute}<small>min</small></span><div><h3>{title}</h3><p>{detail}</p></div><span className={styles.agendaArrow} aria-hidden="true">↗</span></li>)}
          </ol>
          <div className={styles.agendaCta}><ReserveLink /></div>
        </section>

        <section className={`${styles.section} ${styles.requirementsSection}`} aria-labelledby="requirements-title">
          <div className={styles.sectionTop}><span className={styles.stamp}>10:00 PM / THE REAL REQUIREMENTS</span><span className={styles.sectionIndex}>04 / 06</span></div>
          <h2 id="requirements-title">The details you <em>should know first.</em></h2>
          <p className={styles.requirementsStatement}>Women only. A laptop and steady internet. Good English. Available <mark>6 PM to 3 AM</mark> after training. The first month of training is <mark>unpaid.</mark></p>
          <div className={styles.fitGrid}>
            <div><h3>This is for you if</h3><ul><li>You are a graduate, a final-semester student or a homemaker ready for a professional career.</li><li>You want a long-term remote career, not side income.</li><li>You can commit to the shift hours after training.</li></ul></div>
            <div><h3>This is not for you if</h3><ul><li>You want a casual part-time role.</li><li>You cannot commit to the hours.</li><li>You are not willing to complete an unpaid first month.</li><li>You want quick money without real work.</li></ul></div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.trustSection}`} aria-labelledby="trust-title">
          <div className={styles.sectionTop}><span className={styles.stamp}>11:00 PM / THE PEOPLE</span><span className={styles.sectionIndex}>05 / 06</span></div>
          <h2 id="trust-title">A real team. <em>A clear ambition.</em></h2>
          <div className={styles.trustGrid}>
            <article className={styles.founderPanel}>
              <div className={styles.founderImage}><Image src="/media/about/about-founder-portrait-desktop-v2.webp" alt="Afrasyab Ahmed, PractiScale founder and CEO" fill sizes="(max-width: 800px) 100vw, 48vw" /></div>
              <div className={styles.trustText}><span>01 / FOUNDER</span><h3>Afrasyab Ahmed</h3><p>Founder and CEO. PractiScale works with 500+ healthcare businesses across the United States. He started the company in January 2025.</p></div>
            </article>
            <div className={styles.trustSide}>
              <article><span>02 / THE DEPARTMENT</span><strong>100%</strong><h3>A department run by women.</h3><p>Every trainer, team leader and manager in the Virtual Assistant department is a woman.</p></article>
              <article><span>03 / THE GOAL</span><strong>5,000</strong><h3>Jobs for Pakistani women.</h3><p>Careers from home for Pakistani women. The women above show it is already working.</p></article>
            </div>
          </div>
          <div className={styles.verifyRow}><span>Verify us yourself</span>{webinar.LINKEDIN_COMPANY_URL && <a href={webinar.LINKEDIN_COMPANY_URL} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}{webinar.TRUSTPILOT_URL && <a href={webinar.TRUSTPILOT_URL} target="_blank" rel="noopener noreferrer">Trustpilot ↗</a>}<a href="https://practiscale.com/" target="_blank" rel="noopener noreferrer">practiscale.com ↗</a></div>
        </section>

        <section className={`${styles.section} ${styles.ticketFaqSection}`} aria-labelledby="ticket-title">
          <div className={styles.sectionTop}><span className={styles.stamp}>12:00 AM / YOUR SEAT</span><span className={styles.sectionIndex}>06 / 06</span></div>
          <div className={styles.ticketFaqGrid}>
            <div className={styles.ticket}>
              <p className={styles.ticketKicker}>PRACTISCALE · FREE LIVE WEBINAR</p>
              <h2 id="ticket-title">A seat for your next step.</h2>
              <dl><div><dt>What</dt><dd>Starting a remote VA career from home</dd></div><div><dt>Host</dt><dd>Afrasyab Ahmed, CEO</dd></div><div><dt>Date</dt><dd>{webinarDate}</dd></div><div><dt>Time</dt><dd>{webinarTime}{webinar.TIME ? " PKT" : ""} · 60 min</dd></div><div><dt>Where</dt><dd>Online · joining details to follow</dd></div><div><dt>Seat</dt><dd>{webinar.FORM_ENDPOINT ? "Free registration" : "Free · registration opening soon"}</dd></div></dl>
              <span className={styles.ticketCut} aria-hidden="true" />
            </div>
            <div className={styles.faq}>
              <h2>Good questions, <em>clear answers.</em></h2>
              <details><summary>Do I need experience?</summary><p>No. Most of our team started with no remote work experience.</p></details>
              <details><summary>I&apos;m still studying. Can I join?</summary><p>Yes. Nayab joined in her final year of medical school.</p></details>
              <details><summary>What happens after the webinar?</summary><p>A short qualification step. If you meet the criteria, you&apos;re invited to the training program.</p></details>
              <details><summary>Is PractiScale a real company?</summary><p>Yes. We work with 500+ healthcare businesses in the US. You can review our client work at <a href="https://practiscale.com/" target="_blank" rel="noopener noreferrer">practiscale.com</a>.</p></details>
              <details><summary>Is the first month really unpaid?</summary><p>Yes. We say it up front because we want the right people in the program. The first month builds your foundation. Paid roles follow successful training and assessment.</p></details>
            </div>
          </div>
        </section>

        <section id="reserve" className={styles.registration} aria-labelledby="reserve-title">
          <div className={styles.registrationIntro}><span className={styles.stamp}>03:00 AM / THE NEXT STEP</span><h2 id="reserve-title">{webinar.FORM_ENDPOINT ? <>Your seat is <em>waiting.</em></> : <>Registration <em>opens soon.</em></>}</h2><p>{webinar.WHATSAPP_GROUP_URL ? "Register, then join the webinar WhatsApp group for the link and reminders." : "Registration details will appear here once the webinar date and sign-up process are confirmed."}</p>{typeof webinar.SEATS_TAKEN === "number" && <p className={styles.seatsTaken}>{webinar.SEATS_TAKEN} women have reserved a seat</p>}</div>
          <WebinarForm />
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}><a href="/" aria-label="PractiScale home"><Image src="/brand/logos/practiscale-logo-reversed.png" alt="PractiScale" width={230} height={73} /></a><span>Built for growth, built in Pakistan.</span></div>
        <p>Individual outcomes vary. The case studies on this page are real PractiScale team members. Salary figures are self-reported. Earnings shown are not a guarantee of future results and depend on individual performance, effort and consistency during and after the training program.</p>
        <div className={styles.footerBottom}><span>© PractiScale 2026. All rights reserved.</span>{webinar.PRIVACY_URL && <a href={webinar.PRIVACY_URL}>Privacy Policy</a>}</div>
      </footer>
    </div>
  );
}
