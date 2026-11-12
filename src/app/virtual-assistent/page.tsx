import type { Metadata } from "next";
import Image from "next/image";
import { webinar, webinarDate, webinarTime } from "@/config/webinar";
import CareerPath from "./career-path";
import { Countdown, Header, JumpLink, Reveals } from "./chrome";
import {
  agenda,
  companyMetrics,
  faq,
  host,
  intro,
  requirements,
  shiftHours,
  vsl,
} from "./content";
import Earthrise from "./earthrise";
import StoriesReel from "./stories-reel";
import VslPlayer from "./vsl-player";
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
    description: "A free, live, one-hour webinar on the Virtual Assistant career path at PractiScale.",
    type: "website",
    url: "/virtual-assistent",
    images: [vsl.poster],
  },
};

const open = Boolean(webinar.FORM_ENDPOINT);
const reserveLabel = open ? "Reserve my free seat" : "See webinar details";

export default function VirtualAssistentPage() {
  return (
    <div className={styles.page}>
      <Reveals />
      <Header cta={open ? "Reserve a seat" : "Register"} />

      <main id="main">
        <Earthrise />

        {/* ---------------------------------------------------------- VSL */}
        <section id="watch" aria-labelledby="watch-title" className={styles.watch}>
          <div className={styles.watchHead}>
            <div data-reveal>
              <p className={styles.eyebrow}>{intro.eyebrow}</p>
              <h2 id="watch-title" className={styles.display}>
                {intro.heading}
              </h2>
            </div>
            <div data-reveal style={{ transitionDelay: "120ms" }}>
              <p className={styles.lead}>{intro.body}</p>
              <dl className={styles.meta}>
                <div>
                  <dt>Format</dt>
                  <dd>Online · 60 minutes</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>
                    {webinarDate}
                    {webinar.TIME ? ` · ${webinarTime} PKT` : ""}
                  </dd>
                </div>
                <div>
                  <dt>After training</dt>
                  <dd>{shiftHours}</dd>
                </div>
              </dl>
              <div className={styles.actions}>
                <JumpLink className={styles.primary} href="#reserve">
                  {reserveLabel} <span aria-hidden="true">↗</span>
                </JumpLink>
                <JumpLink className={styles.secondary} href="#stories">
                  Explore the stories <span aria-hidden="true">↓</span>
                </JumpLink>
              </div>
            </div>
          </div>
          <VslPlayer />

          <dl className={styles.metrics} aria-label="The company">
            {companyMetrics.map(([amount, label], i) => (
              <div
                key={label}
                className={styles.brackets}
                data-reveal
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <dt>{label}</dt>
                <dd>{amount}</dd>
              </div>
            ))}
          </dl>
        </section>

        <StoriesReel />
        <CareerPath />

        {/* ------------------------------------------------- Requirements */}
        <section id="requirements" aria-labelledby="req-title" className={styles.block}>
          <div className={styles.blockHead} data-reveal>
            <div>
              <p className={styles.eyebrow}>{requirements.eyebrow}</p>
              <h2 id="req-title" className={styles.display}>
                {requirements.heading}
              </h2>
            </div>
            <p className={styles.note}>{requirements.fit}</p>
          </div>
          <ol className={styles.reqGrid}>
            {requirements.items.map((item, i) => (
              <li
                key={item.name}
                className={styles.reqCard}
                data-featured={"featured" in item ? true : undefined}
                data-reveal
                style={{ transitionDelay: `${i * 110}ms` }}
              >
                {/* Orbit rings — decoration, one per step up in commitment. */}
                <svg aria-hidden="true" viewBox="0 0 200 200" className={styles.rings}>
                  {Array.from({ length: item.rings + 1 }, (_, k) => (
                    <ellipse
                      key={k}
                      cx="100"
                      cy="100"
                      rx={40 + k * 18}
                      ry={18 + k * 8}
                      fill="none"
                      stroke="currentColor"
                      transform={`rotate(${-20 + k * 14} 100 100)`}
                    />
                  ))}
                  <circle cx="100" cy="100" r="9" fill="currentColor" />
                </svg>
                {"featured" in item && <span className={styles.badge}>The night shift</span>}
                <h3>{item.name}</h3>
                <p className={styles.reqValue}>{item.value}</p>
                <p className={styles.reqDetail}>{item.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------------------------------------- Agenda + host */}
        <section id="agenda" aria-labelledby="agenda-title" className={styles.block}>
          <div className={styles.agendaGrid}>
            <figure className={styles.host} data-reveal>
              <div className={styles.hostPhoto}>
                <Image
                  src={host.image}
                  alt={`${host.name}, PractiScale founder and CEO`}
                  fill
                  sizes="(max-width: 767px) 92vw, 40vw"
                />
                <div className={`${styles.brackets} ${styles.hostBrackets}`} aria-hidden="true" />
              </div>
              <figcaption>
                <span className={styles.hostName}>{host.name}</span>
                <span className={styles.label}>{host.role}</span>
                <ul>
                  {host.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </figcaption>
            </figure>

            <div>
              <div data-reveal>
                <p className={styles.eyebrow}>{agenda.eyebrow}</p>
                <h2 id="agenda-title" className={styles.display}>
                  {agenda.heading}
                </h2>
              </div>
              <ol className={styles.agendaList}>
                {agenda.items.map(([minute, q, a], i) => (
                  <li key={minute} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                    <span className={styles.minute}>{minute}m</span>
                    <div>
                      <h3>{q}</h3>
                      <p>{a}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- FAQ */}
        <section id="faq" aria-labelledby="faq-title" className={styles.block}>
          <div className={styles.faqGrid}>
            <div data-reveal>
              <p className={styles.eyebrow}>FAQ</p>
              <h2 id="faq-title" className={styles.display}>
                Good questions, clear answers.
              </h2>
            </div>
            <div className={styles.faq} data-reveal>
              {faq.map(([q, a]) => (
                <details key={q} name="va-faq">
                  <summary>
                    {q}
                    <span aria-hidden="true" />
                  </summary>
                  <p>
                    {a.includes("practiscale.com") ? (
                      <>
                        {a.replace("practiscale.com.", "")}
                        <a href="https://practiscale.com/" target="_blank" rel="noopener noreferrer">
                          practiscale.com
                        </a>
                        .
                      </>
                    ) : (
                      a
                    )}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- Reserve */}
        <section id="reserve" aria-labelledby="reserve-title" className={styles.reserve}>
          {/* A sliver of the Earth rising at the bottom edge — the opening, bookended. */}
          <div className={styles.reserveGlow} aria-hidden="true" />
          <div className={styles.reserveGrid}>
            <div data-reveal>
              <p className={styles.eyebrow}>Registration</p>
              <h2 id="reserve-title" className={styles.display}>
                {open ? "Put your name on the list." : "Registration opens soon."}
              </h2>
              <p className={styles.lead}>
                {webinar.WHATSAPP_GROUP_URL
                  ? "Register, then join the webinar WhatsApp group for the link and reminders."
                  : open
                    ? "Complete your details to reserve a free seat."
                    : "Sign-up details will appear once the webinar date is confirmed."}
              </p>
              {typeof webinar.SEATS_TAKEN === "number" && (
                <p className={styles.seats}>{webinar.SEATS_TAKEN} women have reserved a seat</p>
              )}
              <Countdown
                target={webinar.REGISTRATION_CLOSES_AT}
                label={
                  webinar.REGISTRATION_CLOSES_AT
                    ? "Registration closes in"
                    : "Countdown starts when the date is confirmed"
                }
              />
              <dl className={styles.ticket} id="event-details">
                <div>
                  <dt>Topic</dt>
                  <dd>Starting a remote VA career from home</dd>
                </div>
                <div>
                  <dt>Host</dt>
                  <dd>Afrasyab Ahmed, CEO</dd>
                </div>
                <div>
                  <dt>When</dt>
                  <dd>
                    {webinarDate} · {webinarTime}
                    {webinar.TIME ? " PKT" : ""}
                  </dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>Online · 60 minutes · Free</dd>
                </div>
              </dl>
            </div>
            <div data-reveal style={{ transitionDelay: "120ms" }}>
              <WebinarForm />
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <a href="/" aria-label="PractiScale home" className={styles.brand}>
            <Image
              src="/brand/logos/practiscale-logo-reversed.png"
              alt="PractiScale"
              width={230}
              height={73}
            />
          </a>
          <p className={styles.label}>Built for growth, built in Pakistan.</p>
        </div>
        <p className={styles.footerNote}>
          Individual outcomes vary. Earnings shown are self-reported and depend on individual
          performance, effort, and consistency during and after training. The opening scene is
          illustrative imagery created for this page.
        </p>
        <div className={styles.footerBottom}>
          <span>© 2026 PractiScale. All rights reserved.</span>
          {webinar.PRIVACY_URL && <a href={webinar.PRIVACY_URL}>Privacy Policy</a>}
          <JumpLink href="#top">Back to the start ↑</JumpLink>
        </div>
      </footer>
    </div>
  );
}
