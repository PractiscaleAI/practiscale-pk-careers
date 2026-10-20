"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X, ArrowUpRight, ChevronDown } from "lucide-react";
import { whatsapp } from "@/lib/content";
const groups = [
  {
    label: "About",
    items: [
      ["Meet our founder", "#founder"],
      ["How we work", "https://practiscale.com/"],
      ["Ask about PractiScale", whatsapp("PractiScale")],
    ],
  },
  {
    label: "Training",
    items: [
      ["Appointment Setter", whatsapp("the Appointment Setter Program")],
      ["Virtual Assistant", whatsapp("the Virtual Assistant Program")],
    ],
  },
];
export default function Navigation() {
  const [mobile, setMobile] = useState(false),
    [open, setOpen] = useState<string | null>(null),
    [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const sentinel = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const marker = sentinel.current;
    if (!marker) return;
    const observer = new IntersectionObserver(([entry]) => {
      setScrolled(!entry.isIntersecting);
    });
    observer.observe(marker);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setMobile(false);
    setOpen(null);
  }, [path]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (mobile || open)) {
        const expanded = ref.current?.querySelector<HTMLButtonElement>(
          '.nav-group>button[aria-expanded="true"]',
        );
        expanded?.focus();
        setOpen(null);
        setMobile(false);
        if (innerWidth <= 1200) toggle.current?.focus({ preventScroll: true });
      }
    };
    const outside = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(null);
        setMobile(false);
      }
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [mobile, open]);
  return (
    <>
      <span ref={sentinel} className="nav-scroll-marker" aria-hidden="true" />
      <header
        className={`site-header floating-header ${path === "/" ? "home-header" : ""} ${scrolled ? "is-scrolled" : ""}`}
        ref={ref}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setMobile(false);
            setOpen(null);
          }
        }}
      >
        <Link href="/" className="brand" aria-label="PractiScale home">
          <picture>
            <source
              media="(max-width: 347px)"
              srcSet="/brand/logos/practiscale-mark.png"
            />
            <source
              media="(max-width: 767px)"
              srcSet="/brand/logos/practiscale-logo-primary.png"
            />
            <img
              src="/brand/logos/practiscale-logo-reversed.png"
              width="363"
              height="67"
              alt="PractiScale - Built for growth"
            />
          </picture>
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-label={mobile ? "Close navigation" : "Open navigation"}
          aria-expanded={mobile}
          aria-controls="main-navigation"
          onClick={() => setMobile(!mobile)}
        >
          {mobile ? (
            <X />
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 9h18M3 15h18" />
            </svg>
          )}
        </button>
        <nav
          onClick={(e) => {
            if ((e.target as Element).closest("a")) {
              setMobile(false);
              setOpen(null);
              if (innerWidth <= 1200)
                toggle.current?.focus({ preventScroll: true });
            }
          }}
          id="main-navigation"
          aria-label="Main navigation"
          className={`nav-panel ${mobile ? "is-open" : ""}`}
        >
          <Link href="/" className="mobile-home">
            Home
          </Link>
          {groups.map((group) => (
            <div
              className="nav-group"
              key={group.label}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null);
              }}
            >
              <button
                aria-expanded={open === group.label}
                aria-controls={`nav-${group.label}`}
                onClick={() =>
                  setOpen(open === group.label ? null : group.label)
                }
              >
                {group.label}
                <ChevronDown size={12} aria-hidden="true" />
              </button>
              <div
                id={`nav-${group.label}`}
                className="dropdown"
                hidden={open !== group.label}
              >
                {group.items.map(([name, url]) => (
                  <Link href={url} key={url}>
                    {name}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link
            href={whatsapp("current career opportunities")}
            aria-current={path === "/jobs" ? "page" : undefined}
          >
            Careers
          </Link>
          <Link
            href="https://practiscale.com/"
            aria-current={path === "/who-we-serve" ? "page" : undefined}
          >
            Who we serve
          </Link>
          <a className="nav-cta" href={whatsapp()}>
            <span>Apply on WhatsApp</span>
            <span className="button-icon">
              <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </a>
        </nav>
      </header>
    </>
  );
}
