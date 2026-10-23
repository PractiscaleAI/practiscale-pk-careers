import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountSceneAnchor } from "../scene-anchor.js";

type World = {
  canvas: HTMLCanvasElement;
  render: (p: number, force?: boolean) => unknown;
  resize: (w: number, h: number, mobile?: boolean) => void;
  dispose: () => void;
};

export function mountProofBand(root: HTMLDivElement) {
  gsap.registerPlugin(ScrollTrigger);
  const viewport = root.querySelector<HTMLElement>("[data-proof-viewport]")!;
  const figure = root.querySelector<HTMLElement>("[data-proof-figure]")!;
  const host = root.querySelector<HTMLElement>("[data-proof-canvas-host]")!;
  const heading = root.querySelector<HTMLElement>("#proof-band-heading")!;
  const main = root.closest("main"),
    reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  const abort = new AbortController();
  let world: World | null = null,
    trigger: ScrollTrigger | undefined;
  let disposed = false,
    failed = false,
    loading = false,
    near = false,
    visible = !document.hidden,
    progress = 1,
    raf = 0,
    resizeTimer = 0,
    resizeRelease = 0;
  let resizeProgress: number | null = null;
  function draw() {
    raf = 0;
    if (!world || !near || !visible || disposed || main?.inert) return;
    world.render(progress);
  }
  const requestDraw = () => {
    if (!raf && near && visible && !disposed) raf = requestAnimationFrame(draw);
  };
  function update(p: number) {
    progress = p;
    root.dataset.progress = p.toFixed(5);
    requestDraw();
  }
  function measure() {
    if (disposed) return;
    clearTimeout(resizeTimer);
    trigger?.kill();
    trigger = undefined;
    const staticMode = reduced.matches || connection?.saveData || failed;
    let pin = innerWidth >= 1024 && innerHeight >= 620 && !staticMode;
    root.dataset.mode = staticMode ? "static" : pin ? "pin" : "flow";
    if (pin) {
      const css = getComputedStyle(viewport);
      const needed =
        figure.clientHeight +
        heading.offsetHeight +
        parseFloat(css.paddingTop) +
        parseFloat(css.paddingBottom) +
        parseFloat(css.rowGap);
      if (needed > viewport.clientHeight + 1) {
        pin = false;
        root.dataset.mode = "flow";
      }
    }
    if (world)
      world.resize(figure.clientWidth, figure.clientHeight, innerWidth < 768);
    if (staticMode) {
      update(1);
      return;
    }
    const stickyTop = Math.max(0, (innerHeight - viewport.offsetHeight) / 2);
    trigger = ScrollTrigger.create({
      trigger: root,
      start: pin
        ? () => root.getBoundingClientRect().top + scrollY - stickyTop
        : "top 85%",
      end: pin
        ? () =>
            root.getBoundingClientRect().top +
            scrollY -
            stickyTop +
            root.offsetHeight -
            viewport.offsetHeight
        : "top 10%",
      invalidateOnRefresh: true,
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });
    update(trigger.progress);
    ScrollTrigger.refresh();
    restoreProgress();
  }
  function restoreProgress() {
    if (resizeProgress === null || !trigger) return;
    window.scrollTo({
      top: trigger.start + (trigger.end - trigger.start) * resizeProgress,
      behavior: "instant",
    });
    trigger.update();
    clearTimeout(resizeRelease);
    resizeRelease = window.setTimeout(() => {
      resizeProgress = null;
    }, 600);
  }
  function fallback() {
    failed = true;
    root.dataset.live = "false";
    world?.dispose();
    world = null;
    measure();
  }
  async function initialize() {
    if (
      disposed ||
      loading ||
      world ||
      failed ||
      reduced.matches ||
      connection?.saveData ||
      !near ||
      main?.inert
    )
      return;
    loading = true;
    try {
      await document.fonts.ready;
      const { createProofWorld, proofPalette } = await import("./scene.js");
      if (disposed) return;
      const created = await createProofWorld(host, {
        palette: proofPalette(root),
        mobile: innerWidth < 768,
        width: figure.clientWidth,
        height: figure.clientHeight,
        onContextChange: (available: boolean) => {
          if (!available) fallback();
        },
      });
      if (disposed) {
        created.dispose();
        return;
      }
      world = created;
      world.render(progress, true);
      root.dataset.live = "true";
    } catch {
      if (!disposed) fallback();
    } finally {
      loading = false;
    }
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      near = entry.isIntersecting;
      if (near) {
        void initialize();
        requestDraw();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { rootMargin: "400px 0px" },
  );
  io.observe(root);
  const readyObserver = new MutationObserver(() => {
    if (!main?.inert) {
      void initialize();
      requestDraw();
      measure();
    }
  });
  if (main)
    readyObserver.observe(main, {
      attributes: true,
      attributeFilter: ["inert"],
    });
  const resize = () => {
    if (
      resizeProgress === null &&
      trigger &&
      trigger.progress > 0 &&
      trigger.progress < 1
    )
      resizeProgress = trigger.progress;
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      void initialize();
    }, 120);
  };
  window.addEventListener("resize", resize, {
    passive: true,
    signal: abort.signal,
  });
  const headingObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measure, 120);
  });
  headingObserver.observe(heading);
  ScrollTrigger.addEventListener("refresh", restoreProgress);
  for (const event of ["wheel", "touchstart", "pointerdown"])
    window.addEventListener(
      event,
      () => {
        resizeProgress = null;
        clearTimeout(resizeRelease);
      },
      { passive: true, signal: abort.signal },
    );
  document.addEventListener(
    "visibilitychange",
    () => {
      visible = !document.hidden;
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else requestDraw();
    },
    { signal: abort.signal },
  );
  reduced.addEventListener(
    "change",
    () => {
      if (reduced.matches) {
        world?.dispose();
        world = null;
        root.dataset.live = "false";
      }
      measure();
      void initialize();
    },
    { signal: abort.signal },
  );
  document.fonts.ready.then(() => {
    if (!disposed) measure();
  });
  measure();
  const cleanupAnchor = mountSceneAnchor(root.closest("section"), {
    hashes: ["#proof-band", "#proof-band-heading"],
    scrollTop: () =>
      root.dataset.mode === "pin" && trigger
        ? trigger.start
        : root.getBoundingClientRect().top + scrollY,
  });
  return () => {
    disposed = true;
    abort.abort();
    clearTimeout(resizeTimer);
    clearTimeout(resizeRelease);
    cancelAnimationFrame(raf);
    trigger?.kill();
    io.disconnect();
    readyObserver.disconnect();
    headingObserver.disconnect();
    ScrollTrigger.removeEventListener("refresh", restoreProgress);
    cleanupAnchor();
    world?.dispose();
  };
}
