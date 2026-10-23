import { records, clamp, mix, range, storyAt } from "./earnings-data.js";
import { createSoundEngine } from "./audio-engine.js?v=4";
import {
  createNumberCueTracker,
  createLidCueTracker,
} from "./number-cues.js?v=4";

const $ = (s) => document.querySelector(s);
const rail = $(".rail"),
  viewport = $(".viewport"),
  win = $(".window"),
  world = $(".world");
const copy = $(".copy"),
  caption = $(".stage-caption"),
  index = $(".record-index");
const texture = $(".texture"),
  ctx = texture.getContext("2d");
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const pointerQuery = matchMedia("(hover: hover) and (pointer: fine)");
const soundButton = $(".sound"),
  testButton = $(".test-sound"),
  audioStatus = $(".audio-status");
let laptop = null,
  geometry,
  raf = 0,
  alive = true,
  visible = !document.hidden,
  inView = true;
let pointer = { x: 0.5, y: 0.4 },
  target = { ...pointer };
let ready = false,
  failed = false,
  soundError = "";
const cleanup = [];
const listen = (obj, event, fn, options) => {
  obj.addEventListener(event, fn, options);
  cleanup.push(() => obj.removeEventListener(event, fn, options));
};
const sound = createSoundEngine(({ enabled, busy, state, error }) => {
  if (error) soundError = error;
  const running = enabled && state === "running";
  soundButton.disabled = busy;
  soundButton.setAttribute("aria-pressed", String(enabled));
  const label = busy
    ? "Starting…"
    : running
      ? "Sound on"
      : enabled
        ? "Resume sound"
        : soundError
          ? "Retry sound"
          : "Sound off";
  soundButton.querySelector("span").textContent = label;
  soundButton.setAttribute(
    "aria-label",
    running
      ? "Sound on, mute sound effects"
      : enabled
        ? "Resume sound effects"
        : "Sound off, enable sound effects",
  );
  testButton.disabled = !running || busy;
  audioStatus.textContent =
    soundError ||
    (running
      ? "Sound is on. Scroll to hear the laptop and record cues."
      : enabled
        ? "Sound is paused. Select Resume sound."
        : "Sound effects are off.");
});
const numberCues = createNumberCueTracker((event) => {
  sound.play(event.kind, false, {
    visualTime: event.visualTime,
    key: event.key,
    replace: true,
  });
});
const lidCues = createLidCueTracker((event) =>
  sound.play(event.kind, false, {
    visualTime: event.visualTime,
    key: event.key,
    replace: true,
  }),
);
listen(soundButton, "click", () => {
  soundError = "";
  sound.toggle();
});
listen(testButton, "click", () => {
  if (sound.test()) audioStatus.textContent = "Playing a sound preview.";
});

