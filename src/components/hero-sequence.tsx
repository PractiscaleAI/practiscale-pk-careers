"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
type Manifest = {
  desktop: string[];
  mobile: string[];
  background: number[];
  video: string;
  holdFraction?: number;
  sourceJob?: string;
};
export default function HeroSequence() {
  const host = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"static" | "mobile" | "desktop">("static");
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const phone = matchMedia("(max-width: 767px)");
    const update = () =>
      setMode(
        motion.matches || new URLSearchParams(location.search).has("no3d")
          ? "static"
          : phone.matches
            ? "mobile"
            : "desktop",
      );
    motion.addEventListener("change", update);
    phone.addEventListener("change", update);
    update();
    return () => {
      motion.removeEventListener("change", update);
      phone.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    const el = host.current;
    if (!el || mode === "static") return;
    let stopped = false,
      failed = false,
      requested = 0,
      shown = -1,
      near = true;
    let renderer: THREE.WebGLRenderer | undefined,
      observer: ResizeObserver | undefined,
      introductionObserver: MutationObserver | undefined,
      proximityObserver: IntersectionObserver | undefined,
      context: gsap.Context | undefined,
      material: THREE.ShaderMaterial | undefined,
      geometry: THREE.PlaneGeometry | undefined,
      texture: THREE.Texture | undefined;
    const blobs = new Map<number, Blob>(),
      bitmaps = new Map<number, ImageBitmap>(),
      decoding = new Set<number>(),
      requests = new Map<number, AbortController>(),
      unavailable = new Set<number>();
    const controller = new AbortController();
    let refreshFrame = 0,
      paintFrame = 0;
    let scheduleLoading = () => {};
    const dispose = () => {
      controller.abort();
      requests.forEach((request) => request.abort());
      requests.clear();
      cancelAnimationFrame(refreshFrame);
      cancelAnimationFrame(paintFrame);
      context?.revert();
      observer?.disconnect();
      introductionObserver?.disconnect();
      proximityObserver?.disconnect();
      texture?.dispose();
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
      bitmaps.forEach((b) => b.close());
      bitmaps.clear();
      blobs.clear();
    };
    const fallback = () => {
      if (stopped || failed) return;
      failed = true;
      el.dataset.ready = "false";
      el.dataset.engine = "poster";
      dispose();
    };
    const start = async () => {
      try {
        const manifest: Manifest = await fetch("/media/hero-manifest.json", {
          signal: controller.signal,
        }).then((r) => {
          if (!r.ok) throw Error("Sequence unavailable");
          return r.json();
        });
        if (stopped || failed) return;
        const files = mode === "mobile" ? manifest.mobile : manifest.desktop;
        if (!files.length) return;
        el.dataset.totalFrames = String(files.length);
        el.dataset.sequence = manifest.sourceJob ?? "unknown";
        const holdFraction = Math.max(
          0,
          Math.min(0.5, manifest.holdFraction ?? 0),
        );
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setClearColor(0x134143, 0);
        renderer.domElement.setAttribute("aria-hidden", "true");
        el.appendChild(renderer.domElement);
        const scene = new THREE.Scene(),
          camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 2;
        geometry = new THREE.PlaneGeometry(2, 2);
        material = new THREE.ShaderMaterial({
          transparent: true,
          uniforms: {
            map: { value: null },
            keyColor: {
              value: new THREE.Vector3(
                ...(manifest.background as [number, number, number]),
              ),
            },
          },
          vertexShader:
            "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
          fragmentShader:
            "uniform sampler2D map; uniform vec3 keyColor; varying vec2 vUv; void main(){vec4 c=texture2D(map,vUv);gl_FragColor=c; }",
        });
        scene.add(new THREE.Mesh(geometry, material));
        // Every source has the same dimensions. Update one GPU allocation and
        // avoid rebuilding mipmaps for a portrait that is rendered at screen size.
        texture = new THREE.Texture();
        texture.colorSpace = THREE.NoColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        material.uniforms.map.value = texture;
        const render = (index: number, bitmap: ImageBitmap) => {
          if (stopped || failed || !texture || !renderer) return;
          texture.image = bitmap;
          texture.needsUpdate = true;
          renderer.render(scene, camera);
          shown = index;
          el.dataset.frame = String(index);
          el.dataset.ready = "true";
          el.dataset.engine = "three";
        };
        const paint = () => {
          if (
            stopped ||
            failed ||
            !near ||
            document.hidden ||
            requested === shown
          )
            return;
          let candidate = shown;
          for (const index of bitmaps.keys()) {
            // A decode can finish after the scroll target has moved. Present it
            // if it still advances toward that target; never move away from it
            // or let a late forward decode overwrite a reverse-scroll frame.
            if (
              (requested > shown && index > candidate && index <= requested) ||
              (requested < shown && index < candidate && index >= requested)
            )
              candidate = index;
          }
          const bitmap = bitmaps.get(candidate);
          if (candidate !== shown && bitmap) render(candidate, bitmap);
        };
        let scheduleDecoding = () => {};
        const queuePaint = () => {
          if (stopped || failed || paintFrame) return;
          paintFrame = requestAnimationFrame(() => {
            paintFrame = 0;
            paint();
            scheduleDecoding();
          });
        };
        const decode = async (index: number) => {
          const blob = blobs.get(index);
          if (!blob || bitmaps.has(index) || decoding.has(index)) return;
          decoding.add(index);
          try {
            const bitmap = await createImageBitmap(blob, {
              imageOrientation: "flipY",
              premultiplyAlpha: "none",
            });
            if (stopped || failed || !near || document.hidden) bitmap.close();
            else bitmaps.set(index, bitmap);
          } catch {
            fallback();
          } finally {
            decoding.delete(index);
            queuePaint();
          }
        };
        const resize = () => {
          if (!renderer) return;
          const { width, height } = el.getBoundingClientRect();
          renderer.setSize(width, height, false);
          if (texture?.image) renderer.render(scene, camera);
          cancelAnimationFrame(refreshFrame);
          refreshFrame = requestAnimationFrame(() => {
            if (!stopped && !failed && context) ScrollTrigger.refresh();
          });
        };
        observer = new ResizeObserver(resize);
        observer.observe(el);
        const scroll = el.closest(".hero-scroll");
        if (scroll) observer.observe(scroll);
        resize();
        renderer.domElement.addEventListener("webglcontextlost", fallback);
        const load = async (i: number, signal = controller.signal) => {
          try {
            const r = await fetch(files[i], { signal });
            if (r.ok) {
              const b = await r.blob();
              if (!stopped && !failed && !signal.aborted) {
                blobs.set(i, b);
                queuePaint();
              }
            } else unavailable.add(i);
          } catch {
            if (!signal.aborted) unavailable.add(i);
            // Keep the last valid frame or poster when a source cannot load.
          }
        };
        await load(0);
        if (stopped || failed) return;
        if (!blobs.has(0)) {
          fallback();
          return;
        }
        await decode(0);
        paint();
        if (stopped || failed) return;
        let previousRequest = 0,
          direction = 1;
        scheduleDecoding = () => {
          if (stopped || failed || !near || document.hidden) return;
          const wanted: number[] = [];
          const add = (index: number) => {
            if (
              index >= 0 &&
              index < files.length &&
              wanted.length < 8 &&
              !wanted.includes(index)
            )
              wanted.push(index);
          };
          add(requested);
          for (let distance = 1; distance <= 7; distance++) {
            add(requested + direction * distance);
            if (distance === 1) add(requested - direction * distance);
          }
          // At either end of the film, use spare slots for a quick reversal.
          for (let distance = 2; distance <= 7; distance++)
            add(requested - direction * distance);
          if (!wanted.includes(shown) && wanted.length === 8) wanted.pop();
          for (const [index, bitmap] of bitmaps) {
            if (index !== shown && !wanted.includes(index)) {
              bitmap.close();
              bitmaps.delete(index);
            }
          }
          for (const index of wanted) {
            if (decoding.size >= 2) break;
            if (bitmaps.has(index) || decoding.has(index) || !blobs.has(index))
              continue;
            void decode(index);
          }
        };
        scheduleLoading = () => {
          if (stopped || failed) return;
          if (requested !== previousRequest) {
            direction = Math.sign(requested - previousRequest);
            previousRequest = requested;
          }
          paint();
          scheduleDecoding();
          // A bounded window follows the native timeline, including reverse
          // scroll. A distant jump takes priority over speculative neighbours.
          const wanted: number[] = [];
          const add = (i: number) => {
            if (i >= 0 && i < files.length) wanted.push(i);
          };
          add(requested);
          for (let distance = 1; distance <= 12; distance++) {
            add(requested + direction * distance);
            if (distance <= 4) add(requested - direction * distance);
          }
          for (const [i, request] of requests)
            if (!near || document.hidden || !wanted.includes(i))
              request.abort();
          // Keep compressed sources as well as decoded bitmaps bounded.
          const oldest = [...blobs.keys()].sort(
            (a, b) => Math.abs(b - requested) - Math.abs(a - requested),
          );
          for (const i of oldest) {
            if (blobs.size <= 24) break;
            if (i !== requested && i !== shown) blobs.delete(i);
          }
          if (!near || document.hidden) return;
          for (const i of wanted) {
            if (requests.size >= 2) break;
            if (blobs.has(i) || requests.has(i) || unavailable.has(i)) continue;
            const request = new AbortController();
            requests.set(i, request);
            void load(i, request.signal).finally(() => {
              requests.delete(i);
              scheduleLoading();
            });
          }
        };
        proximityObserver = new IntersectionObserver(
          ([entry]) => {
            near = entry.isIntersecting;
            scheduleLoading();
          },
          { rootMargin: "300px 0px" },
        );
        proximityObserver.observe(el);
        document.addEventListener("visibilitychange", scheduleLoading, {
          signal: controller.signal,
        });
        scheduleLoading();
        gsap.registerPlugin(ScrollTrigger);
        const driver = { frame: 0 };
        const phoneScene =
          mode === "mobile" ? el.closest(".hero-visual") : null;
        const phoneFrame = el.closest<HTMLElement>(".hero-frame");
        const pinTop = () =>
          phoneFrame ? parseFloat(getComputedStyle(phoneFrame).top) || 0 : 0;
        context = gsap.context(() => {
          gsap.fromTo(
            driver,
            { frame: 0 },
            {
              frame: (files.length - 1) / (1 - holdFraction),
              ease: "none",
              scrollTrigger: {
                trigger: phoneScene ?? el.closest(".hero-scroll"),
                start: phoneScene ? () => `top ${pinTop()}px` : "top top",
                end: phoneScene
                  ? () =>
                      `clamp(bottom ${pinTop() + (phoneFrame?.offsetHeight ?? 0)}px)`
                  : "bottom bottom",
                scrub: 0.65,
                invalidateOnRefresh: true,
                onRefresh: (trigger) => {
                  requested = Math.min(
                    files.length - 1,
                    Math.round(
                      (trigger.progress * (files.length - 1)) /
                        (1 - holdFraction),
                    ),
                  );
                  scheduleLoading();
                },
              },
              onUpdate: () => {
                requested = Math.min(
                  files.length - 1,
                  Math.round(driver.frame),
                );
                scheduleLoading();
              },
            },
          );
        }, el);
        // The original introduction scales the stage; refresh after its host unlocks it.
        const main = el.closest("main");
        if (phoneScene && main) {
          introductionObserver = new MutationObserver(() => {
            if (!main.inert) resize();
          });
          introductionObserver.observe(main, {
            attributes: true,
            attributeFilter: ["inert"],
          });
          if (!main.inert) resize();
        }
      } catch {
        if (!stopped) fallback();
      }
    };
    void start();
    return () => {
      stopped = true;
      dispose();
      el.dataset.ready = "false";
      el.dataset.engine = "poster";
      el.dataset.frame = "0";
    };
  }, [mode]);
  return (
    <div
      ref={host}
      className="hero-portrait"
      data-engine="poster"
      data-frame="0"
    >
      <img
        className="portrait-poster"
        src="/media/ceo-prime-v1/poster.webp"
        width="960"
        height="960"
        alt="Afrasyab Ahmed, Founder and CEO of PractiScale"
        fetchPriority="high"
      />
      <span className="sr-only">
        CEO portrait. With motion enabled, scrolling turns the portrait toward
        the camera.
      </span>
    </div>
  );
}
