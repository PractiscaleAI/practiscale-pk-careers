"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
type Placement = { mode: "hero" | "up" | "released"; pageTop: number };
export default function Navigation() {
  const [mobile, setMobile] = useState(false),
    [open, setOpen] = useState<string | null>(null);
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [placement, setPlacement] = useState<Placement>({
    mode: "hero",
    pageTop: 0,
  });
  const currentPlacement = useRef(placement);
  const place = useCallback((next: Placement) => {
    if (
      currentPlacement.current.mode === next.mode &&
      currentPlacement.current.pageTop === next.pageTop
    )
      return;
    currentPlacement.current = next;
    setPlacement(next);
  }, []);
  useEffect(() => {
    setMobile(false);
    setOpen(null);
    place({ mode: "hero", pageTop: 0 });
  }, [path, place]);
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".hero-stage");
    if (!stage) return;
    let lastY = Math.max(0, window.scrollY),
      direction = 0,
      distance = 0,
      turnY = lastY,
      frame = 0,
      focusFrame = 0;
    const anchorInPlace = () =>
      stage.getBoundingClientRect().top + (innerWidth < 768 ? 8 : 18) >=
      (innerWidth < 768 ? 16 : 32) - 1;
    const update = () => {
      frame = 0;
      const y = Math.max(
        0,
        Math.min(
          window.scrollY,
          document.documentElement.scrollHeight - innerHeight,
        ),
      );
      const previousY = lastY,
        delta = y - previousY;
      lastY = y;
      const focused =
        ref.current?.contains(document.activeElement) &&
        document.activeElement?.matches(":focus-visible");
      if (mobile || open || focused) {
        if (!anchorInPlace()) place({ mode: "up", pageTop: 0 });
        return;
      }
      if (anchorInPlace()) {
        place({ mode: "hero", pageTop: 0 });
        distance = 0;
        return;
      }
      if (Math.abs(delta) < 0.5) return;
      const nextDirection = Math.sign(delta);
      if (nextDirection !== direction) {
        distance = 0;
        turnY = previousY;
      }
      direction = nextDirection;
      distance += Math.abs(delta);
      if (distance < 8) return;
      if (direction < 0) place({ mode: "up", pageTop: 0 });
      else if (currentPlacement.current.mode === "up")
        place({
          mode: "released",
          pageTop: turnY + (innerWidth < 768 ? 16 : 32),
        });
      else if (
        currentPlacement.current.mode === "released" &&
        ref.current &&
        ref.current.getBoundingClientRect().bottom < 0
      )
        place({ mode: "hero", pageTop: 0 });
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (
        event.key !== "Tab" ||
        document.activeElement !== document.body ||
        anchorInPlace() ||
        document.querySelector("main")?.inert
      )
        return;
      event.preventDefault();
      place({ mode: "up", pageTop: 0 });
      focusFrame = requestAnimationFrame(() => {
        const controls = [
          ...(ref.current?.querySelectorAll<HTMLElement>("a,button") ?? []),
        ].filter((el) => el.getClientRects().length > 0);
        (event.shiftKey ? controls.at(-1) : controls[0])?.focus({
          preventScroll: true,
        });
      });
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll, { passive: true });
    document.addEventListener("keydown", keyboard);
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      document.removeEventListener("keydown", keyboard);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(focusFrame);
    };
  }, [mobile, open, place]);
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
  const navigation = (
    <>
      <header
        className={`site-header floating-header ${path === "/" ? "home-header" : ""} ${placement.mode !== "hero" ? "is-scrolled" : ""}`}
        ref={ref}
        data-placement={placement.mode}
        style={
          placement.mode === "released"
            ? { position: "absolute", top: placement.pageTop }
            : undefined
        }
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
  return placement.mode === "hero"
    ? navigation
    : createPortal(navigation, document.body);
}
