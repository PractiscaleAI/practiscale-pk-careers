import { Action, Eyebrow } from "@/components/ui";
import styles from "./about.module.css";

export function AboutHero({
  eyebrow,
  title,
  body,
  image,
  mobileImage,
  imageAlt,
  variant = "standard",
}: {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  mobileImage: string;
  imageAlt: string;
  variant?: "standard" | "portrait";
}) {
  return (
    <section
      className={`${styles.hero} ${variant === "portrait" ? styles.heroPortrait : ""}`}
    >
      <div className={styles.heroContent}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
      <div className={styles.heroImageWrap}>
        <picture>
          <source media="(max-width: 900px)" srcSet={mobileImage} />
          <img
            className={styles.heroImage}
            src={image}
            alt={imageAlt}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      </div>
      <div className={styles.heroIndex} aria-hidden="true">
        PRACTISCALE / PAKISTAN
      </div>
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  body,
  inverse = false,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  body?: string;
  inverse?: boolean;
}) {
  return (
    <div
      className={`${styles.sectionHeading} ${inverse ? styles.inverseHeading : ""}`}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 id={id}>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}

export function AboutCta({
  title,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  body?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}) {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaInner}>
        <Eyebrow>Your next chapter</Eyebrow>
        <h2>{title}</h2>
        {body && <p>{body}</p>}
        <div className={styles.ctaActions}>
          <Action href={primaryHref}>{primaryLabel}</Action>
          <Action href={secondaryHref} secondary>
            {secondaryLabel}
          </Action>
        </div>
      </div>
    </section>
  );
}

export function NumberedCard({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className={styles.numberedCard}>
      <span className={styles.cardIndex}>{String(index).padStart(2, "0")}</span>
      <h3>{title}</h3>
      <div className={styles.cardBody}>{children}</div>
    </article>
  );
}
