"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { JumpLink } from "./chrome";
import { agenda, host } from "./content";
import { clamp, follower, onFrame, pinProgress, prefersReducedMotion, range } from "./va-motion";
import styles from "./webinar.module.css";

/**
 * The agenda as a conversation: each question a woman asks arrives as her
 * message, the host's typing indicator follows, then his reply saying what
 * the webinar covers. The thread builds with the scroll and ends with an
 * invitation to bring her own question.
 *
 * The chat is visual only (aria-hidden). Screen readers get the same five
 * questions and replies as a plain list. Without JavaScript, or with reduced
 * motion, the section does not pin and every message is shown at once.
 */

const SECTION_VH = 340;
const WINDOW = [0.04, 0.94] as const;
// Within each question's slice of the scroll: question, typing, reply.
const SHOW_Q = 0.02;
const TYPING = [0.22, 0.5] as const;
const SHOW_A = 0.5;

export default function AgendaChat({ ctaLabel }: { ctaLabel: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const feed = feedRef.current;
    if (!root || !feed || prefersReducedMotion()) return;
    root.dataset.live = "";

    const q = [...feed.querySelectorAll<HTMLElement>("[data-chat-q]")];
    const typing = [...feed.querySelectorAll<HTMLElement>("[data-chat-typing]")];
    const a = [...feed.querySelectorAll<HTMLElement>("[data-chat-a]")];
    const end = feed.querySelector<HTMLElement>("[data-chat-end]")!;
    const toggle = (el: HTMLElement, name: string, on: boolean) => {
      if (on !== el.hasAttribute(name)) el.toggleAttribute(name, on);
    };
    const follow = follower(9);
    let lastP = -1;

    const stop = onFrame((_, dt) => {
      const { p: target, rect, vh } = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      const p = follow(target, dt);
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const t = range(p, ...WINDOW) * agenda.items.length;
      agenda.items.forEach((_, i) => {
        const local = t - i;
        // Shown before it is "in", so the entrance transition has a frame to run.
        toggle(q[i], "data-show", local > SHOW_Q - 0.05);
        toggle(q[i], "data-in", local > SHOW_Q);
        toggle(typing[i], "data-show", local > TYPING[0] && local < TYPING[1]);
        toggle(a[i], "data-show", local >= SHOW_A - 0.03);
        toggle(a[i], "data-in", local >= SHOW_A);
      });
      const done = t - agenda.items.length;
      toggle(end, "data-show", done > -0.12);
      toggle(end, "data-in", done > -0.06);
      root.dataset.step = String(clamp(Math.floor(t), 0, agenda.items.length));
    });

    return () => {
      stop();
      delete root.dataset.live;
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="agenda"
      aria-labelledby="agenda-title"
      className={styles.chatSection}
      style={{ "--chat-vh": `${SECTION_VH}svh` } as React.CSSProperties}
      data-va-agenda
    >
      <div className={styles.chatStage}>
        <div className={styles.chatIntro}>
          <p className={styles.eyebrow}>{agenda.eyebrow}</p>
          <h2 id="agenda-title" className={`${styles.display} ${styles.chatTitle}`}>
            {agenda.heading}
          </h2>
          <p className={styles.chatLead}>{agenda.lead}</p>
          <div className={styles.chatHost}>
            <span className={styles.chatHostPic}>
              <Image src={host.avatar} alt="" fill sizes="84px" unoptimized />
            </span>
            <div>
              <b>{host.name}</b>
              <span className={styles.label}>{host.role}</span>
            </div>
          </div>
          <ul className={styles.chatFacts}>
            {host.facts.map(([before, strong, after]) => (
              <li key={strong}>
                <span>
                  {before}
                  <strong>{strong}</strong>
                  {after}
                </span>
              </li>
            ))}
          </ul>
          <div className={styles.chatCta}>
            <JumpLink className={styles.primary} href="#reserve">
              {ctaLabel} <span aria-hidden="true">↗</span>
            </JumpLink>
            <span className={`${styles.label} ${styles.chatMeta}`}>Free · Online · 60 minutes</span>
          </div>
        </div>

        {/* What assistive technology reads: the same questions and replies. */}
        <ol className={styles.srOnly}>
          {agenda.items.map((item) => (
            <li key={item.question}>
              {item.question} {item.reply}
            </li>
          ))}
        </ol>

        <div className={styles.chat} aria-hidden="true">
          <div className={styles.chatHeader}>
            <span className={styles.chatAvatar}>
              <Image src={host.avatar} alt="" fill sizes="40px" unoptimized />
            </span>
            <div>
              <b>{host.name}</b>
              <span>Webinar host</span>
            </div>
            <span className={`${styles.label} ${styles.chatBadge}`}>{agenda.badge}</span>
          </div>
          <div className={styles.chatFeed}>
            <div ref={feedRef} className={styles.chatMsgs} data-chat-feed>
              <span className={`${styles.label} ${styles.chatDay}`}>{agenda.day}</span>
              {agenda.items.map((item) => (
                <div key={item.question} className={styles.chatThread}>
                  <div className={`${styles.msg} ${styles.msgQ}`} data-chat-q>
                    {item.question}
                    <small>✓✓</small>
                  </div>
                  <div className={styles.msgTyping} data-chat-typing>
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className={`${styles.msg} ${styles.msgA}`} data-chat-a>
                    {item.reply}
                    <small>{agenda.replyNote}</small>
                  </div>
                </div>
              ))}
              <div className={`${styles.msg} ${styles.msgEnd}`} data-chat-end>
                <b>{agenda.closing.strong}</b>
                {agenda.closing.rest}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
