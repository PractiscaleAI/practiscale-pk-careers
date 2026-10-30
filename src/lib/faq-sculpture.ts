import * as THREE from "three";

type Sculpture = {
  render: (progress: number, pointerX?: number, pointerY?: number) => void;
  resize: () => void;
  destroy: () => void;
};

// The question mark is bevelled solid geometry, drawn only when its scroll pose
// changes. A shared clipping plane lets the mark and tray descend into the floor.
export function mountFaqSculpture(canvas: HTMLCanvasElement): Sculpture {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
  camera.position.set(0, 0.45, 7.6);
  camera.lookAt(0, -0.12, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4f8b82, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.7);
  key.position.set(-3, 5, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9be3d6, 1.2);
  fill.position.set(4, 2, -2);
  scene.add(fill);

  const stage = new THREE.Group();
  scene.add(stage);
  const mark = new THREE.Group();
  stage.add(mark);
  const surfaceClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.49);

  const letterMaterial = new THREE.MeshStandardMaterial({
    color: 0x11665d,
    metalness: 0.08,
    roughness: 0.48,
    clippingPlanes: [surfaceClip],
  });
  const baseSide = new THREE.MeshStandardMaterial({
    color: 0x155a54,
    metalness: 0.06,
    roughness: 0.56,
    clippingPlanes: [surfaceClip],
  });
  const baseTop = new THREE.MeshStandardMaterial({
    color: 0x2d887a,
    metalness: 0.04,
    roughness: 0.62,
    clippingPlanes: [surfaceClip],
  });
  const accent = new THREE.MeshStandardMaterial({
    color: 0x7ec9ba,
    metalness: 0.06,
    roughness: 0.55,
    clippingPlanes: [surfaceClip],
  });
  const geometries: THREE.BufferGeometry[] = [];

  // A custom glyph outline has flat faces and soft bevels, so it reads as
  // intentional typography rather than a bent metal tube.
  const glyph = new THREE.Shape();
  glyph.moveTo(-0.78, 0.45);
  glyph.bezierCurveTo(-0.8, 0.96, -0.39, 1.32, 0.23, 1.32);
  glyph.bezierCurveTo(0.85, 1.32, 1.17, 0.96, 1.13, 0.49);
  glyph.bezierCurveTo(1.1, 0.17, 0.9, -0.06, 0.54, -0.28);
  glyph.bezierCurveTo(0.33, -0.41, 0.25, -0.53, 0.25, -0.7);
  glyph.lineTo(-0.29, -0.7);
  glyph.bezierCurveTo(-0.3, -0.36, -0.15, -0.1, 0.14, 0.1);
  glyph.bezierCurveTo(0.42, 0.27, 0.55, 0.42, 0.55, 0.61);
  glyph.bezierCurveTo(0.55, 0.84, 0.37, 0.97, 0.13, 0.97);
  glyph.bezierCurveTo(-0.15, 0.97, -0.3, 0.82, -0.31, 0.45);
  glyph.closePath();

  const dot = new THREE.Shape();
  dot.absarc(-0.02, -1.04, 0.22, 0, Math.PI * 2, false);
  const extrude = {
    depth: 0.3,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.055,
    bevelThickness: 0.055,
    curveSegments: 28,
  };
  for (const shape of [glyph, dot]) {
    const geometry = new THREE.ExtrudeGeometry(shape, extrude);
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, letterMaterial);
    mesh.position.z = -0.15;
    mark.add(mesh);
  }

  const diskGeometry = new THREE.CylinderGeometry(1.7, 1.67, 0.22, 88);
  geometries.push(diskGeometry);
  const disk = new THREE.Mesh(diskGeometry, [baseSide, baseTop, baseSide]);
  disk.position.y = -1.37;
  stage.add(disk);

  const rimGeometry = new THREE.TorusGeometry(1.64, 0.012, 6, 88);
  geometries.push(rimGeometry);
  const diskRim = new THREE.Mesh(rimGeometry, accent);
  diskRim.rotation.x = Math.PI / 2;
  diskRim.position.y = -1.252;
  stage.add(diskRim);

  function resize() {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    // Keep the question mark and its tray as one scaled object on narrow screens.
    stage.scale.setScalar(width < 440 ? 0.86 : 1);
    mark.scale.setScalar(width < 440 ? 1.13 : 1.18);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 440 ? 9.4 : width < 760 ? 8.7 : 7.6;
    camera.updateProjectionMatrix();
  }

  function render(progress: number, pointerX = 0, pointerY = 0) {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    const turnProgress = THREE.MathUtils.clamp((p - 0.02) / 0.64, 0, 1);
    const turn = turnProgress * turnProgress * (3 - 2 * turnProgress);
    const sinkProgress =
      canvas.clientWidth < 440
        ? THREE.MathUtils.clamp((p - 0.5) / 0.2, 0, 1)
        : THREE.MathUtils.clamp((p - 0.52) / 0.31, 0, 1);
    const sink = sinkProgress * sinkProgress * (3 - 2 * sinkProgress);
    stage.rotation.y = -0.1 + pointerX * 0.035;
    stage.position.y = -sink * 3.6;
    mark.rotation.y = -0.34 + turn * Math.PI * 2;
    mark.rotation.x = Math.sin(p * Math.PI) * 0.06 + pointerY * 0.03;
    mark.position.y = canvas.clientWidth < 440 ? 0.23 : 0.28;
    renderer.render(scene, camera);
  }

  resize();
  render(0);
  return {
    render,
    resize,
    destroy() {
      geometries.forEach((geometry) => geometry.dispose());
      [letterMaterial, baseSide, baseTop, accent].forEach((material) =>
        material.dispose(),
      );
      renderer.dispose();
    },
  };
}
