import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountSceneAnchor } from "./scene-anchor.js";

export function mountFounderFilm(root: HTMLElement) {
  gsap.registerPlugin(ScrollTrigger);
  const get = <T extends HTMLElement>(name: string) =>
    root.querySelector<T>(`[data-founder-${name}]`)!;
  const stage = get<HTMLDivElement>("stage"),
    slot = get<HTMLDivElement>("slot"),
    frame = get<HTMLDivElement>("frame"),
    video = get<HTMLVideoElement>("video"),
    poster = get<HTMLImageElement>("poster"),
    copy = get<HTMLDivElement>("copy"),
    background = get<HTMLDivElement>("background"),
    hint = get<HTMLParagraphElement>("hint"),
    watch = get<HTMLButtonElement>("watch");
  const abort = new AbortController();
  const portrait = matchMedia(
    "(max-width: 1023px) and (orientation: portrait)",
  );
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  let tween: gsap.core.Tween | undefined,
    disposed = false,
    loaded = false,
    eligible = false,
    autoAttempted = false,
    resume = false;
  let geometry = { x: 0, y: 0, width: 0, height: 0, vw: 0, vh: 0 };
  const state = { progress: 0 };
  let handoffTimer: ReturnType<typeof setTimeout> | undefined;
  let playbackReleased = false;
  function fullView() {
    const trigger = tween?.scrollTrigger;
    if (!trigger || document.hidden || disposed) return false;
    const actual =
      (window.scrollY - trigger.start) / (trigger.end - trigger.start);
    const rect = stage.getBoundingClientRect();
    return (
      state.progress >= 0.74 &&
      actual >= 0.74 &&
      rect.top >= -1 &&
      rect.top <= 1 &&
      rect.bottom >= window.innerHeight - 2
    );
  }
  function stopPlayback() {
    clearTimeout(handoffTimer);
    handoffTimer = undefined;
    playbackReleased = false;
    video.pause();
  }
  function releasePlayback() {
    if (
      !eligible ||
      !fullView() ||
      autoAttempted ||
      handoffTimer ||
      video.readyState < 2
    )
      return;
    // Reveal the ready first frame before the playback clock is allowed to run.
    root.dataset.filmReady = "true";
    const finishHandoff = () => {
      handoffTimer = undefined;
      if (!eligible || !fullView()) return;
      // Compositor transitions may start late under load. Elapsed time alone
      // cannot prove that the poster has actually left the screen.
      if (Number(getComputedStyle(poster.parentElement!).opacity) > 0) {
        handoffTimer = setTimeout(finishHandoff, 16);
        return;
      }
      playbackReleased = true;
      autoAttempted = true;
      play();
    };
    handoffTimer = setTimeout(finishHandoff, 220);
  }
  function load(eager = false) {
    video.preload = eager ? "auto" : "metadata";
    if (!loaded) {
      loaded = true;
      video.load();
    }
  }
  function play() {
    if (root.dataset.enhanced === "true" && (!playbackReleased || !fullView()))
      return;
    load(true);
    void video
      .play()
      .then(() => {
        if (
          disposed ||
          document.hidden ||
          (root.dataset.enhanced === "true" && (!eligible || !fullView()))
        )
          video.pause();
      })
      .catch(() => {
        /* Native controls remain available if autoplay is blocked. */
      });
  }
  function draw() {
    const t = Math.max(0, Math.min(1, (state.progress - 0.18) / 0.56));
    const ease = t * t * (3 - 2 * t);
    root.style.setProperty("--preview-depth", String(1 - ease));
    const { x, y, width, height, vw, vh } = geometry;
    frame.style.clipPath = `inset(${y * (1 - ease)}px ${(vw - x - width) * (1 - ease)}px ${(vh - y - height) * (1 - ease)}px ${x * (1 - ease)}px round ${24 * (1 - ease)}px)`;
    const ratio = portrait.matches ? 9 / 16 : 16 / 9;
    const startScale = width / Math.min(vw, vh * ratio);
    video.style.transform = `translateY(${(y + height / 2 - vh / 2) * (1 - ease)}px) scale(${startScale + (1 - startScale) * ease})`;
    const posterScale = width / Math.min(vw, vh * (1672 / 941));
    poster.style.transform = `translateY(${(y + height / 2 - vh / 2) * (1 - ease)}px) scale(${posterScale + (1 - posterScale) * ease})`;
    const departure = Math.max(0, Math.min(1, (state.progress - 0.08) / 0.2));
    const fade = 1 - departure * departure * (3 - 2 * departure);
    copy.style.transform = `translateY(${-12 * (1 - fade)}px)`;
    copy.style.opacity = String(fade);
    background.style.opacity = String(0.65 * (1 - ease));
    hint.style.opacity = String(fade);
    watch.style.opacity = String(fade);
    watch.style.visibility = fade > 0.05 ? "visible" : "hidden";
    const rect = root.getBoundingClientRect();
    const next = fullView() && rect.top <= 1 && rect.bottom >= vh - 1;
    root.dataset.expanded = String(next);
    root.dataset.founderProgress = state.progress.toFixed(3);
    video.controls = next;
    video.tabIndex = next ? 0 : -1;
    if (next !== eligible) {
      eligible = next;
      if (next && !autoAttempted) {
        load(true);
        releasePlayback();
      }
      if (!next) {
        stopPlayback();
        autoAttempted = false;
      }
    }
  }
  function setup() {
    if (disposed) return;
    stopPlayback();
    tween?.scrollTrigger?.kill();
    tween?.kill();
    tween = undefined;
    const mediaPath = portrait.matches
      ? "/media/founder/ceo-story-portrait-v062.mp4"
      : "/media/founder/ceo-story-desktop-v062.mp4";
    root.dataset.portrait = String(portrait.matches);
    video.poster = "/media/founder/founder-dream-v063.webp";
    if (video.getAttribute("src") !== mediaPath) {
      delete root.dataset.filmReady;
      const retainedTime = video.currentTime;
      video.addEventListener(
        "loadedmetadata",
        () => {
          if (retainedTime > 0)
            video.currentTime = Math.min(
              retainedTime,
              video.duration || retainedTime,
            );
        },
        { once: true, signal: abort.signal },
      );
      video.src = mediaPath;
    }
    root.removeAttribute("data-enhanced");
    root.removeAttribute("data-expanded");
    for (const el of [
      frame,
      video,
      poster,
      copy,
      background,
      hint,
      watch,
      slot,
    ])
      el.removeAttribute("style");
    video.controls = true;
    video.tabIndex = 0;
    video.pause();
    eligible = false;
    autoAttempted = false;
    if (reduced.matches || saveData) return;
    root.dataset.enhanced = "true";
    const content = get<HTMLDivElement>("inner");
    const layout = getComputedStyle(content);
    const availableHeight =
      stage.clientHeight -
      copy.scrollHeight -
      hint.offsetHeight -
      parseFloat(layout.paddingTop) -
      parseFloat(layout.paddingBottom) -
      2 * parseFloat(layout.rowGap);
    const ratio = 1672 / 941;
    const desiredWidth = slot.getBoundingClientRect().width;
    slot.style.width = `${Math.max(0, Math.min(desiredWidth, availableHeight * ratio))}px`;
    const requiredHeight =
      copy.scrollHeight +
      slot.offsetHeight +
      hint.offsetHeight +
      parseFloat(layout.paddingTop) +
      parseFloat(layout.paddingBottom) +
      2 * parseFloat(layout.rowGap);
    if (
      availableHeight < 160 ||
      requiredHeight > stage.clientHeight + 2 ||
      content.scrollHeight > stage.clientHeight + 1
    ) {
      root.removeAttribute("data-enhanced");
      return;
    }
    const sr = stage.getBoundingClientRect(),
      r = slot.getBoundingClientRect();
    geometry = {
      x: r.left - sr.left,
      y: r.top - sr.top,
      width: r.width,
      height: r.height,
      vw: sr.width,
      vh: sr.height,
    };
    root.style.setProperty("--watch-top", `${r.bottom - sr.top + 12}px`);
    root.style.setProperty("--preview-top", `${r.top - sr.top}px`);
    root.style.setProperty("--preview-width", `${r.width}px`);
    root.style.setProperty("--preview-height", `${r.height}px`);
    state.progress = 0;
    tween = gsap.to(state, {
      progress: 1,
      ease: "none",
      onUpdate: draw,
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        invalidateOnRefresh: false,
        onUpdate: () => {
          if (!fullView()) {
            eligible = false;
            autoAttempted = false;
            root.dataset.expanded = "false";
            stopPlayback();
          }
        },
      },
    });
    draw();
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !saveData) load();
      else if (!entry.isIntersecting) video.pause();
    },
    { rootMargin: "300px" },
  );
  observer.observe(root);
  video.addEventListener(
    "playing",
    () => {
      if (
        document.hidden ||
        (root.dataset.enhanced === "true" && (!playbackReleased || !fullView()))
      ) {
        stopPlayback();
        return;
      }
      root.dataset.filmReady = "true";
    },
    { signal: abort.signal },
  );
  video.addEventListener("canplay", releasePlayback, { signal: abort.signal });
  video.addEventListener(
    "play",
    () => {
      if (
        document.hidden ||
        (root.dataset.enhanced === "true" && (!playbackReleased || !fullView()))
      )
        stopPlayback();
    },
    { signal: abort.signal },
  );
  window.addEventListener(
    "scroll",
    () => {
      if (root.dataset.enhanced === "true" && !fullView()) {
        eligible = false;
        autoAttempted = false;
        root.dataset.expanded = "false";
        stopPlayback();
      }
    },
    { passive: true, signal: abort.signal },
  );
  const viewportObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) video.pause();
    },
    { threshold: 0 },
  );
  viewportObserver.observe(video);
  watch.addEventListener(
    "click",
    () => {
      if (!tween?.scrollTrigger) {
        play();
        return;
      }
      const trigger = tween.scrollTrigger;
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * 0.82,
        behavior: "instant",
      });
      ScrollTrigger.update();
    },
    { signal: abort.signal },
  );
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        resume = !video.paused;
        clearTimeout(handoffTimer);
        handoffTimer = undefined;
        video.pause();
      } else if (resume && fullView()) {
        resume = false;
        eligible = false;
        autoAttempted = false;
        draw();
        releasePlayback();
      } else if (!autoAttempted && root.dataset.enhanced === "true") {
        draw();
        releasePlayback();
      }
    },
    { signal: abort.signal },
  );
  let timer: ReturnType<typeof setTimeout>;
  const resize = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      setup();
      ScrollTrigger.refresh();
    }, 150);
  };
  window.addEventListener("resize", resize, { signal: abort.signal });
  reduced.addEventListener("change", resize, { signal: abort.signal });
  void document.fonts.ready.then(() => {
    if (!disposed) {
      setup();
      ScrollTrigger.refresh();
    }
  });
  const unanchor = mountSceneAnchor(root, {
    hashes: ["#background-lines", "#our-founder"],
  });
  return () => {
    disposed = true;
    abort.abort();
    clearTimeout(timer);
    observer.disconnect();
    viewportObserver.disconnect();
    unanchor();
    tween?.scrollTrigger?.kill();
    tween?.kill();
    video.pause();
    clearTimeout(handoffTimer);
  };
}
