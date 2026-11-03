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
    thumbnail = get<HTMLElement>("thumbnail"),
    copy = get<HTMLDivElement>("copy"),
    background = get<HTMLDivElement>("background"),
    hint = get<HTMLParagraphElement>("hint"),
    watch = get<HTMLButtonElement>("watch"),
    dialog = get<HTMLDialogElement>("dialog"),
    player = get<HTMLVideoElement>("dialog-video"),
    playButton = get<HTMLButtonElement>("dialog-play"),
    continueButton = get<HTMLButtonElement>("dialog-continue"),
    dialogMessage = get<HTMLParagraphElement>("dialog-message");
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
    loaded = false;
  let geometry = { x: 0, y: 0, width: 0, height: 0, vw: 0, vh: 0 };
  const state = { progress: 0 };
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let retryCount = 0;
  let restorePosition: (() => void) | undefined;
  let checkpointOffered = false;
  let recentHumanScroll = -Infinity;
  let suppressCheckpointUntilInput = false;
  let lastScrollY = window.scrollY;
  let viewportWidth = innerWidth;
  let viewportRatio = devicePixelRatio || 1;
  let scrollBeforeDialog = 0;
  let advanceOnClose = false;
  let pendingResize = false;
  let savedOverflow: { html: string; body: string } | undefined;
  function checkpointTarget() {
    const trigger = tween?.scrollTrigger;
    return trigger
      ? trigger.start + (trigger.end - trigger.start) * 0.82
      : undefined;
  }
  function fallbackThreshold() {
    const bottom = root.getBoundingClientRect().bottom + window.scrollY;
    return bottom - Math.min(innerHeight * 0.25, 160);
  }
  function offerCheckpoint(playImmediately = false) {
    const target =
      checkpointTarget() ??
      Math.max(
        0,
        root.getBoundingClientRect().top +
          window.scrollY +
          root.offsetHeight -
          innerHeight,
      );
    if (dialog.open || disposed || reduced.matches || saveData) return;
    checkpointOffered = true;
    scrollBeforeDialog = target;
    window.scrollTo({ top: target, behavior: "instant" });
    ScrollTrigger.update();
    const mediaPath = portrait.matches
      ? "/media/founder/ceo-story-portrait-v062.mp4"
      : "/media/founder/ceo-story-desktop-v062.mp4";
    player.poster = portrait.matches
      ? "/media/founder/founder-film-still-portrait-v1.webp"
      : "/media/founder/founder-film-still-desktop-v1.webp";
    if (player.getAttribute("src") !== mediaPath) {
      player.src = mediaPath;
      player.preload = "metadata";
    }
    player.muted = false;
    player.volume = 1;
    delete dialog.dataset.playing;
    dialogMessage.textContent = "";
    playButton.innerHTML =
      '<span aria-hidden="true">▶</span> Play film with sound';
    dialog.showModal();
    savedOverflow = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (playImmediately) playWithSound();
    else playButton.focus();
  }
  function playWithSound() {
    if (!dialog.open) return;
    player.muted = false;
    player.volume = 1;
    if (player.ended) player.currentTime = 0;
    dialogMessage.textContent = "Loading film…";
    // This runs directly from a click. Browsers do not reliably allow audible
    // playback initiated only by scroll position.
    void player.play().catch(() => {
      if (!dialog.open || disposed) return;
      delete dialog.dataset.playing;
      dialogMessage.textContent =
        "Playback did not start. Select Play with sound again.";
      playButton.focus();
    });
  }
  function closeInterlude(advance = false) {
    if (!dialog.open) return;
    advanceOnClose = advance;
    dialog.close();
  }
  function restoreScroll() {
    if (!savedOverflow) return;
    document.documentElement.style.overflow = savedOverflow.html;
    document.body.style.overflow = savedOverflow.body;
    savedOverflow = undefined;
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
    video.pause();
  }
  function load(eager = false, force = false) {
    if (root.dataset.enhanced === "true") return;
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
    delete root.dataset.filmReady;
    load(true, true);
    if (manual && root.dataset.enhanced !== "true") play();
  }
  function failed() {
    if (
      !video.error ||
      video.error.code === 1 ||
      disposed ||
      root.dataset.enhanced === "true"
    )
      return;
    stopPlayback();
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
    load(true);
    video.muted = false;
    void video.play().catch(() => media.onFailure?.());
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
    // The film still is visual evidence, so cover the aperture at every point
    // rather than preserving the old artwork's lettering and side bands.
    // A portrait card can be narrower than the viewport. Cover both card
    // dimensions at the start so the reveal has no empty top or bottom bands.
    const posterScale = Math.max(width / vw, height / vh) * (1 - ease) + ease;
    const imageY = (y + height / 2 - vh / 2) * (1 - ease);
    // The wide phone cover opens onto portrait footage. Keep the founder's
    // hair clear of the shrinking top mask, then return to the true film
    // framing as the mask reaches the viewport.
    const wideCover = portrait.matches && innerWidth <= 1023;
    const renderedHeight = Math.max(vh, (vw * 16) / 9);
    const hairInStage = (vh - renderedHeight) / 2 + renderedHeight * 0.18;
    const hairY = vh / 2 + (hairInStage - vh / 2) * posterScale + imageY;
    const coverHeadroom = wideCover
      ? Math.max(0, y * (1 - ease) + 30 - hairY)
      : 0;
    const imageTransform = `translateY(${imageY}px) scale(${posterScale})`;
    poster.style.transform = `translateY(${imageY + coverHeadroom}px) scale(${posterScale})`;
    thumbnail.style.transform = imageTransform;
    // The cover and the footage still use different facial poses. Keep the
    // cover intact through the introduction, then make a deliberate cut to
    // the footage still before the aperture expands. A scrubbed crossfade
    // superimposes both faces, even when the visitor pauses mid-scroll.
    const coverVisible = state.progress < 0.155;
    thumbnail.style.opacity = coverVisible ? "1" : "0";
    thumbnail.style.visibility = coverVisible ? "visible" : "hidden";
    poster.style.opacity = "1";
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
    video.controls = false;
    video.tabIndex = -1;
  }
  function setup() {
    if (disposed) return;
    if (dialog.open) {
      pendingResize = true;
      return;
    }
    stopPlayback();
    tween?.scrollTrigger?.kill();
    tween?.kill();
    tween = undefined;
    const mediaPath = portrait.matches
      ? "/media/founder/ceo-story-portrait-v062.mp4"
      : "/media/founder/ceo-story-desktop-v062.mp4";
    root.dataset.portrait = String(portrait.matches);
    video.poster = portrait.matches
      ? "/media/founder/founder-thumbnail-portrait-v3.webp"
      : "/media/founder/founder-thumbnail-desktop-v3.webp";
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
    }
    root.removeAttribute("data-enhanced");
    root.removeAttribute("data-expanded");
    delete root.dataset.filmReady;
    for (const el of [
      frame,
      video,
      poster,
      thumbnail,
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
    if (reduced.matches || saveData) {
      load();
      return;
    }
    root.dataset.enhanced = "true";
    video.controls = false;
    video.tabIndex = -1;
    const content = get<HTMLDivElement>("inner");
    const layout = getComputedStyle(content);
    const availableHeight =
      stage.clientHeight -
      copy.scrollHeight -
      hint.offsetHeight -
      parseFloat(layout.paddingTop) -
      parseFloat(layout.paddingBottom) -
      2 * parseFloat(layout.rowGap);
    const compactCover = portrait.matches && innerWidth <= 1023;
    const ratio = compactCover
      ? 4 / 3
      : portrait.matches
        ? 941 / 1672
        : 1672 / 941;
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
      video.controls = true;
      video.tabIndex = 0;
      load();
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
    const watchBelowPreview = compactCover;
    root.style.setProperty(
      "--watch-top",
      `${r.bottom - sr.top + (watchBelowPreview ? 6 : portrait.matches ? -58 : 12)}px`,
    );
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
        onUpdate: (trigger) => {
          const target = checkpointTarget();
          if (
            root.dataset.enhanced === "true" &&
            !suppressCheckpointUntilInput &&
            target !== undefined &&
            trigger.direction > 0 &&
            window.scrollY >= target &&
            !checkpointOffered &&
            performance.now() - recentHumanScroll < 1500
          )
            offerCheckpoint();
        },
        onLeave: (trigger) => {
          // A fast wheel, key or touch gesture can cross the entire film hold
          // between samples. An intentional hash jump remains free to pass.
          if (
            root.dataset.enhanced !== "true" ||
            suppressCheckpointUntilInput ||
            checkpointOffered ||
            trigger.direction <= 0 ||
            performance.now() - recentHumanScroll > 1500
          )
            return;
          offerCheckpoint();
        },
      },
    });
    draw();
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !saveData && root.dataset.enhanced !== "true")
        load();
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
      if (root.dataset.enhanced !== "true") root.dataset.filmReady = "true";
    },
    { signal: abort.signal },
  );
  player.addEventListener(
    "playing",
    () => {
      if (dialog.open) {
        dialog.dataset.playing = "true";
        dialogMessage.textContent = "";
      }
    },
    { signal: abort.signal },
  );
  player.addEventListener(
    "pause",
    () => {
      if (dialog.open && !player.ended) {
        delete dialog.dataset.playing;
        playButton.innerHTML =
          '<span aria-hidden="true">▶</span> Resume film with sound';
      }
    },
    { signal: abort.signal },
  );
  player.addEventListener(
    "error",
    () => {
      if (!dialog.open) return;
      delete dialog.dataset.playing;
      dialogMessage.textContent =
        "The film could not load. Check your connection and retry.";
      playButton.innerHTML =
        '<span aria-hidden="true">▶</span> Retry film with sound';
    },
    { signal: abort.signal },
  );
  player.addEventListener("ended", () => closeInterlude(), {
    signal: abort.signal,
  });
  playButton.addEventListener(
    "click",
    () => {
      if (player.error) player.load();
      playWithSound();
    },
    { signal: abort.signal },
  );
  continueButton.addEventListener("click", () => closeInterlude(true), {
    signal: abort.signal,
  });
  dialog.addEventListener(
    "close",
    () => {
      player.pause();
      delete dialog.dataset.playing;
      restoreScroll();
      root.tabIndex = -1;
      root.focus({ preventScroll: true });
      const nextScroll = advanceOnClose
        ? (tween?.scrollTrigger?.end ??
            root.getBoundingClientRect().top +
              window.scrollY +
              root.offsetHeight) + 2
        : scrollBeforeDialog;
      advanceOnClose = false;
      window.scrollTo({ top: nextScroll, behavior: "instant" });
      if (pendingResize) {
        pendingResize = false;
        setup();
        ScrollTrigger.refresh();
      }
    },
    { signal: abort.signal },
  );
  window.addEventListener(
    "wheel",
    (event) => {
      // Ctrl or Command + wheel belongs to browser zoom, never to the film's
      // fast-scroll checkpoint.
      if (event.ctrlKey || event.metaKey) return;
      recentHumanScroll = performance.now();
      suppressCheckpointUntilInput = false;
      const trigger = tween?.scrollTrigger;
      const target = checkpointTarget();
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (
        trigger &&
        target !== undefined &&
        !checkpointOffered &&
        delta > 0 &&
        window.scrollY >= trigger.start - innerHeight * 0.5 &&
        window.scrollY + delta >= target
      ) {
        event.preventDefault();
        offerCheckpoint();
      } else if (
        root.dataset.enhanced !== "true" &&
        !reduced.matches &&
        !saveData &&
        !checkpointOffered &&
        delta > 0 &&
        window.scrollY <= fallbackThreshold() &&
        window.scrollY + delta >= fallbackThreshold()
      ) {
        event.preventDefault();
        offerCheckpoint();
      }
    },
    { passive: false, signal: abort.signal },
  );
  window.addEventListener(
    "scroll",
    () => {
      const current = window.scrollY;
      if (
        !checkpointOffered &&
        root.dataset.enhanced !== "true" &&
        !suppressCheckpointUntilInput &&
        !reduced.matches &&
        !saveData &&
        current > lastScrollY &&
        performance.now() - recentHumanScroll < 1500
      ) {
        const bottom = root.getBoundingClientRect().bottom + current;
        if (lastScrollY < bottom && current >= bottom - innerHeight * 0.25)
          offerCheckpoint();
      }
      lastScrollY = window.scrollY;
    },
    { passive: true, signal: abort.signal },
  );
  window.addEventListener(
    "touchstart",
    () => {
      recentHumanScroll = performance.now();
      suppressCheckpointUntilInput = false;
    },
    { passive: true, signal: abort.signal },
  );
  window.addEventListener(
    "keydown",
    (event) => {
      if (["PageDown", "ArrowDown", " ", "End"].includes(event.key))
        recentHumanScroll = performance.now();
      if (["PageDown", "ArrowDown", " ", "End"].includes(event.key))
        suppressCheckpointUntilInput = false;
    },
    { signal: abort.signal },
  );
  document.addEventListener(
    "click",
    (event) => {
      if ((event.target as Element).closest?.('a[href^="#"]')) {
        suppressCheckpointUntilInput = true;
        recentHumanScroll = -Infinity;
      }
    },
    { capture: true, signal: abort.signal },
  );
  window.addEventListener(
    "hashchange",
    () => {
      suppressCheckpointUntilInput = true;
      recentHumanScroll = -Infinity;
    },
    { signal: abort.signal },
  );
  watch.addEventListener(
    "click",
    () => {
      if (reduced.matches || saveData) {
        video.muted = false;
        if (video.error) retry(true);
        play();
        return;
      }
      offerCheckpoint(true);
    },
    { signal: abort.signal },
  );
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        player.pause();
        video.pause();
      }
    },
    { signal: abort.signal },
  );
  let timer: ReturnType<typeof setTimeout>;
  const resize = () => {
    const nextRatio = devicePixelRatio || 1;
    if (
      innerWidth !== viewportWidth ||
      Math.abs(nextRatio - viewportRatio) > 0.01
    )
      recentHumanScroll = -Infinity;
    viewportWidth = innerWidth;
    viewportRatio = nextRatio;
    clearTimeout(timer);
    timer = setTimeout(() => {
      setup();
      if (!dialog.open) ScrollTrigger.refresh();
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
    unanchor();
    tween?.scrollTrigger?.kill();
    tween?.kill();
    video.pause();
    player.pause();
    if (dialog.open) dialog.close();
    restoreScroll();
    clearTimeout(retryTimer);
  };
}
