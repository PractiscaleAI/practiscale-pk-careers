import type { Metadata } from "next";
import Image from "next/image";
import { webinar } from "@/config/webinar";
import {
  about,
  contact,
  details,
  disclaimer,
  faq,
  final,
  fit,
  hero,
  host,
  learn,
  stories,
  ticker,
  trust,
  vsl,
} from "./content";
import { Countdown, ShortCountdown, StickyBar } from "./countdown";
import styles from "./funnel.module.css";
import { RegisterButton, RegisterProvider } from "./register";
import Vsl from "./vsl";

export const metadata: Metadata = {
  title: {
    absolute:
      "Free webinar: how Pakistani women earn from home as Virtual Assistants | PractiScale",
  },
  description:
    "A free, live one-hour webinar with PractiScale's founder: what Virtual Assistants do, the 15-day training, the career path, and whether it's right for you.",
  alternates: { canonical: "/virtual-assistant" },
  openGraph: {
    title: "How Pakistani women are earning 189,000 rupees a month from home",
    description:
      "Free live webinar for Pakistani women. Real team members, real outcomes.",
    type: "website",
    url: "/virtual-assistant",
    images: [vsl.poster],
  },
};

const closes = webinar.REGISTRATION_CLOSES_AT;
const faces = stories.items.map((s) => s.photo);
const LOGO_ON_DARK = "/brand/logos/practiscale-logo-reversed.png";

function Arrow() {
  return (
    <span className={styles.arrow} aria-hidden="true">
      →
    </span>
  );
}

function Faces() {
  return (
    <span className={styles.faces} aria-hidden="true">
      {faces.map((src) => (
        <Image key={src} src={src} alt="" width={40} height={40} />
      ))}
    </span>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM8 19H5V9h3v10zM6.5 7.7a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5zM19 19h-3v-4.9c0-1.2 0-2.7-1.6-2.7S12.5 12.6 12.5 14v5h-3V9h2.9v1.4h.04c.4-.76 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.7V19z" />
    </svg>
  );
}

