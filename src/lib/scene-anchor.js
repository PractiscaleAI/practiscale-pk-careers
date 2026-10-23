import { ScrollTrigger } from "gsap/ScrollTrigger";

// Settle an explicitly requested deep link after fonts, the original intro and
// preceding scroll scenes finish measuring. Real input always cancels alignment.
export function mountSceneAnchor(section, options = {}) {
  const main = section.closest("main"),
    abort = new AbortController();
  let pending = false,
    fontReady = false,
    timer = 0,
    release = 0,
    disposed = false,
    aligning = false;
  const matches = () =>
    (
      options.hashes || ["#the-proof", "#proof-heading", "#proof-records"]
    ).includes(location.hash);
  function stop() {
    pending = false;
    clearTimeout(timer);
    clearTimeout(release);
  }
  function schedule() {
    if (!pending || disposed || !fontReady || main?.inert || aligning) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!pending || disposed || main?.inert) return;
      aligning = true;
      const target =
        location.hash === "#proof-records"
          ? document.getElementById("proof-end")
          : section;
      window.scrollTo({
        top:
          options.scrollTop?.() ?? target.getBoundingClientRect().top + scrollY,
        behavior: "instant",
      });
      aligning = false;
      clearTimeout(release);
      release = setTimeout(stop, 1200);
    }, 300);
  }
  function hash() {
    pending = matches();
    schedule();
  }
  const resize = new ResizeObserver(schedule);
  resize.observe(document.body);
  if (main) resize.observe(main);
  resize.observe(section);
  const mutation = new MutationObserver(schedule);
  if (main)
    mutation.observe(main, { attributes: true, attributeFilter: ["inert"] });
  for (const name of ["wheel", "touchstart", "pointerdown"])
    window.addEventListener(name, stop, {
      passive: true,
      signal: abort.signal,
    });
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        [
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
        stop();
    },
    { signal: abort.signal },
  );
  window.addEventListener("hashchange", hash, { signal: abort.signal });
  ScrollTrigger.addEventListener("refresh", schedule);
  document.fonts.ready.then(() => {
    fontReady = true;
    schedule();
  });
  hash();
  return () => {
    disposed = true;
    stop();
    abort.abort();
    resize.disconnect();
    mutation.disconnect();
    ScrollTrigger.removeEventListener("refresh", schedule);
  };
}
