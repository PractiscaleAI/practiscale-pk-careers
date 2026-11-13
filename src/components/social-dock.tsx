"use client";

import { Share2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./social-dock.module.css";

const socialProfiles = [
  {
    name: "Instagram",
    icon: "/brand/social/instagram.svg",
    href: "https://www.instagram.com/practiscale_pk?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  },
  {
    name: "TikTok",
    icon: "/brand/social/tiktok.svg",
    href: "https://www.tiktok.com/@practiscale.pk?_r=1&_t=ZS-99NJtAMBTRC",
  },
  {
    name: "Threads",
    icon: "/brand/social/threads.svg",
    href: "https://www.threads.com/@practiscale_pk?igshid=NTc4MTIwNjQ2YQ%3D%3D",
  },
  {
    name: "Facebook",
    icon: "/brand/social/facebook.svg",
    href: "https://www.facebook.com/practiscale.pk?rdid=NOTizFiVS413xo5T&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FPgXYejpx%2F#",
  },
] as const;

export default function SocialDock() {
  const [isOpen, setIsOpen] = useState(false);
  const dockRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOutside = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen]);

  if (pathname.startsWith("/virtual-assistant")) return null;

  return (
    <aside
      ref={dockRef}
      className={styles.dock}
      data-open={isOpen}
      aria-label="PractiScale social profiles"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setIsOpen(true);
      }}
      onPointerLeave={(event) => {
        if (
          event.pointerType === "mouse" &&
          !dockRef.current?.contains(document.activeElement)
        ) {
          setIsOpen(false);
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={isOpen ? "Close social profiles" : "Open social profiles"}
        aria-controls="practiscale-social-profiles"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X size={20} strokeWidth={2} /> : <Share2 size={20} strokeWidth={2} />}
      </button>
      <nav
        id="practiscale-social-profiles"
        className={styles.panel}
        aria-label="Follow PractiScale"
        aria-hidden={!isOpen}
      >
        {socialProfiles.map((profile) => (
          <a
            key={profile.name}
            className={styles.profile}
            href={profile.href}
            target="_blank"
            rel="noopener noreferrer"
            title={profile.name}
            tabIndex={isOpen ? 0 : -1}
            aria-label={`${profile.name}, opens in a new tab`}
          >
            <span
              className={styles.icon}
              style={{ maskImage: `url(${profile.icon})`, WebkitMaskImage: `url(${profile.icon})` }}
              aria-hidden="true"
            />
          </a>
        ))}
      </nav>
    </aside>
  );
}
