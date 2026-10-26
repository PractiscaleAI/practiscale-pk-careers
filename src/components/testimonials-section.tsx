import { Eyebrow } from "@/components/ui";
import { testimonials } from "@/lib/testimonial-content";
import TestimonialCarousel from "./testimonial-carousel";
import styles from "./testimonials.module.css";

function GrowthMotif({
  kind,
}: {
  kind: (typeof testimonials)[number]["motif"];
}) {
  return (
    <svg
      className={styles.motif}
      viewBox="0 0 400 440"
      fill="none"
      aria-hidden="true"
    >
      {kind === "rise" && (
        <g transform="rotate(-12 200 220)" fill="currentColor">
          <rect x="58" y="238" width="88" height="164" rx="44" />
          <rect x="156" y="136" width="88" height="266" rx="44" />
          <rect x="254" y="38" width="88" height="364" rx="44" />
        </g>
      )}
      {kind === "open" && (
        <g
          transform="rotate(12 200 220)"
          stroke="currentColor"
          strokeWidth="72"
          strokeLinecap="round"
        >
          <path d="M94 360V182a106 106 0 0 1 212 0v178" />
          <path d="M200 278v-92m-36 36 36-36 36 36" strokeWidth="32" />
        </g>
      )}
      {kind === "steps" && (
        <g
          transform="rotate(-10 200 220)"
          stroke="currentColor"
          strokeWidth="76"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M64 368h84V242h104V114h84" />
        </g>
      )}
      {kind === "connect" && (
        <g
          transform="rotate(-35 200 220)"
          stroke="currentColor"
          strokeWidth="60"
        >
          <rect x="120" y="44" width="160" height="228" rx="80" />
          <rect x="120" y="168" width="160" height="228" rx="80" />
        </g>
      )}
    </svg>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className={styles.section}
      aria-labelledby="testimonials-heading"
    >
      <div className={styles.stage} data-testimonial-stage>
        <div className={styles.heading}>
          <Eyebrow>Testimonials</Eyebrow>
          <h2 id="testimonials-heading">Growth, in their own words.</h2>
        </div>
        <TestimonialCarousel names={testimonials.map(({ name }) => name)}>
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className={styles.card}
              data-testimonial-card
              data-motif={item.motif}
            >
              <GrowthMotif kind={item.motif} />
              <div className={styles.cardContent}>
                <span className={styles.quoteMark} aria-hidden="true">
                  “
                </span>
                <blockquote>
                  <p>{item.quote}</p>
                </blockquote>
                <figcaption className={styles.person}>
                  <span className={styles.monogram} aria-hidden="true">
                    {item.initials}
                  </span>
                  <div>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.role}>{item.role}</span>
                  </div>
                </figcaption>
              </div>
            </figure>
          ))}
        </TestimonialCarousel>
      </div>
    </section>
  );
}
