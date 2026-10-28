export function mountCtaWaves(section: HTMLElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fills = Array.from(section.querySelectorAll<SVGPathElement>("[data-cta-arc-fill]"));
  const lengths = fills.map((path) => path.getTotalLength());
  let visible = false;
  let frame = 0;

  function draw() {
    frame = 0;
    if (!visible || document.hidden) return;
    const box = section.getBoundingClientRect();
    const travel = Math.max(window.innerHeight, 1);
    const progress = reduced.matches
      ? 1
      : Math.max(0, Math.min(1, (window.innerHeight - box.top) / travel));
    fills.forEach((path, index) => {
      const length = lengths[index];
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length * (1 - progress)}`;
    });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
  }, { rootMargin: "80px" });
  observer.observe(section);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  document.addEventListener("visibilitychange", schedule);
  reduced.addEventListener("change", schedule);
  schedule();

  return () => {
    observer.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    document.removeEventListener("visibilitychange", schedule);
    reduced.removeEventListener("change", schedule);
    if (frame) cancelAnimationFrame(frame);
  };
}
