import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

/** Headlines: an editorial serif. Self-hosted by next/font at build time. */
export const serif = Fraunces({
  subsets: ["latin"],
  variable: "--va-serif",
  display: "swap",
});

/** Reading text and UI. */
export const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--va-sans",
  display: "swap",
});
