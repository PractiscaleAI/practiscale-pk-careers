import { Action, Eyebrow } from "@/components/ui";
import ProblemCards from "@/components/problem-cards";
import styles from "./problem-cards.module.css";

export const careerProblems = [
  {
    id: "degree",
    title: "A degree without a marketable skill",
    body: "You have the qualification. Employers also need practical skills and experience you can bring to the job.",
    image: "/media/career-problems/graduate-v1.webp",
    alt: "A young Pakistani graduate holding a document folder in a university corridor.",
  },
  {
    id: "progress",
    title: "More effort, little financial progress",
    body: "You take on more responsibility and deliver better results, but your income does not reflect the value you create.",
    image: "/media/career-problems/professional-v2.webp",
    alt: "A Pakistani professional concentrating on her laptop in a shared office.",
  },
  {
    id: "stability",
    title: "Income with no real stability",
    body: "Freelancing brings opportunity. Inconsistent projects and demand make it hard to rely on a steady income.",
    image: "/media/career-problems/freelancer-v1.webp",
    alt: "A Pakistani freelancer considering his work at a home office laptop.",
  },
];

export default function ProblemSection() {
  return (
    <section
      className={styles.section}
      id="the-problem"
      aria-labelledby="problem-heading"
    >
      <div className={styles.scene} data-problem-scene>
        <div className={styles.heading} data-problem-heading>
          <Eyebrow>The problem</Eyebrow>
          <h2 id="problem-heading">Why careers in Pakistan get stuck.</h2>
        </div>
        <ProblemCards items={careerProblems} />
        <div className={styles.cta} data-problem-cta>
          <Action href="https://wa.me/923334000600?text=Hi%20PractiScale%2C%20please%20share%20the%20current%20training%20program%20details.">
            Explore training
          </Action>
        </div>
      </div>
    </section>
  );
}
