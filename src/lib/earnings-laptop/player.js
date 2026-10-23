import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountSceneAnchor } from "../scene-anchor.js";
import { clamp, mix, range, storyAt } from "./earnings-data.js";

/** @param {HTMLDivElement} root */
export function mountEarningsLaptop(root) {
  const $ = (name) => root.querySelector(`[data-laptop-${name}]`);
  const viewport = $("viewport"),
    win = $("window"),
    worldHost = $("world"),
    copy = $("copy"),
    metrics = $("metrics");
  const texture = $("texture"),
    ctx = texture.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
    fine = matchMedia("(hover:hover) and (pointer:fine)");
  const saveData = navigator.connection?.saveData === true,
    main = root.closest("main"),
    abort = new AbortController();
  let world = null,
    geometry = null,
    disposed = false,
    loading = false,
    failed = false,
    near = false,
    visible = !document.hidden,
    raf = 0,
    resizeTimer = 0,
    resizeRelease = 0,
    resizeProgress = null,
    lastProgress = 0,
    lastActive = false;
  let pointer = { x: 0.5, y: 0.4 },
    target = { ...pointer };
  function drawTexture(p) {
    if (!ctx || !geometry) return;
    const { width: W, height: H, dpr } = geometry;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 0.65;
    const mx = pointer.x * W,
      my = pointer.y * H,
      radius = Math.min(W, H) * 0.65;
    for (let row = -3; row < Math.ceil(H / 26) + 4; row++) {
      const by = row * 26;
      ctx.strokeStyle =
        row % 4 === 0 ? "rgba(155,227,214,.055)" : "rgba(155,227,214,.025)";
      ctx.beginPath();
      for (let x = -30; x < W + 50; x += 22) {
        const force = Math.exp(
          -((x - mx) ** 2 + (by - my) ** 2) / (radius * radius),
        );
        const y =
          by +
          Math.sin(x * 0.004 + by * 0.006 + p * 3) * 8 +
          force * (my - by) * 0.12;
        if (x === -30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(189,211,211,.08)";
    for (let x = 17; x < W; x += 48)
      for (let y = 19; y < H; y += 48) ctx.fillRect(x, y, 0.7, 0.7);
  }
  function draw() {
    raf = 0;
    if (
      disposed ||
      !geometry ||
      !visible ||
      !near ||
      main?.inert ||
      geometry.staticMode
    )
      return;
    const {
      width: W,
      height: H,
      portrait,
      slot,
      copyExit,
      metricsExit,
    } = geometry;
    const p = clamp((scrollY - geometry.top) / geometry.travel),
      expand = range(p, 0, 0.15);
    if (
      document.documentElement.clientWidth !== geometry.width ||
      viewport.clientHeight !== geometry.height
    )
      return;
    lastProgress = p;
    lastActive =
      scrollY >= geometry.top && scrollY <= geometry.top + geometry.travel;
    pointer.x = mix(pointer.x, target.x, 0.17);
    pointer.y = mix(pointer.y, target.y, 0.17);
    if (!fine.matches) {
      pointer.x = 0.5 + Math.sin(p * 3) * 0.18;
      pointer.y = 0.4 + p * 0.2;
    }
    const x = slot.x * (1 - expand),
      y = slot.y * (1 - expand),
      w = mix(slot.w, W, expand),
      h = mix(slot.h, H, expand);
    const sx = w / W,
      sy = h / H,
      scale = Math.min(
        w / (portrait ? 620 : 1200),
        h / (portrait ? mix(360, 900, expand) : 800),
      );
    win.style.transform = `translate3d(${x}px,${y}px,0) scale(${sx},${sy})`;
    const radius = mix(20, 0, expand);
    win.style.borderRadius = `${radius / sx}px / ${radius / sy}px`;
    worldHost.style.transform = `scale(${scale / sx},${scale / sy})`;
    const introExit = range(p, 0.01, 0.055);
    copy.style.translate = `0 ${-copyExit * introExit}px`;
    metrics.style.translate = `0 ${metricsExit * introExit}px`;
    root.dataset.introHidden = String(introExit === 1);
    const story = storyAt(p);
    world?.render(story);
    root.dataset.progress = p.toFixed(5);
    root.dataset.activeRecord = String(
      story.showingRecords ? story.record : -1,
    );
    root.dataset.expanded = String(expand === 1);
    drawTexture(p);
    if (
      fine.matches &&
      Math.abs(pointer.x - target.x) + Math.abs(pointer.y - target.y) > 0.001
    )
      requestDraw();
  }
  function requestDraw() {
    if (!raf && !disposed && near && visible) raf = requestAnimationFrame(draw);
  }
  function measure(preserve = false) {
    if (disposed) return;
    const width = document.documentElement.clientWidth,
      portrait = width < innerHeight;
    const snapshot =
      resizeProgress ?? (preserve && lastActive ? lastProgress : null);
    root.dataset.portrait = String(portrait);
    root.dataset.mode =
      reduced.matches || saveData || failed ? "static" : "motion";
    const copyHeight = copy.scrollHeight;
    const metricsHeight = metrics.scrollHeight;
    const safeTop = portrait ? (width <= 600 ? 92 : 96) : 120;
    const contentBottom =
      innerHeight - metricsHeight - (portrait ? 24 : 40) - (portrait ? 24 : 32);
    const fits = portrait
      ? safeTop + copyHeight + 24 + 125 <= contentBottom
      : safeTop + Math.max(copyHeight + 32, 180) <= contentBottom;
    const staticMode = reduced.matches || saveData || failed || !fits;
    root.dataset.mode = staticMode ? "static" : "motion";
    if (staticMode) {
      resizeProgress = null;
      clearTimeout(resizeRelease);
      world?.dispose();
      world = null;
      root.dataset.ready = "false";
      for (const element of [copy, metrics]) {
        element.style.removeProperty("opacity");
        element.style.removeProperty("clip-path");
        element.style.removeProperty("translate");
      }
      root.dataset.introHidden = "false";
      root.style.removeProperty("--laptop-copy-y");
      win.style.removeProperty("transform");
      win.style.removeProperty("border-radius");
      worldHost.style.removeProperty("transform");
      geometry = {
        width,
        height: innerHeight,
        portrait,
        staticMode: true,
        top: root.getBoundingClientRect().top + scrollY,
        travel: 1,
      };
      return;
    }
    const height = viewport.clientHeight,
      gutter = Math.min(64, Math.max(24, width * 0.04));
    const top = portrait
      ? copy.offsetTop + copy.offsetHeight + 24
      : Math.max(safeTop, height * 0.18);
    const slot = portrait
      ? {
          x: gutter,
          y: top,
          w: width - 2 * gutter,
          h: Math.max(125, contentBottom - top),
        }
      : {
          x: width * 0.46,
          y: top,
          w: width * 0.54 - gutter,
          h: Math.min(contentBottom - top, height * 0.61),
        };
    root.style.setProperty("--laptop-copy-y", `${slot.y + slot.h / 2}px`);
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    texture.width = Math.round(width * dpr);
    texture.height = Math.round(height * dpr);
    geometry = {
      width,
      height,
      portrait,
      slot,
      copyExit:
        (portrait ? copy.offsetTop : slot.y + slot.h / 2 - copyHeight / 2) +
        copyHeight +
        24,
      metricsExit: height - metrics.offsetTop + 24,
      dpr,
      staticMode: false,
      top: root.getBoundingClientRect().top + scrollY,
      travel: Math.max(1, root.offsetHeight - height),
    };
    world?.resize(portrait, height < 540 && !portrait);
    if (snapshot !== null) {
      window.scrollTo({
        top: geometry.top + snapshot * geometry.travel,
        behavior: "instant",
      });
      clearTimeout(resizeRelease);
      resizeRelease = setTimeout(() => {
        resizeProgress = null;
      }, 600);
    }
    requestDraw();
  }
  function fallback() {
    failed = true;
    root.dataset.ready = "false";
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
      !near ||
      main?.inert ||
      geometry?.staticMode
    )
      return;
    loading = true;
    try {
      await Promise.all([
        document.fonts.load("600 32px Sora"),
        document.fonts.load("400 16px Manrope"),
        document.fonts.load('400 12px "JetBrains Mono"'),
      ]);
      const { createLaptop } = await import("./scene.js");
      if (disposed || geometry?.staticMode) return;
      const created = await createLaptop(worldHost, (available) => {
        if (!disposed && !available) fallback();
      });
      if (!created) throw Error("WebGL unavailable");
      if (disposed || geometry?.staticMode) {
        created.dispose();
        return;
      }
      world = created;
      root.dataset.ready = "true";
      measure();
      draw();
    } catch {
      if (!disposed) fallback();
    } finally {
      loading = false;
    }
  }
  window.addEventListener("scroll", requestDraw, {
    passive: true,
    signal: abort.signal,
  });
  viewport.addEventListener(
    "pointermove",
    (event) => {
      if (!fine.matches || geometry?.staticMode) return;
      target = {
        x: clamp(event.clientX / geometry.width),
        y: clamp(event.clientY / geometry.height),
      };
      requestDraw();
    },
    { passive: true, signal: abort.signal },
  );
  viewport.addEventListener(
    "pointerleave",
    () => {
      target = { x: 0.5, y: 0.4 };
      requestDraw();
    },
    { signal: abort.signal },
  );
  window.addEventListener(
    "resize",
    () => {
      if (
        geometry &&
        !geometry.staticMode &&
        geometry.width === document.documentElement.clientWidth &&
        geometry.height === viewport.clientHeight
      )
        return;
      if (resizeProgress === null && lastActive) resizeProgress = lastProgress;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measure(true);
        void initialize();
      }, 120);
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
      } else {
        requestDraw();
      }
    },
    { signal: abort.signal },
  );
  reduced.addEventListener(
    "change",
    () => {
      if (reduced.matches) {
        world?.dispose();
        world = null;
        root.dataset.ready = "false";
      }
      measure();
      void initialize();
    },
    { signal: abort.signal },
  );
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
    // Keep GPU allocation out of the preceding career-card exchange.
    // The server-rendered poster covers entry while this scene initializes.
    { rootMargin: "0px" },
  );
  io.observe(viewport);
  const mutation = new MutationObserver(() => {
    if (!main?.inert) {
      measure();
      void initialize();
      requestDraw();
    }
  });
  if (main)
    mutation.observe(main, { attributes: true, attributeFilter: ["inert"] });
  const copyObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure(false);
      void initialize();
    }, 100);
  });
  copyObserver.observe(copy);
  copyObserver.observe(metrics);
  const refresh = () => measure(false);
  ScrollTrigger.addEventListener("refresh", refresh);
  for (const event of ["wheel", "touchstart", "pointerdown"])
    window.addEventListener(
      event,
      () => {
        resizeProgress = null;
        clearTimeout(resizeRelease);
      },
      { passive: true, signal: abort.signal },
    );
  const cleanupAnchor = mountSceneAnchor(root.closest("section"), {
    hashes: [
      "#the-proof",
      "#proof-heading",
      "#proof-records",
      "#proof-band",
      "#proof-band-heading",
    ],
  });
  document.fonts.ready.then(() => {
    if (!disposed) measure();
  });
  measure();
  return () => {
    disposed = true;
    abort.abort();
    clearTimeout(resizeTimer);
    clearTimeout(resizeRelease);
    cancelAnimationFrame(raf);
    io.disconnect();
    mutation.disconnect();
    copyObserver.disconnect();
    cleanupAnchor();
    ScrollTrigger.removeEventListener("refresh", refresh);
    world?.dispose();
  };
}
