import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountSceneAnchor } from "./scene-anchor.js";

const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export function mountWhoWeAre(root: HTMLDivElement) {
  gsap.registerPlugin(ScrollTrigger);
  const get = <T extends HTMLElement>(name: string) =>
    root.querySelector<T>(`[data-who-${name}]`)!;
  const viewport = get<HTMLDivElement>("viewport"),
    copy = get<HTMLDivElement>("copy"),
    description = get<HTMLParagraphElement>("description"),
    frame = get<HTMLElement>("frame"),
    matte = get<HTMLDivElement>("matte"),
    surface = get<HTMLDivElement>("surface"),
    plane = get<HTMLDivElement>("plane"),
    video = get<HTMLVideoElement>("video"),
    error = get<HTMLParagraphElement>("error");
  const background = get<HTMLDivElement>("background");
  const panelLeft = root.querySelector<HTMLDivElement>(
    '[data-who-panel="left"]',
  )!;
  const desktop = matchMedia("(min-width: 1024px)"),
    reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  const abort = new AbortController(),
    main = root.closest("main");
  const state = { progress: 0 };
  let tween: gsap.core.Tween | undefined,
    geometry:
      | {
          w: number;
          h: number;
          x: number;
          y: number;
          cw: number;
          ch: number;
          gutter: number;
          backdropTop: number;
          baseWidth: number;
          coverScale: number;
        }
      | undefined;
  let disposed = false,
    near = false,
    visible = !document.hidden,
    loaded = false,
    failed = false,
    raf = 0,
    timer = 0,
    loadTimer = 0,
    resizeRelease = 0,
    targetTime = 0,
    duration = 31.666667;
  let resizeProgress: number | null = null;
  let stableProgress: number | null = null;
  let resizing = false;
  let measuredWidth = 0,
    measuredHeight = 0;
  let restoreFlow = false;
  delete video.dataset.loading;

  function seek() {
    if (
      disposed ||
      !loaded ||
      !near ||
      !visible ||
      main?.inert ||
      root.dataset.mode !== "motion" ||
      video.seeking
    )
      return;
    if (Math.abs(video.currentTime - targetTime) > 1 / 60)
      video.currentTime = targetTime;
  }
  function draw(force = false) {
    raf = 0;
    if (
      !geometry ||
      disposed ||
      (!force && (!visible || !near || main?.inert)) ||
      root.dataset.mode !== "motion"
    )
      return;
    const { w, h, x, y, cw, ch, gutter, backdropTop, baseWidth, coverScale } =
        geometry,
      p = clamp(state.progress),
      e = smooth(p / 0.19);
    const left = x * (1 - e),
      top = y * (1 - e),
      right = (w - x - cw) * (1 - e),
      bottom = (h - y - ch) * (1 - e),
      radius = 20 * (1 - e);
    frame.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
    const scale = mix(cw / baseWidth, coverScale, e);
    surface.style.transform = `scale(${scale})`;
    background.style.clipPath = `inset(${backdropTop * (1 - e)}px ${gutter * (1 - e)}px ${backdropTop * (1 - e)}px ${gutter * (1 - e)}px round ${24 * (1 - e)}px)`;
    const wipe = smooth(p / 0.045);
    copy.style.opacity = "1";
    copy.style.clipPath = `inset(0 0 ${wipe * 100}% 0)`;
    copy.style.visibility = wipe === 1 ? "hidden" : "visible";
    copy.style.transform = `translate3d(0,${-24 * wipe}px,0)`;
    description.style.clipPath = `inset(${wipe * 100}% 0 0 0)`;
    description.style.visibility = wipe === 1 ? "hidden" : "visible";
    description.style.transform = `translate3d(0,${24 * wipe}px,0)`;
    const split = smooth((p - 0.02) / 0.17),
      splitDistance = w * 0.78 * split;
    panelLeft.style.transform = `translate3d(${-splitDistance}px,0,0)`;
    plane.style.transform = `translate3d(${splitDistance}px,0,0)`;
    targetTime = clamp((p - 0.205) / 0.735) * Math.max(0, duration - 1 / 30);
    root.dataset.progress = p.toFixed(5);
    root.dataset.targetTime = targetTime.toFixed(4);
    root.dataset.expanded = String(e === 1);
    root.dataset.split = split.toFixed(5);
    seek();
  }
  function requestDraw() {
    if (!raf && !disposed && near && visible)
      raf = requestAnimationFrame(() => draw());
  }
  function reset() {
    tween?.scrollTrigger?.kill();
    tween?.kill();
    tween = undefined;
    for (const el of [
      frame,
      matte,
      surface,
      copy,
      description,
      plane,
      panelLeft,
      background,
    ])
      el.removeAttribute("style");
    geometry = undefined;
    stableProgress = null;
    video.pause();
    video.controls = true;
    root.dataset.mode = "static";
    root.style.removeProperty("--who-travel");
    root.style.removeProperty("--who-panel-inset");
  }
  function measure() {
    if (disposed) return;
    // Use the owner recorded before the viewport changed. A new upstream
    // pin can temporarily put this scene under the viewport during reflow.
    const oldProgress = resizing
      ? resizeProgress
      : (resizeProgress ?? stableProgress);
    resizing = false;
    reset();
    if (!desktop.matches || reduced.matches || saveData || failed) {
      resizeProgress = oldProgress;
      restoreFlow = oldProgress !== null && desktop.matches;
      clearTimeout(resizeRelease);
      if (!desktop.matches && video.dataset.loading) {
        video.preload = "none";
        video.load();
        delete video.dataset.loading;
        loaded = false;
      }
      ScrollTrigger.refresh();
      restoreProgress();
      return;
    }
    root.dataset.mode = "motion";
    restoreFlow = false;
    const w = document.documentElement.clientWidth,
      h = viewport.clientHeight;
    // Reserve the floating navigation clearance, then give short desktop
    // windows their space back without shrinking text or moving the film off-center.
    const backdropTop = clamp((h - 500) / 4, 16, 96),
      gap = clamp(h * 0.035, 24, 32);
    root.style.setProperty("--who-panel-inset", `${backdropTop}px`);
    const gutter = parseFloat(getComputedStyle(copy).left) - 32,
      copyBottom = copy.offsetTop + copy.offsetHeight,
      descriptionTop = description.offsetTop,
      halfRoom = Math.min(
        h / 2 - copyBottom - gap,
        descriptionTop - gap - h / 2,
      );
    const cw = Math.min(920, w * 0.64, (halfRoom * 2 * 16) / 9),
      ch = (cw * 9) / 16;
    if (cw < 240 || halfRoom <= 0) {
      reset();
      resizeProgress = oldProgress;
      restoreFlow = oldProgress !== null;
      ScrollTrigger.refresh();
      restoreProgress();
      return;
    }
    const x = (w - cw) / 2,
      y = (h - ch) / 2,
      baseWidth = Math.min(w, (h * 16) / 9),
      baseHeight = (baseWidth * 9) / 16;
    geometry = {
      w,
      h,
      x,
      y,
      cw,
      ch,
      gutter,
      backdropTop,
      baseWidth,
      coverScale: Math.max(w, (h * 16) / 9) / baseWidth,
    };
    measuredWidth = innerWidth;
    measuredHeight = innerHeight;
    surface.style.width = `${baseWidth}px`;
    surface.style.height = `${baseHeight}px`;
    surface.style.left = `${(w - baseWidth) / 2}px`;
    surface.style.top = `${(h - baseHeight) / 2}px`;
    root.style.setProperty(
      "--who-travel",
      `${Math.round(Math.max(4200, Math.min(6400, duration * 145 + 700)))}px`,
    );
    video.controls = false;
    state.progress = 0;
    tween = gsap.to(state, {
      progress: 1,
      ease: "none",
      onUpdate: requestDraw,
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: () => `+=${root.offsetHeight - viewport.offsetHeight}`,
        scrub: 0.55,
        invalidateOnRefresh: true,
      },
    });
    tween.scrollTrigger?.refresh();
    state.progress = tween.scrollTrigger?.progress ?? 0;
    if (oldProgress !== null) resizeProgress = oldProgress;
    draw(true);
    load();
    ScrollTrigger.refresh();
    restoreProgress();
    rememberPosition();
  }
  function restoreProgress() {
    const trigger = tween?.scrollTrigger;
    if (restoreFlow && !disposed) {
      scrollTo({
        top: root.getBoundingClientRect().top + scrollY,
        behavior: "instant",
      });
      clearTimeout(resizeRelease);
      resizeRelease = window.setTimeout(() => {
        resizeProgress = null;
        restoreFlow = false;
      }, 700);
      return;
    }
    if (resizeProgress === null || !trigger || disposed) return;
    scrollTo({
      top: trigger.start + (trigger.end - trigger.start) * resizeProgress,
      behavior: "instant",
    });
    trigger.update();
    tween!.progress(resizeProgress);
    requestDraw();
    clearTimeout(resizeRelease);
    resizeRelease = window.setTimeout(() => {
      resizeProgress = null;
    }, 700);
  }
  function fail() {
    if (disposed || !desktop.matches || failed) return;
    clearTimeout(loadTimer);
    failed = true;
    error.hidden = false;
    root.dataset.ready = "false";
    measure();
  }
  function load() {
    if (
      disposed ||
      !near ||
      !desktop.matches ||
      root.dataset.mode !== "motion" ||
      failed ||
      video.dataset.loading
    )
      return;
    video.dataset.loading = "true";
    clearTimeout(loadTimer);
    loadTimer = window.setTimeout(fail, 20000);
    video.preload = "auto";
    video.load();
  }
  const signal = abort.signal;
  video.addEventListener(
    "loadedmetadata",
    () => {
      if (Number.isFinite(video.duration)) duration = video.duration;
      root.dataset.duration = duration.toFixed(4);
      if (root.dataset.mode === "motion") {
        video.pause();
        requestDraw();
      }
    },
    { signal },
  );
  video.addEventListener(
    "loadeddata",
    () => {
      clearTimeout(loadTimer);
      loaded = true;
      root.dataset.ready = "true";
      requestDraw();
      seek();
    },
    { signal },
  );
  video.addEventListener(
    "seeked",
    () => {
      root.dataset.renderedTime = video.currentTime.toFixed(4);
      seek();
    },
    { signal },
  );
  video.addEventListener(
    "play",
    () => {
      if (root.dataset.mode === "motion") video.pause();
    },
    { signal },
  );
  video.addEventListener("error", fail, { signal, capture: true });
  const io = new IntersectionObserver(
    ([entry]) => {
      near = entry.isIntersecting;
      if (near) {
        load();
        requestDraw();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
        video.pause();
      }
    },
    { rootMargin: "800px 0px" },
  );
  io.observe(viewport);
  function rememberPosition() {
    if (
      resizing ||
      !geometry ||
      innerWidth !== measuredWidth ||
      innerHeight !== measuredHeight
    )
      return;
    const trigger = tween?.scrollTrigger;
    const ownsPosition =
      trigger && scrollY >= trigger.start - 1 && scrollY <= trigger.end + 1;
    stableProgress = ownsPosition
      ? clamp((scrollY - trigger.start) / (trigger.end - trigger.start))
      : null;
    // A new destination also cancels a temporary resize correction. Do not
    // pull navigation or another scene back into the company film on refresh.
    if (!ownsPosition && resizeProgress !== null) cancelRestore();
  }
  const resize = () => {
    if (!resizing) resizeProgress = stableProgress;
    resizing = true;
    clearTimeout(timer);
    timer = window.setTimeout(measure, 150);
  };
  window.addEventListener("scroll", rememberPosition, {
    passive: true,
    signal,
  });
  window.addEventListener("resize", resize, { passive: true, signal });
  reduced.addEventListener("change", measure, { signal });
  desktop.addEventListener("change", measure, { signal });
  ScrollTrigger.addEventListener("refresh", restoreProgress);
  const cancelRestore = () => {
    resizeProgress = null;
    restoreFlow = false;
    clearTimeout(resizeRelease);
  };
  for (const name of ["wheel", "touchstart", "pointerdown"])
    window.addEventListener(name, cancelRestore, { passive: true, signal });
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        [
          "PageDown",
          "PageUp",
          "ArrowDown",
          "ArrowUp",
          "Home",
          "End",
          " ",
          "Tab",
        ].includes(event.key)
      )
        cancelRestore();
    },
    { signal },
  );
  document.addEventListener(
    "visibilitychange",
    () => {
      visible = !document.hidden;
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
        video.pause();
      } else requestDraw();
    },
    { signal },
  );
  const observer = new MutationObserver(() => {
    if (!main?.inert) {
      measure();
      load();
      requestDraw();
    }
  });
  if (main)
    observer.observe(main, { attributes: true, attributeFilter: ["inert"] });
  const cleanupAnchor = mountSceneAnchor(root.closest("section"), {
    hashes: ["#who-we-are", "#who-heading"],
  });
  get<HTMLAnchorElement>("skip").addEventListener(
    "click",
    (event) => {
      const target = document.getElementById("career-heading");
      if (!target) return;
      event.preventDefault();
      target.tabIndex = -1;
      target.scrollIntoView({ block: "start", behavior: "instant" });
      target.focus({ preventScroll: true });
      history.replaceState(history.state, "", "#career-heading");
    },
    { signal },
  );
  document.fonts.ready.then(() => {
    if (!disposed) measure();
  });
  measure();
  return () => {
    disposed = true;
    abort.abort();
    clearTimeout(timer);
    clearTimeout(loadTimer);
    clearTimeout(resizeRelease);
    cancelAnimationFrame(raf);
    io.disconnect();
    observer.disconnect();
    cleanupAnchor();
    ScrollTrigger.removeEventListener("refresh", restoreProgress);
    reset();
    delete video.dataset.loading;
    video.preload = "none";
    video.removeAttribute("src");
    video.load();
  };
}
