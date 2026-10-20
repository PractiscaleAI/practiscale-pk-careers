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
      decoding = false;
    let renderer: THREE.WebGLRenderer | undefined,
      observer: ResizeObserver | undefined,
      context: gsap.Context | undefined,
      material: THREE.ShaderMaterial | undefined,
      geometry: THREE.PlaneGeometry | undefined,
      texture: THREE.Texture | undefined;
    const blobs = new Map<number, Blob>(),
      bitmaps = new Map<number, ImageBitmap>();
    const controller = new AbortController();
    let refreshFrame = 0;
    const dispose = () => {
      controller.abort();
      cancelAnimationFrame(refreshFrame);
      context?.revert();
      observer?.disconnect();
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
        const render = (index: number, bitmap: ImageBitmap) => {
          if (stopped || failed || !material || !renderer) return;
          const old = texture;
          texture = new THREE.Texture(bitmap);
          texture.colorSpace = THREE.NoColorSpace;
          texture.needsUpdate = true;
          material.uniforms.map.value = texture;
          renderer.render(scene, camera);
          old?.dispose();
          shown = index;
          el.dataset.frame = String(index);
          el.dataset.ready = "true";
          el.dataset.engine = "three";
        };
        const paint = async () => {
          if (stopped || failed || decoding || requested === shown) return;
          const index = requested,
            blob = blobs.get(index);
          if (!blob) return;
          decoding = true;
          try {
            let bitmap = bitmaps.get(index);
            if (!bitmap) {
              bitmap = await createImageBitmap(blob, {
                imageOrientation: "flipY",
                premultiplyAlpha: "none",
              });
              if (stopped || failed) {
                bitmap.close();
                return;
              }
              bitmaps.set(index, bitmap);
            }
            render(index, bitmap);
            for (const [i, b] of bitmaps) {
              if (bitmaps.size > 8 && i !== shown) {
                b.close();
                bitmaps.delete(i);
              }
            }
          } catch {
            fallback();
          } finally {
            decoding = false;
            if (
              !stopped &&
              !failed &&
              requested !== shown &&
              blobs.has(requested)
            )
              void paint();
          }
        };
        const resize = () => {
          if (!renderer) return;
          const { width, height } = el.getBoundingClientRect();
          renderer.setSize(width, height, false);
          if (texture) renderer.render(scene, camera);
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
        const load = async (i: number) => {
          try {
            const r = await fetch(files[i], { signal: controller.signal });
            if (r.ok) {
              const b = await r.blob();
              if (!stopped && !failed) {
                blobs.set(i, b);
                if (i === requested) void paint();
              }
            }
          } catch {
            /* Keep the last valid frame or poster. */
          }
        };
        await load(0);
        if (stopped || failed) return;
        if (!blobs.has(0)) {
          fallback();
          return;
        }
        await paint();
        if (stopped || failed) return;
        let cursor = 1;
        const worker = async () => {
          while (cursor < files.length && !stopped && !failed)
            await load(cursor++);
        };
        void Promise.all(Array.from({ length: 4 }, worker));
        gsap.registerPlugin(ScrollTrigger);
        const driver = { frame: 0 };
        context = gsap.context(() => {
          gsap.to(driver, {
            frame: (files.length - 1) / (1 - holdFraction),
            ease: "none",
            scrollTrigger: {
              trigger: el.closest(".hero-scroll"),
              start: "top top",
              end: "bottom bottom",
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
            onUpdate: () => {
              requested = Math.min(files.length - 1, Math.round(driver.frame));
              void paint();
            },
          });
        }, el);
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
