import type { Metadata } from "next";
import "./globals.css";
import RoutePreloader from "@/components/route-preloader";
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
        <style
          dangerouslySetInnerHTML={{
            __html: `html:has(#site-preloader){overflow:hidden}#site-preloader{position:fixed;inset:0;z-index:1000;display:block;overflow:hidden;background:#0b3a3c;color:#fff;opacity:1;transition:opacity 420ms ease;outline:none}#site-preloader[data-ready=true]{background:transparent}#site-preloader[data-exiting=true]{opacity:0;pointer-events:none}.preloader-first-frame{position:absolute;inset:0;z-index:1;pointer-events:none}#site-preloader[data-frame-ready=true] .preloader-first-frame{visibility:hidden}.preloader-first-ring{position:absolute;left:50%;top:50%;width:min(400px,66vmin);height:min(400px,66vmin);transform:translate(-50%,-50%);overflow:visible;fill:none;stroke:#fff;stroke-width:1.1;stroke-dasharray:1.2 3;opacity:.58}.preloader-first-mark{position:absolute;left:50%;top:50%;width:55px;height:auto;transform:translate(-50%,-50%);filter:brightness(0) invert(1);opacity:.17}.preloader-first-logo{position:absolute;left:50%;top:calc(50% + min(400px,66vmin)*.4);width:clamp(170px,26vw,250px);height:auto;transform:translateX(-50%);filter:brightness(0) invert(1)}.preloader-original-frame{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;pointer-events:none;visibility:hidden}#site-preloader[data-frame-ready=true] .preloader-original-frame{visibility:visible}@media(prefers-reduced-motion:reduce){#site-preloader{transition:none}}`,
          }}
        />
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
        <RoutePreloader />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var loader=document.getElementById('site-preloader');if(!loader)return;var timer=setTimeout(function(){window.dispatchEvent(new Event('practiscale:preloader-timeout'));setTimeout(function(){var el=document.getElementById('site-preloader');if(el){el.remove();document.documentElement.style.overflow='';document.querySelectorAll('main,header,footer').forEach(function(node){node.inert=false})}},500)},8000);new MutationObserver(function(_,observer){if(!document.getElementById('site-preloader')){clearTimeout(timer);observer.disconnect()}}).observe(document.body,{childList:true,subtree:true})})();`,
          }}
        />
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
