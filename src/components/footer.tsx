import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Action, Eyebrow } from "./ui";
import { whatsapp } from "@/lib/content";
export function Closing() {
  return (
    <section className="closing wrap">
      <div>
        <Eyebrow>Your next chapter</Eyebrow>
        <h2>
          Bring the ambition.
          <br />
          Build the skill.
        </h2>
      </div>
      <div className="closing-right">
        <p>
          Start with training or bring your experience. Let’s find where you
          fit.
        </p>
        <Action href={whatsapp()}>Apply on WhatsApp</Action>
      </div>
    </section>
  );
}
export default function Footer() {
  return (
    <footer className="site-footer wrap">
      <div className="footer-top">
        <div>
          <Link href="/" className="brand">
            <img
              src="/brand/logos/practiscale-logo-reversed.png"
              width="363"
              height="67"
              alt="PractiScale. Built for growth"
            />
          </Link>
          <p>
            Pakistani talent.
            <br />
            Real work. Room to grow.
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/about/our-story">Our story</Link>
          <Link href="/about/how-we-work">How we work</Link>
          <Link href="/about/why-practiscale">Why PractiScale</Link>
          <Link href="/who-we-serve">Who we serve</Link>
        </div>
        <div>
          <h2>Your next step</h2>
          <Link href="/training-programs/appointment-setter">
            Appointment Setter
          </Link>
          <Link href="/training-programs/virtual-assistant">
            Virtual Assistant
          </Link>
          <Link href="/jobs">Career opportunities</Link>
        </div>
        <div>
          <h2>Talk to us</h2>
          <a href="mailto:hiring@practiscale.com">hiring@practiscale.com</a>
          <a href="tel:+923334000600">+92 333 4000 600</a>
          <p className="footer-address">
            Imran Khan Ave, Chaklala Scheme 3,
            <br />
            Rawalpindi 46000, Pakistan.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} PractiScale</span>
        <span>Built for growth.</span>
        <a href="https://practiscale.com/">
          For US healthcare businesses
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
