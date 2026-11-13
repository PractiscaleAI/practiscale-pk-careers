import type { Metadata } from "next";
import FunnelHeader from "../funnel-header";
import styles from "../funnel.module.css";
import QualifyForm from "./qualify-form";

export const metadata: Metadata = {
  title: { absolute: "A few quick questions | PractiScale webinar" },
  robots: { index: false, follow: false },
};

export default function QualifyPage() {
  return (
    <>
      <FunnelHeader />
      <main id="main" className={styles.funnelPage}>
        <QualifyForm />
      </main>
    </>
  );
}