function Ticks({
  items,
  cross = false,
}: {
  items: readonly string[];
  cross?: boolean;
}) {
  return (
    <ul className={`${styles.ticks} ${cross ? styles.crosses : ""}`}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export default function VirtualAssistantLanding() {
  return (
    <RegisterProvider>
      <header className={styles.top}>
        <div className={styles.wrap}>
          <a href="/" aria-label="PractiScale home">
            <Image
              src={LOGO_ON_DARK}
              alt="PractiScale"
              width={363}
              height={67}
              priority
              className={styles.logo}
            />
          </a>
          <div className={styles.topRight}>
            {closes && (
              <span className={styles.closes}>
                Registration closes in <ShortCountdown target={closes} />
              </span>
            )}
            <RegisterButton className={`${styles.cta} ${styles.ctaSmall}`}>
              <span className={styles.long}>Save my free seat</span>
              <span className={styles.short}>Save my seat</span>
            </RegisterButton>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ---------------------------------------------------------- Hero */}
        <section className={styles.hero} id="hero" aria-labelledby="hero-title">
          <div className={styles.wrap}>
            {/* Top row: headline and video carry equal weight. */}
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>
                  <i aria-hidden="true" />
                  {hero.eyebrow}
                </p>
                <h1 id="hero-title" className={styles.heroTitle}>
                  <span className={styles.h1Top}>{hero.headlineTop}</span>{" "}
                  <span className={styles.h1Figure}>{hero.headlineFigure}</span>{" "}
                  <span className={styles.h1Rest}>{hero.headlineRest}</span>
                </h1>
                <p className={styles.heroSub}>
                  {hero.subLead} <b>{hero.sub}</b>
                </p>
              </div>
              <div className={styles.heroMedia}>
                <Vsl />
                <p className={styles.vslProof}>
                  <Faces />
                  <span>
                    <b>{hero.proof.strong}</b>
                    {hero.proof.rest}
                  </span>
                </p>
              </div>
            </div>
            {/* Action band: urgency and countdown lead into the button. */}
            <div className={styles.heroBand}>
              <div className={styles.bandLead}>
                <p className={styles.urgency}>{hero.urgency}</p>
                {closes && (
                  <p className={styles.countNote}>{hero.countdownLabel}</p>
                )}
              </div>
              {closes && <Countdown target={closes} dark />}
              <div className={styles.bandGo}>
                <RegisterButton>
                  {hero.cta} <Arrow />
                </RegisterButton>
                <ul className={styles.assure}>
                  {hero.assurances.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- Proof ticker */}
        <div className={styles.ticker}>
          <ul className={styles.srOnly}>
            {ticker.map(([who, what]) => (
              <li key={who}>
                {who}: {what}
              </li>
            ))}
          </ul>
          <div className={styles.tickerTrack} aria-hidden="true">
            {[0, 1].map((copy) => (
              <span key={copy} className={styles.tickerSet}>
                {ticker.map(([who, what]) => (
                  <span key={who}>
                    {who} <b>{what}</b>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ------------------------------------------- For you + trust bar */}
        <section
          className={`${styles.section} ${styles.dark}`}
          aria-labelledby="foryou-title"
        >
          <div className={`${styles.wrap} ${styles.forYouGrid}`}>
            <div>
              <p className={styles.kicker}>Is this you?</p>
              <h2 id="foryou-title" className={styles.h2}>
                {hero.forYouTitle}
              </h2>
              <dl className={styles.stats} aria-label="At a glance">
                {trust.map((t) => (
                  <div key={t.figure}>
                    <dd>{t.figure}</dd>
                    <dt>{t.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
            <ul className={styles.forYouList}>
              {hero.forYou.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------- What you'll learn */}
        <section
          className={`${styles.section} ${styles.light}`}
          aria-labelledby="learn-title"
        >
          <div className={styles.wrap}>
            <div className={styles.center}>
              <p className={styles.kicker}>{learn.kicker}</p>
              <h2 id="learn-title" className={styles.h2}>
                {learn.title}
              </h2>
              <p className={styles.lede}>{learn.sub}</p>
            </div>
            <ol className={styles.bento}>
              {learn.items.map((item, i) => (
                <li
                  key={item.title}
                  className={
                    item.featured ? styles.bentoFeature : styles.bentoCard
                  }
                >
                  <span className={styles.n}>0{i + 1}</span>
                  {item.featured && (
                    <span className={styles.trio} aria-hidden="true">
                      {faces.map((src) => (
                        <Image
                          key={src}
                          src={src}
                          alt=""
                          width={240}
                          height={300}
                        />
                      ))}
                    </span>
                  )}
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ol>
            <div className={styles.afterCta}>
              <RegisterButton>
                {learn.cta} <Arrow />
              </RegisterButton>
              <ul className={styles.assure}>
                {learn.assurances.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- Fit check */}
        <section
          className={`${styles.section} ${styles.dark}`}
          aria-labelledby="fit-title"
        >
          <div className={styles.wrap}>
            <div className={styles.center}>
              <p className={styles.kicker}>{fit.kicker}</p>
              <h2 id="fit-title" className={styles.h2}>
                {fit.title}
              </h2>
            </div>
            <div className={styles.fitGrid}>
              <div className={styles.fitCard}>
                <h3>{fit.yesTitle}</h3>
                <Ticks items={fit.yes} />
              </div>
              <div className={`${styles.fitCard} ${styles.fitNo}`}>
                <h3>{fit.noTitle}</h3>
                <Ticks items={fit.no} cross />
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- Stories */}
        <section
          className={`${styles.section} ${styles.light}`}
          aria-labelledby="stories-title"
        >
          <div className={styles.wrap}>
            <p className={styles.kicker}>{stories.kicker}</p>
            <h2 id="stories-title" className={styles.h2}>
              {stories.title}
            </h2>
            <p className={styles.lede}>{stories.sub}</p>
            <div className={styles.stories}>
              {stories.items.map((s) => (
                <article
                  key={s.name}
                  className={`${styles.story} ${s.featured ? styles.storyFeatured : ""}`}
                >
                  <div className={styles.photo}>
                    <Image
                      src={s.photo}
                      alt={`Portrait of ${s.name}`}
                      fill
                      sizes="(max-width: 560px) 120px, (max-width: 900px) 210px, 240px"
                    />
                  </div>
                  <div className={styles.storyBody}>
                    <h3>
                      {s.name}
                      {s.featured && (
                        <span className={styles.storyTag}>
                          {stories.featuredTag}
                        </span>
                      )}
                    </h3>
                    <ul className={styles.roles} aria-label="Roles">
                      {s.role.split(" · ").map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    {/* Before and Started lead along a path into the Today panel. */}
                    <dl className={styles.journey}>
                      <div>
                        <dt>Before</dt>
                        <dd>{s.before}</dd>
                      </div>
                      <div>
                        <dt>Started</dt>
                        <dd>{s.started}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className={styles.today}>
                    <p className={styles.todayLabel}>Today</p>
                    <p className={styles.todayFigure}>{s.earn}</p>
                    <p className={styles.todayNote}>{s.earnNote}</p>
                    <p className={styles.todayText}>{s.today}</p>
                    {s.linkedin && (
                      <a
                        className={styles.verify}
                        href={s.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LinkedInIcon />
                        Verify on LinkedIn
                        <span className={styles.srOnly}>: {s.name}</span>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <aside className={styles.note} aria-labelledby="stories-note">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>
              <div>
                <p id="stories-note" className={styles.noteTitle}>
                  {stories.noteTitle}
                </p>
                <p>{stories.note}</p>
              </div>
            </aside>
          </div>
        </section>

        {/* ---------------------------------------------------------- Host */}
        <section
          className={`${styles.section} ${styles.dark}`}
          aria-labelledby="host-title"
        >
          <div className={`${styles.wrap} ${styles.hostCard}`}>
            <figure className={styles.hostPhoto}>
              <Image
                src={host.photo}
                alt={`${host.name}, Founder and CEO of PractiScale`}
                fill
                sizes="(max-width: 900px) 100vw, 580px"
              />
            </figure>
            <div className={styles.hostText}>
              <p className={styles.kicker}>{about.kicker}</p>
              <h2 id="host-title" className={styles.h2}>
                {about.title}
              </h2>
              <p className={styles.hostBody}>
                <strong>{host.name}</strong> is the Founder and CEO of
                PractiScale, a company that works with{" "}
                <strong>500+ healthcare businesses</strong> across the United
                States.
              </p>
              <p className={styles.hostBody}>
                He started PractiScale in January 2025. The Virtual Assistant
                department is entirely female-led. Every trainer, every team
                leader, every manager is a woman.
              </p>
              <p className={styles.hostBody}>
                His goal is to create{" "}
                <strong>5,000 jobs for Pakistani women</strong> who want to
                build real careers from home. The women on this page prove it is
                working.
              </p>
              <dl className={styles.cred}>
                {about.credentials.map((c) => (
                  <div key={c.label}>
                    <dd>{c.figure}</dd>
                    <dt>{c.label}</dt>
                  </div>
                ))}
              </dl>
              <div className={styles.verifyRow}>
                <span>Verify us yourself:</span>
                {webinar.LINKEDIN_COMPANY_URL && (
                  <a
                    className={styles.pill}
                    href={webinar.LINKEDIN_COMPANY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn <span aria-hidden="true">↗</span>
                  </a>
                )}
                {webinar.TRUSTPILOT_URL && (
                  <a
                    className={styles.pill}
                    href={webinar.TRUSTPILOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Trustpilot <span aria-hidden="true">↗</span>
                  </a>
                )}
                <a
                  className={styles.pill}
                  href={contact.siteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contact.site} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- Details + FAQ */}
        <section
          className={`${styles.section} ${styles.light}`}
          aria-labelledby="details-title"
        >
          <div className={styles.wrap}>
            <p className={styles.kicker}>{details.kicker}</p>
            <h2 id="details-title" className={styles.h2}>
              {details.title}
            </h2>
            <p className={styles.lede}>{details.lede}</p>
            <div className={styles.eventGrid}>
              {/* The webinar pass: host, the three facts, then a tear-off stub with the action. */}
              <article className={styles.pass} aria-label="Webinar pass">
                <div className={styles.passHost}>
                  <Image
                    src={host.photo}
                    alt=""
                    width={44}
                    height={44}
                    className={styles.passAvatar}
                  />
                  <p>
                    <b>{host.name}</b>
                    <small>{host.role}</small>
                  </p>
                  <span className={styles.passTag}>{details.passTag}</span>
                </div>
                <dl className={styles.passRows}>
                  <div>
                    <span className={styles.passIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M3 4h18M4 4v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4M12 15v5M8 20h8" />
                      </svg>
                    </span>
                    <dt>What</dt>
                    <dd>{details.what}</dd>
                  </div>
                  <div>
                    <span className={styles.passIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4M16 2v4" />
                      </svg>
                    </span>
                    <dt>When</dt>
                    <dd>
                      {webinar.DATE && webinar.TIME ? (
                        <b>{`${webinar.DATE} at ${webinar.TIME} PKT`}</b>
                      ) : (
                        <span className={styles.tba}>
                          Date and time to be announced
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <span
                      className={`${styles.passIcon} ${styles.passIconWa}`}
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
                      </svg>
                    </span>
                    <dt>Where</dt>
                    <dd>{details.where}</dd>
                  </div>
                </dl>
                <div className={styles.passStub}>
                  {closes ? (
                    <>
                      <p className={styles.stubHead}>
                        {hero.countdownLabel}
                        <span>{details.stubUrgency}</span>
                      </p>
                      <Countdown target={closes} dark />
                    </>
                  ) : (
                    <p className={styles.stubHead}>{details.noCountdown}</p>
                  )}
                  <RegisterButton className={`${styles.cta} ${styles.block}`}>
                    {details.cta} <Arrow />
                  </RegisterButton>
                  <ul className={styles.assure}>
                    {learn.assurances.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </article>
              {/* FAQ as question cards; the dark email card closes the column level with the stub. */}
              <div className={styles.faq}>
                <h3 className={styles.faqTitle}>{details.faqTitle}</h3>
                {faq.map(([q, a], i) => (
                  <details key={q} name="va-faq" open={i === 0}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
                <a className={styles.faqAsk} href={`mailto:${contact.email}`}>
                  <span className={styles.faqAskIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l9 6 9-6" />
                    </svg>
                  </span>
                  <span>
                    <b>{details.askTitle}</b>
                    {contact.email}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- Final CTA */}
        <section
          className={styles.final}
          id="final"
          aria-labelledby="final-title"
        >
          <div className={styles.wrap}>
            {typeof webinar.SEATS_TAKEN === "number" && (
              <p className={styles.joined}>
                <Faces />
                <span>
                  Join{" "}
                  <b>{webinar.SEATS_TAKEN.toLocaleString("en-US")} women</b> who
                  have already secured their seat
                </span>
              </p>
            )}
            <h2 id="final-title">
              Your seat is <em>waiting</em>
            </h2>
            <p className={styles.finalSub}>{final.sub}</p>
            <RegisterButton className={`${styles.cta} ${styles.ctaLarge}`}>
              {final.cta} <Arrow />
            </RegisterButton>
            <p className={styles.fine}>{final.fine}</p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.ledger}>
            <div>
              <Image
                src={LOGO_ON_DARK}
                alt="PractiScale"
                width={363}
                height={67}
                className={styles.footerLogo}
              />
              <p className={styles.ledgerTag}>{hero.eyebrow}</p>
            </div>
            <div>
              <h2 className={styles.ledgerLabel}>Questions</h2>
              <p>
                <a
                  className={styles.ledgerLink}
                  href={`mailto:${contact.email}`}
                >
                  {contact.email}
                </a>
              </p>
              <p>
                <a
                  className={styles.ledgerLink}
                  href={contact.siteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contact.site}
                </a>
              </p>
            </div>
            <div>
              <h2 className={styles.ledgerLabel}>Verify us</h2>
              <dl className={styles.ledgerFacts}>
                {about.credentials.map((c) => (
                  <div key={c.label}>
                    <dt>{c.figure}</dt>
                    <dd>{c.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <section
            className={styles.disclaimerBox}
            aria-labelledby="earnings-disclaimer"
          >
            <h2 id="earnings-disclaimer" className={styles.ledgerLabel}>
              Earnings disclaimer
            </h2>
            <p className={styles.disclaimer}>{disclaimer}</p>
          </section>
          <p className={styles.copyright}>
            © PractiScale 2026. All rights reserved.
            {webinar.PRIVACY_URL && (
              <>
                {" · "}
                <a href={webinar.PRIVACY_URL}>Privacy Policy</a>
              </>
            )}
          </p>
        </div>
      </footer>

      <StickyBar>
        <p>
          {closes ? (
            <>
              Registration closes in <ShortCountdown target={closes} />
            </>
          ) : (
            <>
              Free live webinar{" "}
              <b className={styles.shortCount}>Seats are limited</b>
            </>
          )}
        </p>
        <RegisterButton className={`${styles.cta} ${styles.ctaSmall}`}>
          Save my seat
        </RegisterButton>
      </StickyBar>
    </RegisterProvider>
  );
}
