import type { Metadata } from "next";
import { Globe, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { webinar } from "@/config/webinar";
import AgendaChat from "./agenda-chat";
import CareerPath from "./career-path";
import { ClosesIn, Header, JumpLink, Reveals } from "./chrome";
import {
  companyMetrics,
  contact,
  faq,
  host,
  intro,
  requirements,
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
        <Earthrise ctaLabel={reserveLabel} />

        {/* ---------------------------------------------------------- VSL */}
        <section id="watch" aria-labelledby="watch-title" className={styles.watch}>
          <div className={styles.watchGrid}>
            <div className={styles.watchHead} data-reveal>
              <p className={styles.eyebrow}>{intro.eyebrow}</p>
              <h2 id="watch-title" className={styles.display}>
                {intro.heading}
              </h2>
              <p className={styles.watchLead}>{intro.body}</p>
            </div>
            <div className={styles.watchFilm}>
              <VslPlayer />
            </div>
            <div className={styles.watchRest} data-reveal style={{ transitionDelay: "120ms" }}>
              <p className={styles.srOnly}>The video covers:</p>
              <ol className={styles.covers}>
                {intro.covers.map((topic, i) => (
                  <li key={topic}>
                    <span aria-hidden="true">0{i + 1}</span>
                    {topic}
                  </li>
                ))}
              </ol>
              <div className={styles.actions}>
                <JumpLink className={styles.primary} href="#reserve">
                  {reserveLabel} <span aria-hidden="true">↗</span>
                </JumpLink>
                <span className={`${styles.label} ${styles.watchMeta}`}>Free · Online · 60 min</span>
              </div>
            </div>
          </div>

          <dl className={styles.band} aria-label="The company">
            {companyMetrics.map(([amount, label], i) => {
              const [, figure, unit] = amount.match(/^(.*?)([+%]?)$/)!;
              return (
                <div key={label} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                  <dt>{label}</dt>
                  <dd>
                    {figure}
                    {unit && <em>{unit}</em>}
                  </dd>
                </div>
              );
            })}
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

        <AgendaChat ctaLabel={reserveLabel} />

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
          <div className={styles.reserveHead} data-reveal>
            <p className={styles.eyebrow}>Registration</p>
            <h2 id="reserve-title" className={styles.display}>
              Save your free seat.
            </h2>
            <p className={styles.reserveLead}>
              One hour online with the founder. You&apos;ll leave knowing exactly what the work is,
              and whether it&apos;s right for you.
            </p>
            {typeof webinar.SEATS_TAKEN === "number" && (
              <p className={styles.seats}>{webinar.SEATS_TAKEN} women have reserved a seat</p>
            )}
          </div>

          {/* The pass: the event stub and the action, torn from one ticket. */}
          <div className={styles.passWrap} data-reveal style={{ transitionDelay: "120ms" }}>
            <div className={styles.pass}>
              <div className={styles.stub} id="event-details">
                <span className={styles.passTag}>
                  <span aria-hidden="true">★</span> Free live webinar
                </span>
                <h3>Start a remote VA career from home</h3>
                <div className={styles.passHost}>
                  <span className={styles.passAvatar}>
                    <Image src={host.avatar} alt="" fill sizes="44px" unoptimized />
                  </span>
                  <div>
                    <b>{host.name}</b>
                    <span>Founder &amp; CEO · Your host</span>
                  </div>
                </div>
                <dl className={styles.passFacts}>
                  <div>
                    <dt>Date</dt>
                    <dd>{webinar.DATE ?? "To be announced"}</dd>
                  </div>
                  <div>
                    <dt>Time</dt>
                    <dd>{webinar.TIME ? `${webinar.TIME} PKT` : "To be announced"}</dd>
                  </div>
                  <div>
                    <dt>Format</dt>
                    <dd>Online · 60 min</dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd className={styles.passFree}>Free</dd>
                  </div>
                </dl>
                <ClosesIn
                  target={webinar.REGISTRATION_CLOSES_AT}
                  fallback={
                    open
                      ? "Seats are limited. Register while they last."
                      : "We'll share the date here and on WhatsApp."
                  }
                />
              </div>
              <div className={styles.passAct}>
                <WebinarForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerCols}>
          <div>
            <a href="/" aria-label="PractiScale home" className={styles.brand}>
              <Image
                src="/brand/logos/practiscale-logo-reversed.png"
                alt="PractiScale"
                width={230}
                height={73}
              />
            </a>
            <p className={styles.footerPitch}>
              Remote Virtual Assistant careers for women in Pakistan, supporting US healthcare
              clinics.
            </p>
          </div>
          <div>
            <h2 className={styles.footerHead}>Questions?</h2>
            <ul className={styles.contact}>
              <li>
                <a href={`mailto:${contact.email}`}>
                  <span className={styles.contactIcon} aria-hidden="true">
                    <Mail size={15} />
                  </span>
                  <span>
                    {contact.email}
                    <small>Email the hiring team</small>
                  </span>
                </a>
              </li>
              <li>
                <a href={contact.phoneHref}>
                  <span className={styles.contactIcon} aria-hidden="true">
                    <Phone size={15} />
                  </span>
                  <span>
                    {contact.phone}
                    <small>Call us</small>
                  </span>
                </a>
              </li>
              <li>
                <a href={contact.siteHref} target="_blank" rel="noopener noreferrer">
                  <span className={styles.contactIcon} aria-hidden="true">
                    <Globe size={15} />
                  </span>
                  <span>
                    {contact.site}
                    <small>About the company</small>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className={styles.footerNote}>
          Individual outcomes vary. Earnings shown are self-reported and depend on individual
          performance, effort, and consistency during and after training. The opening scene is
          illustrative imagery created for this page.
        </p>
        <div className={styles.footerBottom}>
          <span>© 2026 PractiScale · Built in Pakistan</span>
          {webinar.PRIVACY_URL && <a href={webinar.PRIVACY_URL}>Privacy Policy</a>}
          <JumpLink className={styles.toTop} href="#top">
            Back to top <span aria-hidden="true">↑</span>
          </JumpLink>
        </div>
      </footer>
    </div>
  );
}
