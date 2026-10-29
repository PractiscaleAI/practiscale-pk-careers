import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import FooterFilm from "./footer-film";
import styles from "./footer.module.css";

const directions =
  "https://www.google.com/maps/search/?api=1&query=Imran+Khan+Ave%2C+Chaklala+Scheme+3%2C+Rawalpindi+46000";

export default function Footer() {
  return (
    <footer id="site-footer" className={styles.footer} aria-label="Site footer">
      <FooterFilm />
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.introduction}>
            <p className={styles.kicker}>PractiScale / Pakistan</p>
            <h2>Built for growth.</h2>
            <p>
              Pakistani talent, trained and hired for real work on US healthcare
              accounts.
            </p>
          </div>

          <nav className={styles.group} aria-label="Company">
            <h3>Company</h3>
            <Link href="/#background-lines">Our Story and Founder</Link>
            <Link href="/#who-we-are">How We Work</Link>
            <Link href="/#the-problem">Why PractiScale</Link>
            <a href="https://practiscale.com/">Who We Serve</a>
          </nav>

          <nav className={styles.group} aria-label="Opportunities">
            <h3>Opportunities</h3>
            <Link href="/training-programs/appointment-setter">
              Appointment Setter Program
            </Link>
            <Link href="/training-programs/virtual-assistant">
              Virtual Assistant Program
            </Link>
            <Link href="/jobs">All Jobs</Link>
          </nav>
        </div>

        <Link href="/" className={styles.logo} aria-label="PractiScale home">
          <img
            src="/brand/logos/practiscale-logo-primary.png"
            width="363"
            height="67"
            alt="PractiScale. Built for growth."
          />
        </Link>

        <div className={styles.right}>
          <div className={styles.group}>
            <h3>Apply</h3>
            <a href="https://wa.me/923334000600">WhatsApp: 0333 4000 600</a>
            <a href="mailto:hiring@practiscale.com">
              Email: hiring@practiscale.com
            </a>
            <a href="tel:+923334000600">Call: 0333 4000 600</a>
          </div>

          <div className={`${styles.group} ${styles.business}`}>
            <h3>For US healthcare businesses</h3>
            <p>Grow through referral partner relationships.</p>
            <a href="https://practiscale.com/">
              Visit practiscale.com
              <ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.baseline}>
          <div className={styles.address}>
            <span className={styles.metaLabel}>Head office</span>
            <p>Imran Khan Ave, Chaklala Scheme 3, Rawalpindi 46000.</p>
            <a href={directions}>
              Get Directions
              <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
            </a>
          </div>
          <div className={styles.locations}>
            <span className={styles.metaLabel}>Work locations</span>
            <p>
              Rawalpindi <span aria-hidden="true">|</span> Islamabad{" "}
              <span aria-hidden="true">|</span> Remote
            </p>
          </div>
          <p className={styles.copyright}>
            © 2026 PractiScale. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
