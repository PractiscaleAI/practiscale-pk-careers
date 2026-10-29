"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { makeGuideLayers } from "./footer-guide-layers";
import styles from "./footer.module.css";

type Props = { onReady: () => void; onFailure: () => void };
const IMAGE_URL = "/media/mascot/practiscale-guide-v2.webp";
const clamp = THREE.MathUtils.clamp;

export default function FooterGuideScene({ onReady, onFailure }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const footer = host?.closest("footer");
    if (!host || !footer) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      onFailure();
      return;
    }
    const canvas = renderer.domElement;
    canvas.className = styles.guideCanvas;
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 1.3));
    const studioLight = new THREE.DirectionalLight(0xf1fffc, 2);
    studioLight.position.set(-2, 3, 5);
    scene.add(studioLight);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 30);
    camera.position.z = 8;
    const eyes = new THREE.Group();
    scene.add(eyes);
    let disposed = false;
    let loaded = false;
    let visible = false;
    let animating = false;
    let lastTime = 0;
    let focusHeld = false;
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];
    const target = { x: 0, y: 0 };
    const eyeGaze = { x: 0, y: 0 };
    const abort = new AbortController();

    function size() {
      if (!host) return;
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width < 900 ? 1.25 : 1.5));
      renderer.setSize(width, height, false);
      const halfHeight = 3.08;
      const halfWidth = halfHeight * (width / height);
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
    }

    function pointTo(clientX: number, clientY: number) {
      if (!host) return;
      const rect = host.getBoundingClientRect();
      target.x = clamp((clientX - (rect.left + rect.width / 2)) / (rect.width * 0.42), -1, 1);
      target.y = clamp((clientY - (rect.top + rect.height / 2)) / (rect.height * 0.5), -1, 1);
      host.dataset.pointerX = target.x.toFixed(2);
      host.dataset.pointerY = target.y.toFixed(2);
      wake();
    }

    function reset() {
      if (focusHeld) return;
      target.x = 0;
      target.y = 0;
      wake();
    }

    function frame(time: number) {
      if (!loaded || !visible) return;
      const delta = Math.min((time - (lastTime || time)) / 1000, 0.05);
      lastTime = time;
      eyeGaze.x = THREE.MathUtils.damp(eyeGaze.x, target.x, 8.5, delta);
      eyeGaze.y = THREE.MathUtils.damp(eyeGaze.y, target.y, 8.5, delta);

      // Keep the artwork fixed; only the light shapes on its face track focus.
      eyes.position.x = eyeGaze.x * 0.078;
      eyes.position.y = -eyeGaze.y * 0.035;
      renderer.render(scene, camera);

      const settled =
        Math.abs(eyeGaze.x - target.x) < 0.002 &&
        Math.abs(eyeGaze.y - target.y) < 0.002;
      if (settled) {
        renderer.setAnimationLoop(null);
        animating = false;
      }
    }

    function wake() {
      if (!visible || !loaded || animating) return;
      animating = true;
      lastTime = 0;
      renderer.setAnimationLoop(frame);
    }

    function start() {
      if (visible || !loaded) return;
      visible = true;
      wake();
    }
    function stop() {
      if (!visible) return;
      visible = false;
      renderer.setAnimationLoop(null);
      animating = false;
    }

    const resizeObserver = new ResizeObserver(size);
    resizeObserver.observe(host);
    size();
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !document.hidden) start();
        else stop();
      },
      { threshold: 0.01 },
    );
    visibilityObserver.observe(host);
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        const rect = host.getBoundingClientRect();
        if (rect.top < innerHeight && rect.bottom > 0) start();
      }
    };

    const sourceImage = new Image();
    sourceImage.onload = () => {
      if (disposed) return;
      try {
        const layers = makeGuideLayers(sourceImage);
        textures.push(layers.body, layers.head, layers.eyes);
        const mesh = (
          map: THREE.Texture,
          placement: { width: number; height: number; x: number; y: number },
          z: number,
        ) => {
          const material = new THREE.MeshBasicMaterial({
            map, transparent: true, side: THREE.DoubleSide,
            depthWrite: false, toneMapped: false,
          });
          materials.push(material);
          const geometry = new THREE.PlaneGeometry(placement.width, placement.height);
          geometries.push(geometry);
          const plane = new THREE.Mesh(geometry, material);
          plane.position.set(placement.x, placement.y, z);
          return plane;
        };
        scene.add(mesh(layers.body, layers.bodyPlacement, 0));
        scene.add(mesh(layers.head, layers.headPlacement, 0.02));
        const eyePlane = mesh(layers.eyes, layers.eyePlacement, 0.04);
        eyes.add(eyePlane);
        loaded = true;
        renderer.render(scene, camera);
        canvas.style.opacity = "1";
        host?.setAttribute("data-guide-ready", "true");
        onReady();
        onVisibility();
      } catch {
        onFailure();
      }
    };
    sourceImage.onerror = () => {
      if (!disposed) onFailure();
    };
    sourceImage.src = IMAGE_URL;

    footer.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      focusHeld = false;
      pointTo(event.clientX, event.clientY);
    }, { passive: true, signal: abort.signal });
    footer.addEventListener("pointerleave", reset, { signal: abort.signal });
    footer.addEventListener("focusin", (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      focusHeld = true;
      const rect = event.target.getBoundingClientRect();
      pointTo(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }, { signal: abort.signal });
    footer.addEventListener("focusout", () => {
      focusHeld = false;
      reset();
    }, { signal: abort.signal });
    document.addEventListener("visibilitychange", onVisibility, { signal: abort.signal });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      stop();
      onFailure();
    }, { signal: abort.signal });

    return () => {
      disposed = true;
      abort.abort();
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      sourceImage.onload = null;
      sourceImage.onerror = null;
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, [onReady, onFailure]);

  return <div ref={hostRef} className={styles.guideStage} />;
}
