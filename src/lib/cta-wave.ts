export function mountCtaWaves(section: HTMLElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fills = Array.from(section.querySelectorAll<SVGPathElement>("[data-cta-arc-fill]"));
  const renderedLength = (path: SVGPathElement) => {
    const matrix = path.getScreenCTM();
    const total = path.getTotalLength();
    if (!matrix) return total;
    let length = 0;
    let previous: DOMPoint | null = null;
    for (let index = 0; index <= 96; index++) {
      const point = path.getPointAtLength((total * index) / 96);
      const screen = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      if (previous) length += Math.hypot(screen.x - previous.x, screen.y - previous.y);
      previous = screen;
    }
    return length;
  };
  let lengths = fills.map(renderedLength);
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

  function resize() {
    lengths = fills.map(renderedLength);
    schedule();
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
  }, { rootMargin: "80px" });
  observer.observe(section);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", schedule);
  reduced.addEventListener("change", schedule);
  schedule();

  return () => {
    observer.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", schedule);
    reduced.removeEventListener("change", schedule);
    if (frame) cancelAnimationFrame(frame);
  };
}
