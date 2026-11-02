import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import InteriorShell from "@/components/interior-shell";
import { Action } from "@/components/ui";
import styles from "./who-we-serve.module.css";

export const metadata: Metadata = {
  title: {
    absolute:
      "Who We Serve | Referral Partner Growth for US Healthcare Businesses",
  },
  description:
    "PractiScale helps 500+ US home care, assisted living, NEMT, behavioral health, rehab and specialty healthcare businesses grow through referral partner relationships.",
  alternates: { canonical: "/who-we-serve" },
};

const industries = [
  {
    name: "Home Care and Home Health",
    business:
      "Agencies that care for seniors and patients at home, including care after a hospital stay.",
    partners:
      "Discharge planners, case managers, social workers and physician offices.",
    work: "Reach the professionals who plan patient care after discharge.",
  },
  {
    name: "Assisted Living and Senior Care",
    business:
      "Assisted living communities, memory care and senior care providers.",
    partners:
      "Hospitals, senior living advisors, hospice teams and social workers.",
    work: "Connect communities with the people families turn to for placement advice.",
  },
  {
    name: "Non Emergency Medical Transportation (NEMT)",
    business: "Providers that transport patients to medical appointments.",
    partners: "Dialysis centers, clinics and skilled nursing facilities.",
    work: "Help providers become known by the facilities that schedule patient rides.",
  },
  {
    name: "Behavioral and Mental Health",
    business:
      "Therapy practices, ABA providers, psychiatric care and sober living.",
    partners: "Physicians, case managers and other care professionals.",
    work: "Find professionals who regularly see patients needing behavioral care.",
  },
  {
    name: "Rehab and Therapy",
    business: "Physical, occupational and speech therapy providers.",
    partners:
      "Physician offices, orthopedic practices and skilled nursing facilities.",
    work: "Connect therapy providers with the offices that send patients for treatment.",
  },
  {
    name: "Clinics and Specialty Services",
    business:
      "Primary care, pediatrics, pain management, DME, pharmacy and lab services.",
    partners: "Physician networks, specialists and care coordinators.",
    work: "Build connections between specialty providers and the practices they depend on.",
  },
];
const process = ["Research", "Reach out", "Qualify", "Introduce"];

export default function WhoWeServePage() {
  return (
    <InteriorShell>
      <section className={styles.hero} aria-labelledby="serve-heading">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Who we serve</span>
            <h1 id="serve-heading">
              The US healthcare businesses we help <span>grow.</span>
            </h1>
            <p>
              PractiScale helps 500+ healthcare businesses across the US build
              relationships with the professionals who refer patients to them.
              Our teams in Pakistan do that work every day.
            </p>
            <a href="#industries" className={styles.heroLink}>
              Explore the industries <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div
            className={styles.proofObject}
            aria-label="Over 500 US healthcare businesses served"
          >
            <span className={styles.proofLabel}>
              Professional relationships at scale
            </span>
            <strong>
              500<span>+</span>
            </strong>
            <span className={styles.proofCaption}>
              US healthcare businesses served
            </span>
            <span className={styles.proofLine} aria-hidden="true" />
            <span className={styles.proofFoot}>
              Built by our teams in Pakistan
            </span>
          </div>
        </div>
      </section>

      <section className={styles.how} aria-labelledby="serve-how-heading">
        <div className={styles.howInner}>
          <div className={styles.howCopy}>
            <span className={styles.eyebrow}>How we help</span>
            <h2 id="serve-how-heading">Introductions, not lead lists</h2>
            <p>
              A lead list gives a business contact details. A professional
              introduction gives it the start of a real relationship. We
              research, reach out, qualify and introduce. Our clients build and
              own the relationship from there.
            </p>
            <Link href="https://practiscale.com/" className={styles.inlineLink}>
              Learn more at practiscale.com{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <ol
            className={styles.process}
            aria-label="How PractiScale builds introductions"
          >
            {process.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className={styles.industrySection}
        id="industries"
        aria-labelledby="industries-heading"
      >
        <div className={styles.industryInner}>
          <div className={styles.industryIntro}>
            <div>
              <span className={styles.eyebrow}>Across healthcare</span>
              <h2 id="industries-heading">Industries we serve</h2>
            </div>
            <p>
              Each partnership starts with understanding the business and the
              professionals who can refer patients to it.
            </p>
          </div>
          <div className={styles.industryGrid}>
            {industries.map((item, index) => (
              <article key={item.name} className={styles.industryCard}>
                <span className={styles.cardNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{item.name}</h3>
                <dl>
                  <div>
                    <dt>The business</dt>
                    <dd>{item.business}</dd>
                  </div>
                  <div>
                    <dt>Their referral partners</dt>
                    <dd>{item.partners}</dd>
                  </div>
                  <div>
                    <dt>What our team does</dt>
                    <dd>{item.work}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <p className={styles.otherIndustries}>
            And other healthcare businesses across the US.
          </p>
        </div>
      </section>

      <section
        className={styles.clientProof}
        aria-labelledby="client-proof-heading"
      >
        <div className={styles.clientProofInner}>
          <div className={styles.clientProofNumber} aria-hidden="true">
            29
          </div>
          <div className={styles.clientProofCopy}>
            <span className={styles.eyebrow}>Client proof</span>
            <h2 id="client-proof-heading">See the results for yourself</h2>
            <p>
              Read 29 published client case studies and the client wins page on
              our US website.
            </p>
            <div className={styles.proofActions}>
              <Action href="https://practiscale.com/case-study-page/">
                Read case studies
              </Action>
              <Action href="https://practiscale.com/clients-win/" secondary>
                See client wins
              </Action>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.nextSteps} aria-label="Your next step">
        <div className={styles.nextStepsInner}>
          <article>
            <span className={styles.eyebrow}>For job seekers in Pakistan</span>
            <h2>Do this work.</h2>
            <p>
              Want to do this work? Our training programs prepare you for it.
            </p>
            <Link href="/training-programs/appointment-setter">
              Explore training programs{" "}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
          <article>
            <span className={styles.eyebrow}>
              For US healthcare business owners
            </span>
            <h2>Find your partners.</h2>
            <p>Want referral partners in your area? Find out if you qualify.</p>
            <Link href="https://practiscale.com/demo-call-page/">
              See if you qualify <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>
    </InteriorShell>
  );
}
