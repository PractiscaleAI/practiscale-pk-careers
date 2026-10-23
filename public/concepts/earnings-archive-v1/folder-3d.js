import * as THREE from "three";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";

// Original procedural geometry. The folder has physical thickness, a hinge,
// separate inner and outer surfaces, paper leaves, and studio contact shadows.
export async function createArchiveFolder(parent) {
  const canvas = document.createElement("canvas");
  canvas.className = "folder-3d";
  canvas.setAttribute("aria-hidden", "true");
  parent.prepend(canvas);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    canvas.remove();
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.35));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(environment, 0.055);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.38;
  environment.dispose();
  pmrem.dispose();
  const camera = new THREE.OrthographicCamera(-6, 6, 4, -4, 0.1, 70);
  camera.position.set(5, 12.5, 13);
  camera.lookAt(0, 0.7, 0);
  const key = new THREE.DirectionalLight(0xf9fff4, 1.7);
  key.position.set(-4, 10, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -7;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 25;
  key.shadow.normalBias = 0.018;
  key.shadow.bias = -0.00015;
  key.shadow.radius = 5;
  key.shadow.blurSamples = 12;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9dd8e1, 0.45);
  fill.position.set(6, 4, -5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xd7f2e3, 0.8);
  rim.position.set(-5, 3, -7);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xdceee5, 0x143d3c, 0.4));

  const studio = new THREE.Group();
  scene.add(studio);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShadowMaterial({ color: 0x062b2a, opacity: 0.2 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.11;
  ground.receiveShadow = true;
  scene.add(ground);
  const folder = new THREE.Group();
  folder.rotation.x = -Math.PI / 2;
  studio.add(folder);
  const textures = [];
  const geometries = [];
  const materials = [];
  const trackGeometry = (g) => (geometries.push(g), g);
  const trackMaterial = (m) => (materials.push(m), m);

  function roundedRect(w, h, r) {
    const s = new THREE.Shape(),
      x = -w / 2,
      y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  function extrude(shape, depth, bevel = 0.026) {
    return trackGeometry(
      new THREE.ExtrudeGeometry(shape, {
        depth,
        steps: 1,
        bevelEnabled: true,
        bevelSegments: 4,
        bevelSize: bevel,
        bevelThickness: bevel * 0.7,
        curveSegments: 18,
      }),
    );
  }
  function mesh(geometry, material, container = folder) {
    const result = new THREE.Mesh(geometry, material);
    result.castShadow = true;
    result.receiveShadow = true;
    container.add(result);
    return result;
  }
  function textureFrom(c, color = true) {
    const texture = new THREE.CanvasTexture(c);
    if (color) texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.push(texture);
    return texture;
  }
  const grainCanvas = document.createElement("canvas");
  grainCanvas.width = 256;
  grainCanvas.height = 256;
  const gc = grainCanvas.getContext("2d");
  const pixels = gc.createImageData(256, 256);
  let seed = 907;
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const v = 160 + (seed >>> 26);
    pixels.data[i] = v;
    pixels.data[i + 1] = v;
    pixels.data[i + 2] = v;
    pixels.data[i + 3] = 255;
  }
  gc.putImageData(pixels, 0, 0);
  const grain = textureFrom(grainCanvas, false);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(8, 6);
  const teal = trackMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x123f3d,
      roughness: 0.86,
      metalness: 0.04,
      roughnessMap: grain,
      bumpMap: grain,
      bumpScale: 0.014,
      clearcoat: 0.06,
      clearcoatRoughness: 0.76,
    }),
  );
  const lining = trackMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x194a42,
      roughness: 0.95,
      bumpMap: grain,
      bumpScale: 0.012,
    }),
  );
  const edge = trackMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x123c3a,
      roughness: 0.81,
      metalness: 0,
    }),
  );
  const paper = trackMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xf2f3ed,
      roughness: 0.91,
      bumpMap: grain,
      bumpScale: 0.002,
    }),
  );
  const paperEdge = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0xdbe3d9, roughness: 1 }),
  );
  const seam = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0x0d3331, roughness: 0.86 }),
  );

  const W = 6.2,
    H = 4.15;
  const backShape = roundedRect(W, H, 0.13);
  mesh(extrude(backShape, 0.045), [lining, edge]);
  // The raised die-cut tab is part of the physical rear cover.
  const tab = mesh(extrude(roundedRect(2.08, 0.7, 0.105), 0.045, 0.025), teal);
  tab.position.set(-1.8, H / 2 + 0.25, 0);
  const pages = new THREE.Group();
  folder.add(pages);
  const sheetGeometry = extrude(roundedRect(5.87, 3.88, 0.055), 0.012, 0.004);
  const leaves = new THREE.InstancedMesh(sheetGeometry, [paper, paperEdge], 10);
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  pages.add(leaves);
  const leafTransform = new THREE.Object3D();
  for (let i = 0; i < 10; i++) {
    leafTransform.position.set(
      ((i % 3) - 1) * 0.009,
      -0.025 + (i % 2) * 0.009,
      0.075 + i * 0.017,
    );
    leafTransform.rotation.z = ((i % 3) - 1) * 0.002;
    leafTransform.updateMatrix();
    leaves.setMatrixAt(i, leafTransform.matrix);
  }
  // The lid pivot sits on the far edge of the archive, so it opens away
  // from the reading position rather than rotating around the object centre.
  const lid = new THREE.Group();
  lid.position.set(0, H / 2, 0.296);
  folder.add(lid);
  const coverGeometry = extrude(roundedRect(W + 0.02, H, 0.13), 0.055, 0.032);
  const positions = coverGeometry.getAttribute("position");
  const uv = coverGeometry.getAttribute("uv");
  for (let i = 0; i < positions.count; i++)
    uv.setXY(
      i,
      positions.getX(i) / (W + 0.02) + 0.5,
      positions.getY(i) / H + 0.5,
    );
  coverGeometry.translate(0, -H / 2, 0);

  const colorCanvas = document.createElement("canvas"),
    heightCanvas = document.createElement("canvas");
  colorCanvas.width = heightCanvas.width = 2048;
  colorCanvas.height = heightCanvas.height = 1370;
  const cc = colorCanvas.getContext("2d"),
    hc = heightCanvas.getContext("2d");
  cc.fillStyle = "#124747";
  cc.fillRect(0, 0, 2048, 1370);
  hc.fillStyle = "#808080";
  hc.fillRect(0, 0, 2048, 1370);
  const ink = (text, x, y, font, color, heightColor = "#777777") => {
    cc.font = hc.font = font;
    cc.fillStyle = color;
    hc.fillStyle = heightColor;
    cc.fillText(text, x, y);
    hc.fillText(text, x, y);
  };
  ink("PRACTISCALE", 150, 210, "500 37px Mono", "#c9ddd2");
  ink("Earnings", 138, 580, "600 182px Sora", "#dce9dc");
  ink("archive.", 138, 790, "600 182px Sora", "#dce9dc");
  ink("THE PEOPLE BEHIND THE NUMBERS", 150, 1145, "400 23px Mono", "#aac7b8");
  ink("10", 1560, 1128, "600 106px Sora", "#c7ddcd");
  ink("COMMISSION", 1710, 1080, "400 19px Mono", "#bcd2c2");
  ink("RECORDS", 1710, 1114, "400 19px Mono", "#bcd2c2");
  // A narrow pressed rule produces a real normal response to the key light.
  cc.strokeStyle = "#2e6660";
  cc.lineWidth = 2;
  cc.strokeRect(75, 75, 1898, 1218);
  hc.strokeStyle = "#747474";
  hc.lineWidth = 4;
  hc.strokeRect(75, 75, 1898, 1218);
  const coverMap = textureFrom(colorCanvas),
    bump = textureFrom(heightCanvas, false);
  const cover = trackMaterial(
    new THREE.MeshPhysicalMaterial({
      map: coverMap,
      color: 0xffffff,
      roughness: 0.9,
      roughnessMap: grain,
      metalness: 0.035,
      bumpMap: bump,
      bumpScale: 0.035,
      clearcoat: 0.05,
      clearcoatRoughness: 0.8,
    }),
  );
  // Give the two caps independent materials, so the printed exterior
  // naturally turns away and the plain lining is revealed as the lid opens.
  coverGeometry.clearGroups();
  const normals = coverGeometry.getAttribute("normal");
  const triangles = [[], [], []];
  for (let i = 0; i < positions.count; i += 3) {
    const nz = normals.getZ(i);
    const material = nz > 0.99 ? 2 : nz < -0.99 ? 0 : 1;
    triangles[material].push(i, i + 1, i + 2);
  }
  coverGeometry.setIndex(triangles.flat());
  let groupStart = 0;
  triangles.forEach((group, material) => {
    coverGeometry.addGroup(groupStart, group.length, material);
    groupStart += group.length;
  });
  mesh(coverGeometry, [lining, edge, cover], lid);
  const hingeGeometry = trackGeometry(
    new THREE.CylinderGeometry(0.038, 0.038, 5.98, 24),
  );
  const hinge = mesh(hingeGeometry, seam);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, H / 2, 0.273);
  const seamGeometry = trackGeometry(
    new THREE.CylinderGeometry(0.012, 0.012, 5.86, 12),
  );
  const topSeam = mesh(seamGeometry, teal, lid);
  topSeam.rotation.z = Math.PI / 2;
  topSeam.position.set(0, -0.045, 0.062);

  let portrait = null,
    last = {};
  function resize(isPortrait) {
    if (portrait === isPortrait) return;
    portrait = isPortrait;
    const w = portrait ? 620 : 1200,
      h = portrait ? 900 : 800;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.style.left = -w / 2 + "px";
    canvas.style.top = -h / 2 + "px";
    renderer.setSize(w, h, false);
    camera.left = -w / 200;
    camera.right = w / 200;
    camera.top = h / 200;
    camera.bottom = -h / 200;
    camera.updateProjectionMatrix();
  }
  function render({
    opening,
    finale,
    portrait: isPortrait,
    pointer,
    staticMode,
  }) {
    const compact = !isPortrait && window.innerHeight < 550;
    if (
      last.pointer &&
      last.portrait === isPortrait &&
      last.compact === compact &&
      Math.abs(last.opening - opening) < 0.0002 &&
      Math.abs(last.finale - finale) < 0.0002 &&
      Math.abs(last.pointer.x - pointer.x) +
        Math.abs(last.pointer.y - pointer.y) <
        0.06
    )
      return;
    resize(isPortrait);
    canvas.style.opacity = "1";
    const px = staticMode ? 0 : pointer.x - 0.5,
      py = staticMode ? 0 : pointer.y - 0.5;
    lid.rotation.x = -opening * (1 - finale) * 1.91;
    const scale =
      (portrait ? 0.7 : 0.95) *
      (1 - opening * 0.32) *
      (1 - finale * (portrait ? 0.36 : 0.58)) *
      (1 - (compact ? 0.09 : 0) * opening * (1 - finale));
    studio.scale.setScalar(scale);
    studio.rotation.y = -0.16 + opening * 0.1 + px * 0.065;
    studio.rotation.z = -0.04 + py * 0.018;
    studio.position.set(
      0,
      (-0.12 - opening * 0.65) * (1 - finale) -
        (portrait ? 0.5 : 0.95) * finale,
      0,
    );
    camera.position.set(5 - opening * 0.8 + px * 0.3, 12.5 + py * 0.3, 13);
    camera.lookAt(0, 0.7, 0);
    pages.position.z = opening * 0.035;
    renderer.render(scene, camera);
    canvas.dataset.opening = opening.toFixed(4);
    canvas.dataset.meshes = String(renderer.info.render.calls);
    const projected = {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity,
    };
    const viewWidth = portrait ? 620 : 1200,
      viewHeight = portrait ? 900 : 800;
    studio.traverse((object) => {
      if (!object.isMesh) return;
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
      const bounds = object.geometry.boundingBox;
      const instances = object.isInstancedMesh ? object.count : 1;
      for (let i = 0; i < instances; i++) {
        const matrix = new THREE.Matrix4();
        if (object.isInstancedMesh) object.getMatrixAt(i, matrix);
        matrix.premultiply(object.matrixWorld);
        for (const x of [bounds.min.x, bounds.max.x])
          for (const y of [bounds.min.y, bounds.max.y])
            for (const z of [bounds.min.z, bounds.max.z]) {
              const v = new THREE.Vector3(x, y, z)
                .applyMatrix4(matrix)
                .project(camera);
              const xx = ((v.x + 1) * viewWidth) / 2,
                yy = ((1 - v.y) * viewHeight) / 2;
              projected.left = Math.min(projected.left, xx);
              projected.right = Math.max(projected.right, xx);
              projected.top = Math.min(projected.top, yy);
              projected.bottom = Math.max(projected.bottom, yy);
            }
      }
    });
    canvas.dataset.projectedBounds = JSON.stringify(projected);
    last = {
      opening,
      finale,
      portrait: isPortrait,
      compact,
      pointer: { ...pointer },
      staticMode,
    };
  }
  try {
    resize(false);
    await renderer.compileAsync(scene, camera);
  } catch {
    // A context can compile synchronously when async shader compilation
    // is unavailable; rendering itself remains the capability check.
  }
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    document.body.dataset.folderRenderer = "fallback";
  });
  canvas.addEventListener("webglcontextrestored", () => {
    document.body.dataset.folderRenderer = "webgl";
    if (last.pointer) render(last);
  });
  return {
    render,
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      leaves.dispose();
      envTarget.dispose();
      ground.geometry.dispose();
      ground.material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
