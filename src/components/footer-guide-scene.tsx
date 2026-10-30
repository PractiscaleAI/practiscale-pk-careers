"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { makeGuideLayers } from "./footer-guide-layers";
import styles from "./footer.module.css";

type DepthVariant = "flat" | "curved";
type Props = {
  onReady: () => void;
  onFailure: () => void;
  depthVariant?: DepthVariant;
};

const IMAGE_URL = "/media/mascot/practiscale-guide-v2.webp";
const TUNING = {
  viewHeight: 6.16,
  artworkHeight: 5.7,
  headYaw: 0.18,
  headPitch: 0.1,
  headRoll: 0.025,
  headDamping: 3.5,
  eyeDamping: 9,
  eyeParallaxX: 0.055,
  eyeParallaxY: 0.03,
  idleDelay: 2500,
  blinkDuration: 120,
  breathDuration: 850,
} as const;
const clamp = THREE.MathUtils.clamp;

// The curved variant is a shallow ellipsoid proxy with planar UVs. It adds
// head-volume parallax without a depth-map asset or another dependency.
function headGeometry(
  width: number,
  height: number,
  depth: number,
  variant: DepthVariant,
) {
  const geometry = new THREE.PlaneGeometry(
    width,
    height,
    variant === "curved" ? 24 : 1,
    variant === "curved" ? 24 : 1,
  );
  if (variant === "curved") {
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      const nx = positions.getX(i) / (width / 2);
      const ny = positions.getY(i) / (height / 2);
      const dome = Math.max(0, 1 - nx * nx) * Math.max(0, 1 - ny * ny);
      positions.setZ(i, depth * dome);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  return geometry;
}

export default function FooterGuideScene({
  onReady,
  onFailure,
  depthVariant = "curved",
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const footer = host?.closest("footer");
    if (!host || !footer) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
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
    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0.1, 50);
    camera.position.z = 10;

    const artwork = new THREE.Group();
    const baseY = -(TUNING.viewHeight - TUNING.artworkHeight) / 2;
    artwork.position.y = baseY;
    scene.add(artwork);
    const bodyPivot = new THREE.Group();
    const headPivot = new THREE.Group();
    const visor = new THREE.Group();
    const eyes = new THREE.Group();
    artwork.add(bodyPivot, headPivot);
    headPivot.add(visor, eyes);
    headPivot.rotation.order = "YXZ";

    let disposed = false;
    let loaded = false;
    let visible = false;
    let animating = false;
    let lastTime = 0;
    let lastPointerAt = 0;
    let blinkStartedAt = 0;
    let breathStartedAt = 0;
    let idleTimer = 0;
    let blinkTimer = 0;
    let saccadeTimer = 0;
    let saccadeResetTimer = 0;
    let breathTimer = 0;
    let focusHeld = false;
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];
    const target = { x: 0, y: 0 };
    const headGaze = { x: 0, y: 0 };
    const eyeGaze = { x: 0, y: 0 };
    const saccade = { x: 0, y: 0 };
    let pendingPointer: { x: number; y: number } | null = null;
    const abort = new AbortController();

    function size() {
      if (!host) return;
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, width < 900 ? 1.5 : 2),
      );
      renderer.setSize(width, height, false);
      const halfHeight = TUNING.viewHeight / 2;
      const halfWidth = (halfHeight * width) / height;
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      if (loaded && visible && !animating) renderer.render(scene, camera);
    }

    function scheduleIdleReturn() {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (focusHeld) return;
        target.x = 0;
        target.y = 0;
        wake();
      }, TUNING.idleDelay);
    }

    function pointTo(clientX: number, clientY: number) {
      if (!host || !visible) return;
      const rect = host.getBoundingClientRect();
      const reachX = Math.min(rect.width * 0.38, 600);
      target.x = clamp(
        (clientX - (rect.left + rect.width / 2)) / reachX,
        -1,
        1,
      );
      target.y = clamp(
        (clientY - (rect.top + rect.height * 0.3)) / (rect.height * 0.55),
        -1,
        1,
      );
      lastPointerAt = performance.now();
      host.dataset.pointerX = target.x.toFixed(2);
      host.dataset.pointerY = target.y.toFixed(2);
      scheduleIdleReturn();
      wake();
    }

    function scheduleBlink() {
      window.clearTimeout(blinkTimer);
      blinkTimer = window.setTimeout(
        () => {
          if (!visible || !loaded) return;
          blinkStartedAt = performance.now();
          wake();
          scheduleBlink();
        },
        3000 + Math.random() * 3000,
      );
    }

    function scheduleSaccade() {
      window.clearTimeout(saccadeTimer);
      saccadeTimer = window.setTimeout(
        () => {
          if (!visible || !loaded) return;
          if (performance.now() - lastPointerAt > 1000) {
            saccade.x = (Math.random() - 0.5) * 0.07;
            saccade.y = (Math.random() - 0.5) * 0.05;
            wake();
            saccadeResetTimer = window.setTimeout(() => {
              saccade.x = 0;
              saccade.y = 0;
              wake();
            }, 180);
          }
          scheduleSaccade();
        },
        1000 + Math.random() * 1000,
      );
    }

    function scheduleBreath() {
      window.clearTimeout(breathTimer);
      breathTimer = window.setTimeout(
        () => {
          if (!visible || !loaded) return;
          breathStartedAt = performance.now();
          wake();
          scheduleBreath();
        },
        5000 + Math.random() * 3000,
      );
    }

    function frame(time: number) {
      if (!loaded || !visible) return;
      // Coalesce high-frequency mouse events into one layout read per frame.
      if (pendingPointer) {
        const pointer = pendingPointer;
        pendingPointer = null;
        pointTo(pointer.x, pointer.y);
      }
      const delta = Math.min((time - (lastTime || time - 16.7)) / 1000, 0.05);
      lastTime = time;
      headGaze.x = THREE.MathUtils.damp(
        headGaze.x,
        target.x,
        TUNING.headDamping,
        delta,
      );
      headGaze.y = THREE.MathUtils.damp(
        headGaze.y,
        target.y,
        TUNING.headDamping,
        delta,
      );
      const eyeTargetX = clamp(target.x + saccade.x, -1, 1);
      const eyeTargetY = clamp(target.y + saccade.y, -1, 1);
      eyeGaze.x = THREE.MathUtils.damp(
        eyeGaze.x,
        eyeTargetX,
        TUNING.eyeDamping,
        delta,
      );
      eyeGaze.y = THREE.MathUtils.damp(
        eyeGaze.y,
        eyeTargetY,
        TUNING.eyeDamping,
        delta,
      );

      const yaw = headGaze.x * TUNING.headYaw;
      const pitch = headGaze.y * TUNING.headPitch;
      headPivot.rotation.set(pitch, yaw, -headGaze.x * TUNING.headRoll, "YXZ");
      // The source visor has generous padding. These bounds keep both pupils
      // comfortably inside it even when the head and eyes point oppositely.
      eyes.position.x =
        eyes.userData.baseX +
        clamp(eyeGaze.x * TUNING.eyeParallaxX, -0.055, 0.055);
      eyes.position.y =
        eyes.userData.baseY -
        clamp(eyeGaze.y * TUNING.eyeParallaxY, -0.03, 0.03);

      const blinkProgress = blinkStartedAt
        ? (time - blinkStartedAt) / TUNING.blinkDuration
        : 1;
      const blinking = blinkProgress >= 0 && blinkProgress < 1;
      eyes.scale.y = blinking ? 1 - 0.9 * Math.sin(Math.PI * blinkProgress) : 1;
      if (blinkProgress >= 1) blinkStartedAt = 0;

      const breathProgress = breathStartedAt
        ? (time - breathStartedAt) / TUNING.breathDuration
        : 1;
      const breathing = breathProgress >= 0 && breathProgress < 1;
      artwork.position.y =
        baseY + (breathing ? 0.02 * Math.sin(Math.PI * breathProgress) : 0);
      if (breathProgress >= 1) breathStartedAt = 0;

      renderer.render(scene, camera);
      if (host) {
        host.dataset.headYaw = yaw.toFixed(3);
        host.dataset.eyeX = eyeGaze.x.toFixed(3);
      }
      const settled =
        Math.abs(headGaze.x - target.x) < 0.002 &&
        Math.abs(headGaze.y - target.y) < 0.002 &&
        Math.abs(eyeGaze.x - eyeTargetX) < 0.002 &&
        Math.abs(eyeGaze.y - eyeTargetY) < 0.002 &&
        !blinking &&
        !breathing;
      if (settled) {
        renderer.setAnimationLoop(null);
        animating = false;
        if (host) host.dataset.guideAnimating = "false";
      }
    }

    function wake() {
      if (!visible || !loaded || animating) return;
      animating = true;
      lastTime = 0;
      if (host) host.dataset.guideAnimating = "true";
      renderer.setAnimationLoop(frame);
    }

    function start() {
      if (visible || !loaded) return;
      visible = true;
      scheduleBlink();
      scheduleSaccade();
      scheduleBreath();
      wake();
    }

    function stop() {
      if (!visible) return;
      visible = false;
      renderer.setAnimationLoop(null);
      animating = false;
      if (host) host.dataset.guideAnimating = "false";
      window.clearTimeout(idleTimer);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(saccadeTimer);
      window.clearTimeout(saccadeResetTimer);
      window.clearTimeout(breathTimer);
      blinkStartedAt = 0;
      breathStartedAt = 0;
      pendingPointer = null;
      eyes.scale.y = 1;
      artwork.position.y = baseY;
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
    sourceImage.decoding = "async";
    sourceImage.onload = () => {
      if (disposed) return;
      try {
        const layers = makeGuideLayers(sourceImage);
        textures.push(layers.body, layers.head, layers.visor, layers.eyes);
        const mesh = (
          map: THREE.Texture,
          placement: { width: number; height: number; x: number; y: number },
          z: number,
          order: number,
          curvedDepth = 0,
        ) => {
          const material = new THREE.MeshBasicMaterial({
            map,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
            toneMapped: false,
          });
          materials.push(material);
          const geometry = curvedDepth
            ? headGeometry(
                placement.width,
                placement.height,
                curvedDepth,
                depthVariant,
              )
            : new THREE.PlaneGeometry(placement.width, placement.height);
          geometries.push(geometry);
          const plane = new THREE.Mesh(geometry, material);
          plane.position.set(placement.x, placement.y, z);
          plane.renderOrder = order;
          return plane;
        };

        bodyPivot.add(mesh(layers.body, layers.bodyPlacement, 0, 0));
        headPivot.position.set(layers.neckPivot.x, layers.neckPivot.y, 0.03);
        const head = mesh(layers.head, layers.headPlacement, 0, 1, 0.12);
        head.position.x -= layers.neckPivot.x;
        head.position.y -= layers.neckPivot.y;
        headPivot.add(head);

        visor.userData.baseX = layers.visorPlacement.x - layers.neckPivot.x;
        visor.userData.baseY = layers.visorPlacement.y - layers.neckPivot.y;
        visor.position.set(visor.userData.baseX, visor.userData.baseY, 0.05);
        const face = mesh(
          layers.visor,
          { ...layers.visorPlacement, x: 0, y: 0 },
          0,
          2,
          0.08,
        );
        visor.add(face);

        eyes.userData.baseX = layers.eyePlacement.x - layers.neckPivot.x;
        eyes.userData.baseY = layers.eyePlacement.y - layers.neckPivot.y;
        eyes.position.set(eyes.userData.baseX, eyes.userData.baseY, 0.17);
        eyes.add(
          mesh(layers.eyes, { ...layers.eyePlacement, x: 0, y: 0 }, 0, 3),
        );

        loaded = true;
        renderer.render(scene, camera);
        canvas.style.opacity = "1";
        host?.setAttribute("data-guide-ready", "true");
        onReady();
        onVisibility();
      } catch {
        canvas.style.opacity = "0";
        onFailure();
      }
    };
    sourceImage.onerror = () => {
      if (!disposed) onFailure();
    };
    sourceImage.src = IMAGE_URL;

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch" || !visible) return;
        focusHeld = false;
        pendingPointer = { x: event.clientX, y: event.clientY };
        wake();
      },
      { passive: true, signal: abort.signal },
    );
    footer.addEventListener(
      "focusin",
      (event) => {
        if (!(event.target instanceof HTMLElement)) return;
        focusHeld = true;
        const rect = event.target.getBoundingClientRect();
        pointTo(rect.left + rect.width / 2, rect.top + rect.height / 2);
      },
      { signal: abort.signal },
    );
    footer.addEventListener(
      "focusout",
      () => {
        focusHeld = false;
        target.x = 0;
        target.y = 0;
        wake();
      },
      { signal: abort.signal },
    );
    document.addEventListener("visibilitychange", onVisibility, {
      signal: abort.signal,
    });
    canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        stop();
        canvas.style.opacity = "0";
        onFailure();
      },
      { signal: abort.signal },
    );

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
  }, [onReady, onFailure, depthVariant]);

  return <div ref={hostRef} className={styles.guideStage} />;
}