function drawTexture(p) {
  if (!ctx) return;
  const { width: W, height: H, dpr, staticMode } = geometry;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const mx = pointer.x * W,
    my = pointer.y * H,
    radius = Math.min(W, H) * 0.65;
  ctx.lineWidth = 0.65;
  for (let row = -3; row < Math.ceil(H / 26) + 4; row++) {
    const by = row * 26;
    ctx.strokeStyle =
      row % 4 === 0 ? "rgba(155,227,214,.055)" : "rgba(155,227,214,.025)";
    ctx.beginPath();
    for (let x = -30; x < W + 50; x += 22) {
      const force = staticMode
        ? 0
        : Math.exp(-((x - mx) ** 2 + (by - my) ** 2) / (radius * radius));
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
function drawScene(p) {
  const { width: W, height: H, portrait, slot, staticMode } = geometry;
  const expand = staticMode ? 0 : range(p, 0, 0.15);
  const x = slot.x * (1 - expand),
    y = slot.y * (1 - expand),
    w = mix(slot.w, W, expand),
    h = mix(slot.h, H, expand);
  const sx = w / W,
    sy = h / H;
  const scale = Math.min(
    w / (portrait ? 620 : 1200),
    h / (portrait ? 900 : 800),
  );
  win.style.transform = `translate3d(${x}px,${y}px,0) scale(${sx},${sy})`;
  const radius = mix(20, 0, expand);
  win.style.borderRadius = `${radius / sx}px / ${radius / sy}px`;
  world.style.transform = `scale(${scale / sx},${scale / sy})`;
  win.style.setProperty("--light-x", `${pointer.x * 100}%`);
  win.style.setProperty("--light-y", `${pointer.y * 100}%`);
  copy.style.opacity = String(staticMode ? 1 : 1 - range(p, 0.01, 0.115));
  caption.style.opacity = String(staticMode ? 0 : range(p, 0.145, 0.18));
  const story = storyAt(p, staticMode);
  const committedFrame = laptop?.render(story);
  index.textContent =
    p > 0.94
      ? "COMPLETE"
      : story.summary
        ? "10 / 10"
        : story.showingRecords
          ? `${String(story.record + 1).padStart(2, "0")} / 10`
          : "10 RECORDS";
  rail.dataset.progress = p.toFixed(5);
  rail.dataset.expanded = String(expand === 1);
  rail.dataset.activeRecord = String(story.showingRecords ? story.record : -1);
  texture.dataset.pointerX = pointer.x.toFixed(3);
  texture.dataset.pointerY = pointer.y.toFixed(3);
  if (committedFrame) {
    lidCues.commit(story, committedFrame.renderedAt);
    numberCues.commit(story, committedFrame.renderedAt);
  }
}
function tick() {
  raf = 0;
  if (!alive || !visible || !inView || !geometry) return;
  const before = performance.now();
  pointer.x = mix(pointer.x, target.x, 0.17);
  pointer.y = mix(pointer.y, target.y, 0.17);
  const p = geometry.staticMode
    ? 0
    : clamp((scrollY - geometry.top) / geometry.travel);
  if (!pointerQuery.matches && !geometry.staticMode) {
    pointer.x = 0.5 + Math.sin(p * 3) * 0.18;
    pointer.y = 0.4 + p * 0.2;
  }
  drawScene(p);
  drawTexture(p);
  rail.dataset.drawMs = (performance.now() - before).toFixed(2);
  if (
    pointerQuery.matches &&
    Math.abs(pointer.x - target.x) + Math.abs(pointer.y - target.y) > 0.001
  )
    requestDraw();
}
function requestDraw() {
  if (!raf && alive && visible && inView) raf = requestAnimationFrame(tick);
}
function measure() {
  numberCues.baseline();
  lidCues.baseline();
  const width = document.documentElement.clientWidth,
    height = innerHeight,
    portrait = width < height;
  document.body.classList.toggle("portrait", portrait);
  const staticMode =
    motionQuery.matches || navigator.connection?.saveData === true || failed;
  rail.dataset.mode = staticMode ? "static" : "motion";
  const gutter = Math.min(64, Math.max(24, width * 0.04));
  const rect = copy.getBoundingClientRect(),
    vRect = viewport.getBoundingClientRect();
  const top = portrait
    ? rect.bottom - vRect.top + 24
    : Math.max(78, height * 0.22);
  const slot = portrait
    ? {
        x: gutter,
        y: top,
        w: width - 2 * gutter,
        h: Math.max(125, height - top - 42),
      }
    : {
        x: width * 0.46,
        y: top,
        w: width * 0.54 - gutter,
        h: Math.min(height - top - 70, height * 0.61),
      };
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  texture.width = Math.round(width * dpr);
  texture.height = Math.round(height * dpr);
  geometry = {
    width,
    height,
    portrait,
    slot,
    staticMode,
    dpr,
    top: rail.getBoundingClientRect().top + scrollY,
    travel: Math.max(1, rail.offsetHeight - height),
  };
  laptop?.resize(portrait, height < 540 && !portrait);
  $(".audio-controls").hidden =
    staticMode ||
    !ready ||
    !("AudioContext" in window || "webkitAudioContext" in window);
  requestDraw();
}
function fallback(message) {
  failed = true;
  rail.dataset.ready = "false";
  $(".loading").hidden = true;
  audioStatus.textContent = message;
  sound.mute();
  measure();
}
listen(window, "scroll", requestDraw, { passive: true });
listen(
  viewport,
  "pointermove",
  (event) => {
    if (!pointerQuery.matches || geometry.staticMode) return;
    target = {
      x: clamp(event.clientX / geometry.width),
      y: clamp(event.clientY / geometry.height),
    };
    requestDraw();
  },
  { passive: true },
);
listen(viewport, "pointerleave", () => {
  target = { x: 0.5, y: 0.4 };
  requestDraw();
});
listen(window, "resize", measure, { passive: true });
listen(motionQuery, "change", () => {
  if (motionQuery.matches) sound.mute();
  measure();
});
listen(document, "visibilitychange", () => {
  numberCues.baseline();
  lidCues.baseline();
  visible = !document.hidden;
  if (!visible) {
    cancelAnimationFrame(raf);
    raf = 0;
    sound.pause();
  } else {
    if (inView) sound.resume();
    requestDraw();
  }
});
const observer = new IntersectionObserver(
  ([entry]) => {
    numberCues.baseline();
    lidCues.baseline();
    inView = entry.isIntersecting;
    if (inView) {
      sound.resume();
      requestDraw();
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
      sound.pause();
    }
  },
  { threshold: 0 },
);
observer.observe(viewport);
// A persisted page keeps its resources. Recreate nothing on a BFCache return.
listen(window, "pagehide", (event) => {
  if (event.persisted) {
    sound.pause();
    return;
  }
  alive = false;
  cancelAnimationFrame(raf);
  observer.disconnect();
  for (const remove of cleanup) remove();
  sound.dispose();
  laptop?.dispose();
});
listen(window, "pageshow", (event) => {
  if (event.persisted) {
    visible = !document.hidden;
    inView = true;
    measure();
    sound.resume();
  }
});
measure();
try {
  await Promise.all([
    document.fonts.load("600 32px Sora"),
    document.fonts.load("400 16px Manrope"),
    document.fonts.load("400 12px Mono"),
  ]);
  const { createLaptop } = await import("./laptop-3d.js?v=4");
  laptop = await createLaptop(world, (available) => {
    if (!available) {
      fallback(
        "The 3D view was interrupted. The combined earnings remain visible.",
      );
    } else {
      failed = false;
      rail.dataset.ready = "true";
      measure();
    }
  });
  if (!laptop) throw new Error("WebGL unavailable");
  ready = true;
  rail.dataset.ready = "true";
  $(".loading").hidden = true;
  measure();
} catch {
  fallback("The 3D view is unavailable. The combined earnings remain visible.");
}
if (new URLSearchParams(location.search).has("qc")) {
  Object.defineProperty(window, "__earningsPreview", {
    value: {
      sampleAudio: () => sound.sample(),
      playCue: (kind) => sound.play(kind, true),
      audioEvents: () => sound.events(),
      records,
      storyAt,
    },
    configurable: true,
  });
}
