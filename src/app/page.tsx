import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import HeroLayout from "@/components/hero-layout";
import Navigation from "@/components/navigation";
import HeroSequence from "@/components/hero-sequence";
import ProblemSection from "@/components/problem-section";
import WhoWeAre from "@/components/who-we-are";
import CareerSection from "@/components/career-section";
import EarningsSection from "@/components/earnings-section";
import TestimonialsSection from "@/components/testimonials-section";
import BackgroundLinesDemo from "@/components/background-lines-demo";
import HiringSection from "@/components/hiring-section";
import FaqSection from "@/components/faq-section";
import FinalCTA from "@/components/final-cta";
import Footer from "@/components/footer";
import { Action, Eyebrow } from "@/components/ui";
export const metadata: Metadata = {
  title: "PractiScale | Build a Skill. Build Your Career.",
  alternates: { canonical: "/" },
};
export default function Home() {
  return (
    <>
      <main>
        <HeroLayout />
        <section className="hero-scroll">
          <div className="hero-stage" id="founder">
            <Navigation />
            <div className="hero-topline">
              <Eyebrow>Pakistan's ambition. A global stage.</Eyebrow>
              <span className="hero-location">Rawalpindi &middot; Remote</span>
            </div>
            <div className="hero-editorial">
              <div className="hero-copy" id="main" tabIndex={-1}>
                <h1>
                  Learn a skill
                  <br />
                  that gets <span>paid.</span>
                </h1>
                <p>
                  Then build a career using it.
                  <br />
                  Training and real work for Pakistani talent.
                </p>
                <Action href="https://wa.me/923334000600?text=Hi%20PractiScale%2C%20please%20share%20the%20current%20training%20program%20details.">
                  Explore training
                </Action>
              </div>
            </div>
            <div className="hero-aside">
              <span className="eyebrow">Built for growth.</span>
              <p>
                Sales. Virtual assistance.
                <br />
                Creative. Technology.
              </p>
              <span className="aside-rule" />
              <p className="small-copy">
                Skills that travel.
                <br />
                Work that matters.
              </p>
            </div>
            <div className="hero-visual">
              <div className="hero-frame">
                <HeroSequence />
              </div>
            </div>
            <dl className="hero-trust" aria-label="PractiScale in numbers">
              <div className="trust-card">
                <dt>Team members</dt>
                <dd>100+</dd>
              </div>
              <div className="trust-card">
                <dt>Candidates in our hiring portal</dt>
                <dd>46,000</dd>
              </div>
            </dl>
            <div className="hero-bottom-right">
              <Link href="https://wa.me/923334000600?text=Hi%20PractiScale%2C%20please%20share%20the%20current%20training%20program%20details.">
                <span className="hero-next-copy">
                  <span className="eyebrow">Your next chapter</span>
                  <span className="hero-next-label" id="hero-next-label">
                    Starts with a skill
                  </span>
                </span>
                <span className="hero-next-icon" aria-hidden="true">
                  <ArrowUpRight size={18} strokeWidth={1.5} />
                </span>
              </Link>
            </div>
          </div>
          <span id="hero-end" className="hero-end" aria-hidden="true" />
        </section>
        <ProblemSection />
        <WhoWeAre />
        <CareerSection />
        <EarningsSection />
        <TestimonialsSection />
        <BackgroundLinesDemo />
        <HiringSection />
        <FinalCTA />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
