import { Action } from "@/components/ui";
export default function NotFound() {
  return (
    <main id="main" className="page-intro wrap">
      <p className="eyebrow">404 / Page not found</p>
      <h1>Let’s find your way back.</h1>
      <p>
        This page may have moved. Explore training or return to the homepage.
      </p>
      <Action href="/">Back to PractiScale</Action>
    </main>
  );
}
