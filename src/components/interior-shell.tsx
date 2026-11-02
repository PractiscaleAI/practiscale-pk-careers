import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import styles from "./interior-shell.module.css";

export default function InteriorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <div className={styles.header} data-interior-header-anchor>
        <Navigation />
      </div>
      <main id="main" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
