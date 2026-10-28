import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountSceneAnchor } from "./scene-anchor.js";

export function mountFounderFilm(
  root: HTMLElement,
  media: {
    onLoading?: () => void;
    onFailure?: () => void;
    onSourceChange?: (source: string) => void;
  } = {},
) {
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
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let retryCount = 0;
  let restorePosition: (() => void) | undefined;
  let checkpointOffered = false;
  let recentHumanScroll = 0;
  let checkpointTimer: ReturnType<typeof setTimeout> | undefined;
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;
  function checkpointTarget() {
    const trigger = tween?.scrollTrigger;
    return trigger
      ? trigger.start + (trigger.end - trigger.start) * 0.82
      : undefined;
  }
  function offerCheckpoint() {
    const target = checkpointTarget();
    if (
      target === undefined ||
      checkpointOffered ||
      disposed ||
      reduced.matches ||
      saveData ||
      root.dataset.enhanced !== "true"
    )
      return;
    checkpointOffered = true;
    clearTimeout(checkpointTimer);
    checkpointTimer = undefined;
    window.scrollTo({ top: target, behavior: "smooth" });
  }
  function retainPosition(time: number) {
    if (restorePosition)
      video.removeEventListener("loadedmetadata", restorePosition);
    restorePosition = () => {
      if (time > 0 && Number.isFinite(video.duration))
        video.currentTime = Math.min(time, video.duration);
    };
    video.addEventListener("loadedmetadata", restorePosition, {
      once: true,
      signal: abort.signal,
    });
  }
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
  function load(eager = false, force = false) {
    // Wait for responsive source selection instead of loading the SSR source
    // and immediately aborting it when setup assigns the same URL to video.src.
    if (!video.hasAttribute("src")) return;
    video.preload = eager ? "auto" : "metadata";
    if (!loaded || force) {
      loaded = true;
      media.onLoading?.();
      // Changing preload resumes the selected source. Calling load() here too
      // aborts that fresh request; reserve it for recovery from a real error.
      if (force) video.load();
    }
  }
  function retry(manual = false) {
    if (disposed) return;
    clearTimeout(retryTimer);
    retryTimer = undefined;
    if (manual) retryCount = 0;
    retainPosition(video.currentTime);
    stopPlayback();
    autoAttempted = false;
    delete root.dataset.filmReady;
    eligible = fullView();
    load(true, true);
    if (manual && root.dataset.enhanced !== "true") play();
  }
  function failed() {
    if (!video.error || video.error.code === 1 || disposed) return;
    stopPlayback();
    autoAttempted = false;
    delete root.dataset.filmReady;
    clearTimeout(retryTimer);
    // Chromium can report a failed HTTP request as MEDIA_ERR_SRC_NOT_SUPPORTED.
    // Reload the same approved source at most twice, including that error code.
    if (retryCount < 2 && navigator.onLine && !document.hidden) {
      const delay = retryCount++ === 0 ? 650 : 1500;
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        const rect = root.getBoundingClientRect();
        if (
          rect.bottom > -300 &&
          rect.top < innerHeight + 300 &&
          !document.hidden
        )
          retry();
        else media.onFailure?.();
      }, delay);
    } else media.onFailure?.();
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
      .catch((error: DOMException) => {
        // Scroll-only autoplay with audio can be blocked. Keep the film moving
        // silently in that case; the native player lets visitors enable sound.
        if (
          error.name === "NotAllowedError" &&
          !video.muted &&
          !disposed &&
          (root.dataset.enhanced !== "true" || (eligible && fullView()))
        ) {
          video.muted = true;
          void video.play().catch(() => {});
        }
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
    // Cover the current aperture, not just its initial and final widths. The
    // aperture changes aspect ratio during expansion; contain leaves side bands.
    const posterRatio = portrait.matches ? 941 / 1672 : 1672 / 941;
    const posterWidth = Math.min(vw, vh * posterRatio);
    const posterHeight = posterWidth / posterRatio;
    const posterScale = Math.max(
      (width + (vw - width) * ease) / posterWidth,
      (height + (vh - height) * ease) / posterHeight,
    );
    // On wider portrait tablets, favour the headline instead of cropping equal
    // amounts from the artwork's top and the less important lower chair.
    const apertureHeight = height + (vh - height) * ease;
    const portraitOffset = portrait.matches
      ? Math.max(0, posterHeight * posterScale - apertureHeight) * 0.25
      : 0;
    poster.style.transform = `translateY(${(y + height / 2 - vh / 2) * (1 - ease) + portraitOffset}px) scale(${posterScale})`;
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
      if (next && !checkpointOffered) {
        clearTimeout(noticeTimer);
        noticeTimer = setTimeout(() => {
          if (fullView()) checkpointOffered = true;
        }, 500);
      }
      if (!next) {
        clearTimeout(noticeTimer);
        stopPlayback();
        autoAttempted = false;
      }
    }
  }
  function setup() {
    if (disposed) return;
    clearTimeout(noticeTimer);
    clearTimeout(checkpointTimer);
    stopPlayback();
    tween?.scrollTrigger?.kill();
    tween?.kill();
    tween = undefined;
    const mediaPath = portrait.matches
      ? "/media/founder/ceo-story-portrait-v062.mp4"
      : "/media/founder/ceo-story-desktop-v062.mp4";
    root.dataset.portrait = String(portrait.matches);
    video.poster = portrait.matches
      ? "/media/founder/founder-dream-portrait-v073.webp"
      : "/media/founder/founder-dream-v063.webp";
    if (video.getAttribute("src") !== mediaPath) {
      clearTimeout(retryTimer);
      retryTimer = undefined;
      retryCount = 0;
      loaded = false;
      media.onLoading?.();
      media.onSourceChange?.(mediaPath);
      delete root.dataset.filmReady;
      retainPosition(video.currentTime);
      video.preload = "none";
      video.src = mediaPath;
      const rect = root.getBoundingClientRect();
      if (!saveData && rect.bottom > -300 && rect.top < innerHeight + 300)
        load();
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
    const ratio = portrait.matches ? 941 / 1672 : 1672 / 941;
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
        onLeave: (trigger) => {
          // A touch fling can cross the short playback window between two
          // scroll samples. Bring a first-time visitor back to the film once,
          // then leave every subsequent scroll entirely under their control.
          if (
            checkpointOffered ||
            performance.now() - recentHumanScroll > 900 ||
            window.scrollY - trigger.end > innerHeight * 1.25 ||
            (location.hash &&
              !["#background-lines", "#our-founder"].includes(location.hash))
          )
            return;
          clearTimeout(checkpointTimer);
          checkpointTimer = setTimeout(offerCheckpoint, 180);
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
  video.addEventListener("error", failed, { signal: abort.signal });
  root.addEventListener("founder:retry", () => retry(true), {
    signal: abort.signal,
  });
  window.addEventListener(
    "online",
    () => {
      const rect = root.getBoundingClientRect();
      if (video.error && rect.bottom > 0 && rect.top < innerHeight) retry(true);
    },
    { signal: abort.signal },
  );
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
  window.addEventListener(
    "wheel",
    (event) => {
      const target = checkpointTarget();
      const trigger = tween?.scrollTrigger;
      if (
        trigger &&
        window.scrollY >= trigger.start - innerHeight * 0.5 &&
        window.scrollY <= trigger.end + innerHeight
      )
        recentHumanScroll = performance.now();
      if (
        target === undefined ||
        !trigger ||
        checkpointOffered ||
        event.deltaY <= 0 ||
        window.scrollY < trigger.start - innerHeight * 0.5 ||
        window.scrollY >= target
      )
        return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (window.scrollY + delta >= target) {
        event.preventDefault();
        offerCheckpoint();
      }
    },
    { passive: false, signal: abort.signal },
  );
  window.addEventListener(
    "touchstart",
    () => {
      const rect = root.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0)
        recentHumanScroll = performance.now();
    },
    { passive: true, signal: abort.signal },
  );
  window.addEventListener(
    "keydown",
    (event) => {
      const trigger = tween?.scrollTrigger;
      if (
        trigger &&
        window.scrollY >= trigger.start - innerHeight * 0.5 &&
        window.scrollY <= trigger.end + innerHeight &&
        ["PageDown", "ArrowDown", " "].includes(event.key)
      )
        recentHumanScroll = performance.now();
    },
    { signal: abort.signal },
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
      checkpointOffered = true;
      video.muted = false;
      if (video.error) retry(true);
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
    clearTimeout(retryTimer);
    clearTimeout(checkpointTimer);
    clearTimeout(noticeTimer);
  };
}
