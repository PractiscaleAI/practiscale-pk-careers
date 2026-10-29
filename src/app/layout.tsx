import type { Metadata } from "next";
import "./globals.css";
import Preloader from "@/components/preloader";
import { siteUrl } from "@/lib/content";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PractiScale | Build a skill. Build your career.",
    template: "%s | PractiScale",
  },
  description:
    "Explore training and career opportunities with PractiScale in Pakistan. Sales, virtual assistance, creative and technology work for US healthcare accounts.",
  openGraph: {
    type: "website",
    siteName: "PractiScale",
    locale: "en_PK",
    images: [
      {
        url: "/media/ceo-prime-v1/social-poster.webp",
        width: 960,
        height: 960,
        alt: "PractiScale founder Afrasyab Ahmed",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/brand/fonts/Manrope400.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/brand/fonts/Sora600.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Preloader />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PractiScale",
              url: siteUrl,
              logo: `${siteUrl}/brand/logos/practiscale-logo-primary.png`,
              email: "hiring@practiscale.com",
              telephone: "+92-333-4000600",
            }),
          }}
        />
      </body>
    </html>
  );
}
