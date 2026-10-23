import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EarningsFrameCache } from "./earnings-frame-cache";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

export function mountEarnings(root: HTMLDivElement) {
  gsap.registerPlugin(ScrollTrigger);
  const viewport = root.querySelector<HTMLElement>("[data-earnings-viewport]")!;
  const layout = root.querySelector<HTMLElement>("[data-earnings-layout]")!;
  const slot = root.querySelector<HTMLElement>("[data-earnings-slot]")!;
  const copy = root.querySelector<HTMLElement>("[data-earnings-copy]")!;
  const surface = root.querySelector<HTMLElement>("[data-earnings-surface]")!;
  const canvas = surface.querySelector("canvas")!;
  const poster = root.querySelector<HTMLImageElement>(
    "[data-earnings-poster]",
  )!;
  const source = slot.querySelector("source")!;
  const status = root.querySelector<HTMLElement>("[data-earnings-status]")!;
  const skip = root.querySelector<HTMLAnchorElement>("[data-earnings-skip]")!;
  const results = document.getElementById("proof-records")!;
  const context = canvas.getContext("2d", { alpha: false });
  const portrait = matchMedia("(orientation: portrait)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (
    navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean };
    }
  ).connection;

  let trigger: ScrollTrigger | undefined;
  let cache: EarningsFrameCache | undefined;
  let disposed = false;
  let failed = false;
  let near = false;
  let raf = 0;
  let resizeTimer = 0;
  let loadingTimer = 0;
  let activePoster = "";
  let target = 0;
  let drawn = 0;
  let direction = 1;
  let progress = 0;
  let expansion = 0;
  let width = 0;
  let height = 0;
  let startRect = { x: 0, y: 0, width: 0, height: 0 };
  let expansionTravel = 0;
  let playbackTravel = 0;
  let totalTravel = 0;
  let resizeWidth = 0;
  let resizeHeight = 0;
  let copyWidth = 0;
  let copyHeight = 0;
  let mode = "static";
  let resizeSnapshot:
    { active: boolean; expansion: number; playback: number } | undefined;
  const main = root.closest("main");
  let fontsReady = false;
  let anchorTimer = 0;
  let anchorRelease = 0;
  let aligningAnchor = false;
  let pendingAnchor = matchingAnchor();

  function matchingAnchor() {
    return location.hash === "#the-proof" || location.hash === "#proof-records"
      ? location.hash
      : undefined;
  }
  function cancelAnchor() {
    pendingAnchor = undefined;
    clearTimeout(anchorTimer);
    clearTimeout(anchorRelease);
  }
  function anchorInput(event: Event) {
    if (main?.inert) return;
    if (
      event instanceof KeyboardEvent &&
      ![
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
        " ",
        "Tab",
      ].includes(event.key)
    )
      return;
    cancelAnchor();
  }
  function scheduleAnchor() {
    if (
      !pendingAnchor ||
      disposed ||
      main?.inert ||
      !fontsReady ||
      aligningAnchor
    )
      return;
    clearTimeout(anchorTimer);
    clearTimeout(anchorRelease);
    anchorTimer = window.setTimeout(() => {
      if (
        !pendingAnchor ||
        disposed ||
        main?.inert ||
        location.hash !== pendingAnchor
      )
        return;
      const destination =
        pendingAnchor === "#proof-records" ? results : root.closest("section")!;
      aligningAnchor = true;
      ScrollTrigger.refresh();
      if (destination === results)
        destination.scrollIntoView({ block: "start", behavior: "instant" });
      else
        window.scrollTo({
          top: destination.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        });
      ScrollTrigger.update();
      aligningAnchor = false;
      anchorRelease = window.setTimeout(cancelAnchor, 1200);
    }, 300);
  }
  function hashChange() {
    pendingAnchor = matchingAnchor();
    scheduleAnchor();
  }

  function queuePaint() {
    if (!disposed && !raf) raf = requestAnimationFrame(paint);
  }
  function clearLoading() {
    clearTimeout(loadingTimer);
    loadingTimer = 0;
    status.textContent = "";
  }
  function releaseCache() {
    cache?.dispose();
    cache = undefined;
    root.dataset.cached = "0";
    root.dataset.inflight = "0";
  }
  function setPoster(final: boolean) {
    const name = final ? "poster.webp" : "frame-0000.webp";
    if (activePoster === name) return;
    activePoster = name;
    source.srcset = `/earnings-v7/mobile/${name}`;
    poster.src = `/earnings-v7/desktop/${name}`;
  }

  function makeCache() {
    if (cache || mode !== "motion" || !near || document.hidden) return;
    cache = new EarningsFrameCache(
      `/earnings-v7/${portrait.matches ? "mobile" : "desktop"}`,
      portrait.matches ? 12 : 16,
      queuePaint,
      fail,
    );
    cache.seek(target, direction);
  }

  function paint() {
    raf = 0;
    if (disposed || mode !== "motion" || !context || !width || !height) return;
    const mix = smooth(expansion);
    const x = startRect.x * (1 - mix),
      y = startRect.y * (1 - mix);
    const displayWidth = startRect.width + (width - startRect.width) * mix;
    const displayHeight = startRect.height + (height - startRect.height) * mix;
    const sx = displayWidth / width,
      sy = displayHeight / height;
    surface.style.transform = `translate3d(${x}px,${y}px,0) scale(${sx},${sy})`;
    surface.style.borderRadius = `${((portrait.matches ? 18 : 24) * (1 - mix)) / Math.max(0.01, Math.min(sx, sy))}px`;
    const fade = 1 - smooth(clamp(expansion / 0.32));
    copy.style.opacity = String(fade);
    copy.style.transform = `translate3d(0,${-16 * (1 - fade)}px,0)`;

    const exact = cache?.get(target);
    const nearest = exact
      ? { index: target, image: exact }
      : cache?.nearest(target);
    const held = cache?.get(drawn);
    const image =
      nearest?.image ||
      held ||
      (poster.complete && poster.naturalWidth ? poster : undefined);
    if (image) {
      const imageWidth =
        image instanceof HTMLImageElement ? image.naturalWidth : image.width;
      const imageHeight =
        image instanceof HTMLImageElement ? image.naturalHeight : image.height;
      // Fit in displayed coordinates, then compensate for the surface transform.
      // This keeps all baked text proportional while the panel's aspect ratio changes.
      const scale = Math.min(
        displayWidth / imageWidth,
        displayHeight / imageHeight,
      );
      const dw = ((imageWidth * scale) / displayWidth) * canvas.width;
      const dh = ((imageHeight * scale) / displayHeight) * canvas.height;
      context.fillStyle = "#134143";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        (canvas.width - dw) / 2,
        (canvas.height - dh) / 2,
        dw,
        dh,
      );
      drawn = nearest?.index ?? (held ? drawn : 0);
      root.dataset.ready = "true";
      root.dataset.drawn = String(drawn);
    }
    root.dataset.cached = String(cache?.size || 0);
    root.dataset.inflight = String(cache?.inFlight || 0);
    if (drawn === target) clearLoading();
    else if (!loadingTimer)
      loadingTimer = window.setTimeout(() => {
        status.textContent = "Loading earnings…";
      }, 600);
  }

  function update(p: number) {
    if (resizeSnapshot) return;
    const travel = clamp(p) * totalTravel;
    expansion = clamp(travel / expansionTravel);
    progress = clamp((travel - expansionTravel) / playbackTravel);
    const next = Math.round(progress * 599);
    direction = next === target ? direction : next > target ? 1 : -1;
    const changed = target !== next;
    target = next;
    root.dataset.target = String(target);
    root.dataset.expansion = expansion.toFixed(4);
    root.dataset.progress = progress.toFixed(4);
    if (changed) cache?.seek(target, direction);
    queuePaint();
  }

  function measure() {
    const view = viewport.getBoundingClientRect();
    const box = slot.getBoundingClientRect();
    width = view.width;
    height = view.height;
    startRect = {
      x: box.left - view.left,
      y: box.top - view.top,
      width: box.width,
      height: box.height,
    };
    const resolution = Math.min(
      devicePixelRatio || 1,
      1.5,
      (portrait.matches ? 720 : 1600) / width,
    );
    canvas.width = Math.round(width * resolution);
    canvas.height = Math.round(height * resolution);
    expansionTravel = height * (portrait.matches ? 1.15 : 1.05);
    playbackTravel = height * (portrait.matches ? 6.8 : 5.8);
    totalTravel = expansionTravel + playbackTravel + height * 0.3;
    root.style.height = `${height + totalTravel}px`;
    root.dataset.expandTravel = String(expansionTravel);
    root.dataset.playTravel = String(playbackTravel);
    root.dataset.totalTravel = String(totalTravel);
  }

  function staticMode(reason: string, toEnd = false) {
    mode = "static";
    trigger?.kill();
    trigger = undefined;
    releaseCache();
    clearLoading();
    root.dataset.mode = "static";
    root.dataset.reason = reason;
    delete root.dataset.ready;
    root.style.removeProperty("height");
    copy.style.removeProperty("opacity");
    copy.style.removeProperty("transform");
    setPoster(true);
    if (toEnd) {
      requestAnimationFrame(() => {
        if (disposed) return;
        results.scrollIntoView({ block: "start", behavior: "instant" });
        status.textContent = "The earnings records are available below.";
        ScrollTrigger.refresh();
      });
    }
  }

  function fail() {
    failed = true;
    const wasActive = Boolean(trigger?.isActive);
    staticMode("frame-unavailable", wasActive);
  }

  function setup() {
    if (disposed) return;
    const old = trigger;
    const restore = resizeSnapshot?.active ?? Boolean(old?.isActive);
    const previousExpansion = resizeSnapshot?.expansion ?? expansion;
    const previousPlayback = resizeSnapshot?.playback ?? progress;
    resizeSnapshot = undefined;
    old?.kill();
    trigger = undefined;
    releaseCache();
    root.dataset.variant = portrait.matches ? "mobile" : "desktop";
    if (
      failed ||
      reduced.matches ||
      connection?.saveData ||
      !context ||
      typeof createImageBitmap !== "function"
    ) {
      staticMode(
        failed
          ? "frame-unavailable"
          : reduced.matches
            ? "reduced-motion"
            : connection?.saveData
              ? "save-data"
              : "unsupported",
        restore,
      );
      return;
    }
    root.dataset.mode = "motion";
    delete root.dataset.reason;
    delete root.dataset.ready;
    mode = "motion";
    setPoster(false);
    copy.style.removeProperty("transform");
    measure();
    if (
      layout.scrollHeight > height + 2 ||
      startRect.height < 140 ||
      startRect.width < 80
    ) {
      staticMode("content-fit", restore);
      return;
    }
    trigger = ScrollTrigger.create({
      id: "earnings-proof",
      trigger: root,
      start: "top top",
      end: () => `+=${totalTravel}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });
    makeCache();
    ScrollTrigger.refresh();
    if (restore) {
      window.scrollTo({
        top:
          trigger.start +
          previousExpansion * expansionTravel +
          previousPlayback * playbackTravel,
        behavior: "instant",
      });
      ScrollTrigger.update();
    }
    update(trigger.progress);
  }

  function resize() {
    if (innerWidth === resizeWidth && innerHeight === resizeHeight) return;
    resizeSnapshot ??= {
      active: Boolean(trigger?.isActive),
      expansion,
      playback: progress,
    };
    resizeWidth = innerWidth;
    resizeHeight = innerHeight;
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(setup, 180);
  }
  function responsiveChange() {
    resizeSnapshot ??= {
      active: Boolean(trigger?.isActive),
      expansion,
      playback: progress,
    };
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(setup, 180);
  }
  function skipAnimation(event: MouseEvent) {
    if (mode !== "motion") return;
    event.preventDefault();
    results.scrollIntoView({ block: "start", behavior: "instant" });
    results.focus({ preventScroll: true });
  }
  function visibility() {
    if (document.hidden) releaseCache();
    else {
      makeCache();
      queuePaint();
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      near = entries[0].isIntersecting;
      if (near) {
        makeCache();
        queuePaint();
      } else releaseCache();
    },
    { rootMargin: "700px 0px" },
  );
  observer.observe(root);
  const resizeObserver = new ResizeObserver((entries) => {
    let contentChanged = false;
    for (const entry of entries) {
      if (entry.target !== copy) continue;
      const box = entry.contentRect;
      contentChanged =
        Math.abs(box.width - copyWidth) > 0.5 ||
        Math.abs(box.height - copyHeight) > 0.5;
      copyWidth = box.width;
      copyHeight = box.height;
    }
    if (contentChanged) responsiveChange();
    else resize();
  });
  resizeObserver.observe(viewport);
  resizeObserver.observe(copy);
  // Earlier pinned sections change the document offsets after the introduction.
  // Settle only a requested hash target, and relinquish it as soon as the user acts.
  const anchorLayout = new ResizeObserver(scheduleAnchor);
  main
    ?.querySelectorAll(":scope > section")
    .forEach((section) => anchorLayout.observe(section));
  const introduction = new MutationObserver(scheduleAnchor);
  if (main)
    introduction.observe(main, {
      attributes: true,
      attributeFilter: ["inert"],
    });
  ScrollTrigger.addEventListener("refresh", scheduleAnchor);
  poster.addEventListener("load", queuePaint);
  skip.addEventListener("click", skipAnimation);
  portrait.addEventListener("change", responsiveChange);
  reduced.addEventListener("change", setup);
  connection?.addEventListener("change", setup);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("resize", resize, { capture: true });
  window.addEventListener("hashchange", hashChange);
  for (const type of ["wheel", "touchstart", "pointerdown", "keydown"])
    window.addEventListener(type, anchorInput, {
      passive: true,
      capture: true,
    });
  setup();
  document.fonts.ready.then(() => {
    if (!disposed) {
      fontsReady = true;
      setup();
      scheduleAnchor();
    }
  });

  return () => {
    disposed = true;
    trigger?.kill();
    releaseCache();
    clearLoading();
    cancelAnimationFrame(raf);
    clearTimeout(resizeTimer);
    clearTimeout(anchorTimer);
    clearTimeout(anchorRelease);
    observer.disconnect();
    resizeObserver.disconnect();
    anchorLayout.disconnect();
    introduction.disconnect();
    ScrollTrigger.removeEventListener("refresh", scheduleAnchor);
    poster.removeEventListener("load", queuePaint);
    skip.removeEventListener("click", skipAnimation);
    portrait.removeEventListener("change", responsiveChange);
    reduced.removeEventListener("change", setup);
    connection?.removeEventListener("change", setup);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("resize", resize, { capture: true });
    window.removeEventListener("hashchange", hashChange);
    for (const type of ["wheel", "touchstart", "pointerdown", "keydown"])
      window.removeEventListener(type, anchorInput, { capture: true });
    root.style.removeProperty("height");
    delete root.dataset.mode;
    delete root.dataset.ready;
    copy.style.removeProperty("opacity");
    copy.style.removeProperty("transform");
  };
}
