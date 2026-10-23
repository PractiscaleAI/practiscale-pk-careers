import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};
const at = (p, a, b) => smooth((p - a) / (b - a));
const mix = (a, b, t) => a + (b - a) * t;

// One original, connected scene. This same scene supplies the website, posters
// and MP4 exports. Repeated geometry is flattened into shared instanced batches.
/** @param {HTMLElement} parent @param {any} [options] */
export async function createProofWorld(parent, options = {}) {
  const palette = options.palette || {};
  const color = (key, fallback) => new THREE.Color(palette[key] || fallback);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.proofCanvas = "";
  parent.append(canvas);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
      preserveDrawingBuffer: !!options.exporting,
    });
  } catch (error) {
    canvas.remove();
    throw error;
  }
  renderer.setPixelRatio(
    Math.min(options.dpr || devicePixelRatio || 1, options.mobile ? 1.25 : 1.5),
  );
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.07;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  const scene = new THREE.Scene(),
    root = new THREE.Group();
  scene.add(root);
  const env = new RoomEnvironment(),
    pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(env, 0.06);
  scene.environment = envMap.texture;
  scene.environmentIntensity = 0.42;
  env.dispose();
  pmrem.dispose();
  const camera = new THREE.OrthographicCamera(-10, 10, 7, -7, 0.1, 80);
  const key = new THREE.DirectionalLight(0xfff9ef, 3.0);
  key.position.set(-7, 14, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(
    options.mobile ? 768 : 1024,
    options.mobile ? 768 : 1024,
  );
  Object.assign(key.shadow.camera, {
    left: -11,
    right: 11,
    top: 10,
    bottom: -10,
    near: 0.1,
    far: 35,
  });
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0002;
  key.shadow.radius = 4;
  key.shadow.blurSamples = 8;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb9e4de, 0.7);
  fill.position.set(10, 7, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xe6f4f1, 1.3);
  rim.position.set(0, 7, -10);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xeef8f5, 0x153c3d, 0.55));
  const geometries = [],
    materials = [],
    batches = [];
  const geometry = (g) => (geometries.push(g), g);
  const material = (m) => (materials.push(m), m);
  const boxGeo = geometry(new RoundedBoxGeometry(1, 1, 1, 2, 0.055));
  const roundGeo = geometry(new THREE.SphereGeometry(0.5, 12, 9));
  const cylinderGeo = geometry(new THREE.CylinderGeometry(0.5, 0.5, 1, 12));
  const diskGeo = geometry(new THREE.CylinderGeometry(0.5, 0.5, 1, 20));
  const M = {
    base: material(
      new THREE.MeshStandardMaterial({
        color: color("surface", "#1C5052"),
        roughness: 0.72,
        metalness: 0.12,
      }),
    ),
    raised: material(
      new THREE.MeshStandardMaterial({
        color: color("raised", "#265F61"),
        roughness: 0.65,
        metalness: 0.14,
      }),
    ),
    ivory: material(
      new THREE.MeshStandardMaterial({
        color: color("fog", "#F3F6F6"),
        roughness: 0.64,
        metalness: 0.02,
      }),
    ),
    white: material(
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.56 }),
    ),
    mint: material(
      new THREE.MeshStandardMaterial({
        color: color("mint", "#9BE3D6"),
        roughness: 0.56,
        metalness: 0.1,
      }),
    ),
    ink: material(
      new THREE.MeshStandardMaterial({
        color: color("deep", "#134143"),
        roughness: 0.62,
        metalness: 0.08,
      }),
    ),
    glass: material(
      new THREE.MeshPhysicalMaterial({
        color: 0x285b64,
        roughness: 0.23,
        metalness: 0.28,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      }),
    ),
    steel: material(
      new THREE.MeshStandardMaterial({
        color: 0x8cadaa,
        roughness: 0.38,
        metalness: 0.76,
      }),
    ),
    dark: material(
      new THREE.MeshStandardMaterial({ color: 0x163334, roughness: 0.65 }),
    ),
    leaf: material(
      new THREE.MeshStandardMaterial({ color: 0x286c5b, roughness: 0.86 }),
    ),
    leafLight: material(
      new THREE.MeshStandardMaterial({ color: 0x54947a, roughness: 0.86 }),
    ),
    paper: material(
      new THREE.MeshStandardMaterial({ color: 0xe7eeeb, roughness: 0.92 }),
    ),
    amber: material(
      new THREE.MeshStandardMaterial({
        color: color("amber", "#F5B041"),
        roughness: 0.4,
        metalness: 0.16,
        emissive: color("amber", "#F5B041"),
        emissiveIntensity: 0.16,
      }),
    ),
  };
  const dynamicMaterials = [];
  const actors = [],
    envs = [];
  function group(parent = root, x = 0, y = 0, z = 0) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  function mesh(g, m, parent, x, y, z, sx, sy, sz) {
    const object = new THREE.Mesh(g, m);
    object.position.set(x, y, z);
    object.scale.set(sx, sy, sz);
    parent.add(object);
    return object;
  }
  const box = (parent, w, h, d, x, y, z, m = M.ivory) =>
    mesh(boxGeo, m, parent, x, y, z, w, h, d);
  const sphere = (parent, w, h, d, x, y, z, m = M.mint) =>
    mesh(roundGeo, m, parent, x, y, z, w, h, d);
  const cylinder = (parent, r, h, x, y, z, m = M.steel) =>
    mesh(cylinderGeo, m, parent, x, y, z, r * 2, h, r * 2);
  function illuminated(base = M.glass) {
    const m = material(base.clone());
    m.emissive = color("amber", "#F5B041");
    m.emissiveIntensity = 0;
    dynamicMaterials.push(m);
    return m;
  }
  function tree(parent, x, z, size = 1) {
    const g = group(parent, x, 0.05, z);
    cylinder(g, 0.055, 0.65, 0, 0.35, 0, M.steel);
    sphere(g, 0.68 * size, 0.9 * size, 0.65 * size, 0, 0.9 * size, 0, M.leaf);
    sphere(
      g,
      0.47 * size,
      0.58 * size,
      0.45 * size,
      -0.18 * size,
      0.82 * size,
      0.12 * size,
      M.leafLight,
    );
    box(g, 0.72 * size, 0.18, 0.7 * size, 0, 0.03, 0, M.base);
  }
  function architecture(parent, w, h, d, x, z) {
    const building = group(parent, x, 0.13, z);
    box(building, w, h, d, 0, h / 2, 0, M.ivory);
    box(building, w + 0.16, 0.13, d + 0.14, 0, h + 0.045, 0, M.white);
    box(building, w + 0.1, 0.15, d + 0.1, 0, 0.075, 0, M.raised);
    const windows = illuminated();
    const rows = Math.max(2, Math.floor(h / 0.45)),
      cols = options.mobile ? 2 : 3;
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++) {
        const xx = ((col - (cols - 1) / 2) * (w - 0.25)) / cols,
          yy = 0.35 + (row * (h - 0.6)) / Math.max(1, rows - 1);
        box(
          building,
          (w - 0.36) / cols,
          0.26,
          0.055,
          xx,
          yy,
          d / 2 + 0.025,
          (row + col) % 3 === 0 ? windows : M.glass,
        );
        box(
          building,
          0.055,
          0.3,
          0.12,
          xx - (w - 0.25) / cols / 2,
          yy,
          d / 2 + 0.055,
          M.white,
        );
      }
    for (let row = 0; row < rows; row++) {
      box(
        building,
        0.04,
        0.24,
        d * 0.6,
        w / 2 + 0.026,
        0.35 + (row * (h - 0.6)) / Math.max(1, rows - 1),
        0,
        M.glass,
      );
      box(
        building,
        0.08,
        0.055,
        d * 0.72,
        w / 2 + 0.055,
        0.19 + (row * (h - 0.6)) / Math.max(1, rows - 1),
        0,
        M.ivory,
      );
    }
    // Door is recessed behind its frame and canopy.
    box(building, 0.5, 0.68, 0.07, -w * 0.12, 0.39, d / 2 + 0.04, M.ink);
    box(
      building,
      0.04,
      0.7,
      0.14,
      -w * 0.12 - 0.28,
      0.39,
      d / 2 + 0.075,
      M.white,
    );
    box(
      building,
      0.04,
      0.7,
      0.14,
      -w * 0.12 + 0.28,
      0.39,
      d / 2 + 0.075,
      M.white,
    );
    box(building, 0.74, 0.065, 0.44, -w * 0.12, 0.78, d / 2 + 0.16, M.ivory);
    box(building, 0.68, 0.1, 0.36, -w * 0.12, 0.06, d / 2 + 0.18, M.paper);
    for (let k = 0; k < 2; k++) {
      box(
        building,
        0.42,
        0.2,
        0.4,
        (k - 0.5) * 0.55,
        h + 0.19,
        -d * 0.15,
        M.steel,
      );
      for (let vent = 0; vent < 3; vent++)
        box(
          building,
          0.028,
          0.012,
          0.3,
          (k - 0.5) * 0.55 + (vent - 1) * 0.085,
          h + 0.296,
          -d * 0.15,
          M.dark,
        );
    }
    actors.push({
      type: "building",
      node: building,
      stage: 0,
      offset: envs.length * 0.02,
      material: windows,
    });
    return building;
  }

  // A shared carved foundation and one continuous recessed perimeter track.
  const platform = group();
  box(platform, 13.8, 0.32, 10.6, 0, 0, 0, M.base);
  box(platform, 13.6, 0.07, 10.4, 0, 0.185, 0, M.raised);
  box(platform, 12.8, 0.025, 0.11, 0, 0.233, -4.78, M.ink);
  box(platform, 12.8, 0.025, 0.11, 0, 0.233, 4.78, M.ink);
  box(platform, 0.11, 0.025, 9.56, -6.4, 0.233, 0, M.ink);
  box(platform, 0.11, 0.025, 9.56, 6.4, 0.233, 0, M.ink);
  box(platform, 0.4, 0.018, 8.8, 0, 0.231, 0, M.base);
  box(platform, 12.0, 0.018, 0.4, 0, 0.231, 0, M.base);
  const locations = [
    [-3.35, -2.35],
    [3.35, -2.35],
    [3.35, 2.35],
    [-3.35, 2.35],
  ];
  const strips = [];
  for (const [i, [x, z]] of locations.entries()) {
    const e = group(root, x, 0.245, z);
    envs.push(e);
    box(e, 5.25, 0.16, 3.78, 0, 0, 0, M.base);
    box(e, 5.1, 0.06, 3.62, 0, 0.106, 0, M.ivory);
    const indicator = material(M.mint.clone());
    strips.push(indicator);
    box(e, 1.15, 0.026, 0.085, 0, 0.15, i < 2 ? -1.88 : 1.88, indicator);
    for (const side of [-1, 1])
      box(e, 0.065, 0.15, 0.65, side * 2.35, 0.08, 0, M.raised);
  }
  const ground = new THREE.Mesh(
    geometry(new THREE.PlaneGeometry(70, 70)),
    material(new THREE.ShadowMaterial({ color: 0x061f21, opacity: 0.3 })),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.19;
  ground.receiveShadow = true;
  scene.add(ground);

  // A: healthcare architecture, varied masses, glazing, roofs and entrance.
  const healthcare = envs[0];
  const mainClinic = architecture(healthcare, 2.0, 2.55, 1.55, -0.55, -0.2);
  architecture(healthcare, 1.18, 1.5, 1.35, 1.1, 0.12);
  architecture(healthcare, 1.05, 1.1, 1.15, -1.7, 0.56);
  const cross = group(mainClinic, 0, 2.09, 0.82);
  box(cross, 0.45, 0.46, 0.06, 0, 0, 0, M.ink);
  box(cross, 0.27, 0.08, 0.065, 0, 0, 0.039, M.white);
  box(cross, 0.08, 0.27, 0.065, 0, 0, 0.04, M.white);
  tree(healthcare, 2.04, 1.1, 0.78);
  tree(healthcare, -2.02, -1.1, 0.67);
  box(healthcare, 1.4, 0.025, 0.38, 0.35, 0.149, 1.43, M.paper);

  // B: an open working floor, actual furniture and a small symbolic team.
  const office = envs[1],
    officeStructure = group(office);
  box(officeStructure, 4.8, 0.65, 0.12, 0, 0.43, -1.66, M.base);
  for (const x of [-2.2, 2.2]) {
    box(officeStructure, 0.11, 1.7, 0.11, x, 0.96, -1.62, M.steel);
    box(officeStructure, 0.11, 1.7, 0.11, x, 0.96, 1.42, M.steel);
  }
  box(officeStructure, 4.62, 0.12, 0.14, 0, 1.83, -1.62, M.ivory);
  box(officeStructure, 0.14, 0.12, 3.12, -2.2, 1.83, -0.1, M.ivory);
  const partition = group(office, -2.18, 0.4, 0);
  box(partition, 0.1, 0.58, 2.5, 0, 0.2, 0, M.mint);
  actors.push({ type: "partition", node: partition, stage: 1 });
  for (let i = 0; i < 4; i++) {
    const x = i % 2 === 0 ? -1.04 : 1.08,
      z = i < 2 ? -0.72 : 0.82;
    const desk = group(office, x, 0.15, z),
      width = i === 0 ? 1.55 : 1.35;
    box(desk, width, 0.09, 0.68, 0, 0.63, 0, M.ivory);
    for (const dx of [-width * 0.4, width * 0.4])
      for (const dz of [-0.24, 0.24])
        box(desk, 0.055, 0.6, 0.055, dx, 0.3, dz, M.steel);
    box(desk, 0.13, 0.22, 0.12, 0, 0.77, -0.12, M.steel);
    box(desk, 0.38, 0.035, 0.22, 0, 0.68, -0.12, M.dark);
    const screenMat = illuminated();
    box(desk, 0.63, 0.42, 0.07, 0, 0.99, -0.15, M.dark);
    box(desk, 0.56, 0.34, 0.018, 0, 0.99, -0.104, screenMat);
    box(desk, 0.45, 0.025, 0.16, 0, 0.696, 0.19, M.raised);
    cylinder(desk, 0.055, 0.11, 0.49, 0.735, 0.1, M.mint);
    const chair = group(desk, 0, 0, 0.53);
    cylinder(chair, 0.035, 0.32, 0, 0.22, 0, M.steel);
    box(chair, 0.43, 0.09, 0.39, 0, 0.43, 0, M.dark);
    box(chair, 0.43, 0.49, 0.08, 0, 0.7, 0.16, M.ink);
    for (const a of [0, Math.PI / 2]) {
      const leg = box(chair, 0.49, 0.045, 0.05, 0, 0.07, 0, M.steel);
      leg.rotation.y = a;
    }
    // Symbolic, faceless figures, not fabricated portraits.
    sphere(chair, 0.22, 0.23, 0.22, 0, 1.01, -0.03, M.paper);
    box(chair, 0.32, 0.36, 0.23, 0, 0.73, -0.03, i % 2 ? M.mint : M.raised);
    const armL = box(chair, 0.08, 0.3, 0.08, -0.18, 0.75, -0.16, M.paper);
    armL.rotation.x = -0.65;
    const armR = box(chair, 0.08, 0.3, 0.08, 0.18, 0.75, -0.16, M.paper);
    armR.rotation.x = -0.65;
    actors.push({
      type: "desk",
      node: desk,
      x,
      z,
      index: i,
      stage: 1,
      material: screenMat,
    });
  }
  tree(office, 1.94, -1.19, 0.62);
  const board = group(officeStructure, -1.08, 1.13, -1.49);
  box(board, 1.3, 0.67, 0.06, 0, 0, 0, M.white);
  for (let i = 0; i < 3; i++)
    box(
      board,
      0.7 - i * 0.12,
      0.025,
      0.018,
      -0.12,
      0.17 - i * 0.16,
      0.043,
      M.mint,
    );
  actors.push({ type: "structure", node: officeStructure, stage: 1 });

  // C: a dimensional candidate portal. Profiles remain a portal population,
  // not people flowing into the team or an implied conversion funnel.
  const portal = envs[2],
    frame = group(portal, 0, 0.14, -0.28);
  box(frame, 3.65, 0.15, 0.8, 0, 0.075, 0, M.raised);
  for (const x of [-1.71, 1.71])
    box(frame, 0.22, 2.22, 0.42, x, 1.16, 0, M.ivory);
  box(frame, 3.64, 0.25, 0.44, 0, 2.25, 0, M.ivory);
  box(frame, 3.13, 1.93, 0.1, 0, 1.22, -0.16, M.ink);
  box(frame, 3.1, 0.055, 0.06, 0, 2.06, -0.082, M.mint);
  actors.push({ type: "portal", node: frame, stage: 2 });
  for (let i = 0; i < 9; i++) {
    const x = ((i % 3) - 1) * 0.91,
      y = 0.51 + Math.floor(i / 3) * 0.58;
    const tile = group(portal, x, y + 0.14, -0.22);
    box(tile, 0.76, 0.47, 0.065, 0, 0, 0, M.ivory);
    sphere(tile, 0.12, 0.12, 0.035, -0.2, 0.06, 0.046, M.mint);
    box(tile, 0.18, 0.08, 0.03, -0.2, -0.07, 0.045, M.raised);
    box(tile, 0.29, 0.027, 0.028, 0.08, 0.07, 0.047, M.raised);
    box(tile, 0.22, 0.023, 0.028, 0.045, -0.05, 0.047, M.steel);
    actors.push({
      type: "profile",
      node: tile,
      x,
      y: y + 0.14,
      z: -0.22,
      index: i,
      stage: 2,
    });
  }
  tree(portal, -2.05, 1.15, 0.63);
  box(portal, 2.8, 0.055, 0.48, 0, 0.15, 1.26, M.paper);

  // D: a publication archive with bound volumes and a genuinely hinged folio.
  const archive = envs[3],
    shelf = group(archive, 0, 0.15, -0.15);
  box(shelf, 3.65, 0.14, 1.67, 0, 0.59, 0, M.raised);
  for (const x of [-1.43, 1.43])
    box(shelf, 0.16, 0.53, 1.37, x, 0.27, 0, M.steel);
  box(shelf, 3.35, 0.055, 0.96, 0, 0.11, -0.22, M.base);
  const reportMaterials = [M.ivory, M.mint, M.paper, M.raised];
  for (let i = 0; i < 4; i++) {
    const book = group(shelf, 1.15 - i * 0.31, 0.68, -0.22);
    const height = 0.73 + (i % 3) * 0.16;
    box(book, 0.25, height, 0.78, 0, height / 2, 0, reportMaterials[i]);
    box(book, 0.19, height - 0.08, 0.69, 0, height / 2, 0.046, M.paper);
    box(book, 0.25, height, 0.035, 0, height / 2, 0.406, reportMaterials[i]);
    for (let j = 0; j < 2; j++)
      box(book, 0.14, 0.018, 0.016, 0, height * 0.68 - j * 0.08, 0.431, M.ink);
    actors.push({
      type: "report",
      node: book,
      x: 1.15 - i * 0.31,
      z: -0.22,
      index: i,
      stage: 3,
    });
  }
  const folio = group(shelf, -0.73, 0.73, 0.28);
  folio.rotation.y = -0.14;
  const left = group(folio),
    right = group(folio, 0, 0.06, 0);
  box(left, 1.05, 0.045, 1.37, -0.525, 0, 0, M.ink);
  box(left, 0.98, 0.065, 1.28, -0.525, 0.045, 0, M.paper);
  box(right, 1.05, 0.045, 1.37, 0.525, 0, 0, M.mint);
  box(right, 0.98, 0.065, 1.28, 0.525, 0.045, 0, M.paper);
  for (const [wing, sign] of [
    [left, -1],
    [right, 1],
  ]) {
    for (let line = 0; line < 6; line++)
      box(
        wing,
        0.64 - (line % 3) * 0.05,
        0.006,
        0.018,
        sign * 0.53,
        0.083,
        -0.4 + line * 0.14,
        M.steel,
      );
    box(wing, 0.68, 0.009, 0.09, sign * 0.53, 0.083, -0.53, M.raised);
  }
  actors.push({ type: "folio", node: right, stage: 3 });
  actors.push({ type: "shelf", node: shelf, stage: 3 });
  tree(archive, 2.03, 1.11, 0.7);
  tree(archive, -2.07, -1.18, 0.64);

  const signal = mesh(
    diskGeo,
    M.amber,
    root,
    -3.35,
    0.27,
    -4.78,
    0.14,
    0.05,
    0.14,
  );
  const route = [
    [-3.35, -4.78],
    [3.35, -4.78],
    [6.4, -4.78],
    [6.4, 4.78],
    [3.35, 4.78],
    [-3.35, 4.78],
  ];
  const routeVec = route.map(([x, z]) => new THREE.Vector3(x, 0.28, z));
  const routeLengths = [0];
  for (let i = 1; i < routeVec.length; i++)
    routeLengths.push(
      routeLengths.at(-1) + routeVec[i].distanceTo(routeVec[i - 1]),
    );
  function routePoint(t) {
    const d = clamp(t) * routeLengths.at(-1);
    let i = 1;
    while (i < routeLengths.length - 1 && routeLengths[i] < d) i++;
    return routeVec[i - 1]
      .clone()
      .lerp(
        routeVec[i],
        (d - routeLengths[i - 1]) / (routeLengths[i] - routeLengths[i - 1]),
      );
  }

  // The hierarchy retains authorable scene nodes. Rendering uses a small set of
  // shared instanced geometry/material batches, including the animated nodes.
  const collected = [];
  root.traverse((object) => {
    if (object.isMesh) collected.push(object);
  });
  const batchMap = new Map();
  for (const object of collected) {
    const node = new THREE.Object3D();
    node.position.copy(object.position);
    node.quaternion.copy(object.quaternion);
    node.scale.copy(object.scale);
    object.parent.add(node);
    object.parent.remove(object);
    for (const actor of actors) if (actor.node === object) actor.node = node;
    if (object === signal) signal.userData.proxy = node;
    const id = object.geometry.uuid + ":" + object.material.uuid;
    if (!batchMap.has(id))
      batchMap.set(id, {
        geometry: object.geometry,
        material: object.material,
        nodes: [],
      });
    batchMap.get(id).nodes.push(node);
  }
  for (const batch of batchMap.values()) {
    const instances = new THREE.InstancedMesh(
      batch.geometry,
      batch.material,
      batch.nodes.length,
    );
    instances.castShadow = true;
    instances.receiveShadow = true;
    instances.frustumCulled = false;
    scene.add(instances);
    batches.push({ ...batch, instances });
  }
  let width = 1,
    height = 1,
    mobile = !!options.mobile,
    lastProgress = -1,
    renderCount = 0,
    lost = false,
    disposed = false;
  function resize(w, h, phone = mobile) {
    width = Math.max(1, w);
    height = Math.max(1, h);
    mobile = phone;
    renderer.setPixelRatio(
      Math.min(options.dpr || devicePixelRatio || 1, mobile ? 1.25 : 1.5),
    );
    renderer.setSize(width, height, false);
    camera.position.set(mobile ? 14 : 13, mobile ? 20 : 15, mobile ? 20 : 18);
    camera.lookAt(0, 0.85, 0);
    camera.updateMatrixWorld();
    const points = [];
    // Fit the actual occupied masses rather than a tall, empty box above every
    // corner of the foundation. This keeps mobile and desktop framing stable.
    const volumes = [
      [-7, -0.2, -5.4, 7, 0.4, 5.4],
      [-5.0, 0.3, -3.5, -2.8, 3.3, -1.45],
      [-5.7, 0.3, -2.7, -0.95, 2.2, -0.9],
      [0.8, 0.3, -4.1, 5.8, 2.35, -0.65],
      [1.3, 0.3, 1.5, 5.5, 2.95, 3.4],
      [-5.7, 0.3, 0.9, -1.2, 2.6, 4.1],
    ];
    for (const [x0, y0, z0, x1, y1, z1] of volumes)
      for (const x of [x0, x1])
        for (const y of [y0, y1])
          for (const z of [z0, z1])
            points.push(
              new THREE.Vector3(x, y, z).applyMatrix4(
                camera.matrixWorldInverse,
              ),
            );
    const xs = points.map((v) => v.x),
      ys = points.map((v) => v.y);
    const viewH =
      Math.max(
        Math.max(...ys) - Math.min(...ys),
        (Math.max(...xs) - Math.min(...xs)) / (width / height),
      ) * (mobile ? 1.08 : 1.06);
    const centreY = (Math.max(...ys) + Math.min(...ys)) / 2;
    camera.left = (-viewH * (width / height)) / 2;
    camera.right = -camera.left;
    camera.top = viewH / 2 + centreY;
    camera.bottom = -viewH / 2 + centreY;
    camera.updateProjectionMatrix();
    if (lastProgress >= 0) render(lastProgress, true);
  }
  function render(progress, force = false) {
    if (disposed || lost) return null;
    const p = clamp(progress);
    if (!force && Math.abs(lastProgress - p) < 0.00001) return null;
    lastProgress = p;
    const base = at(p, 0, 0.12);
    platform.scale.y = mix(0.68, 1, base);
    platform.position.y = mix(-0.08, 0, base);
    const activation =
      p < 0.12 || p >= 0.84 ? -1 : Math.min(3, Math.floor((p - 0.12) / 0.18));
    for (const actor of actors) {
      const a = 0.12 + actor.stage * 0.18,
        t = at(p, a, a + 0.17);
      if (actor.type === "building") {
        const q = at(p, a + 0.005, a + 0.13);
        actor.node.scale.y = mix(0.015, 1, q);
        actor.node.position.y = 0.13;
        actor.material.emissiveIntensity = at(p, a + 0.085, a + 0.165) * 0.14;
      } else if (actor.type === "desk") {
        const q = at(
          p,
          a + actor.index * 0.017,
          a + 0.105 + actor.index * 0.017,
        );
        actor.node.position.set(
          actor.x + mix((actor.index % 2 ? 1 : -1) * 0.42, 0, q),
          mix(-1.3, 0.15, q),
          actor.z,
        );
        actor.material.emissiveIntensity =
          at(
            p,
            a + 0.06 + actor.index * 0.019,
            a + 0.13 + actor.index * 0.012,
          ) * 0.15;
      } else if (actor.type === "partition") {
        actor.node.rotation.y = mix(0.35, 0, t);
        actor.node.position.x = mix(-1.82, -2.18, t);
        actor.node.position.y = mix(-0.1, 0.4, t);
        actor.node.scale.y = mix(0.001, 1, t);
      } else if (actor.type === "structure") {
        actor.node.scale.y = mix(0.03, 1, at(p, a, a + 0.09));
      } else if (actor.type === "portal") {
        actor.node.scale.y = mix(0.025, 1, at(p, a, a + 0.09));
      } else if (actor.type === "profile") {
        const q = at(
          p,
          a + 0.035 + actor.index * 0.008,
          a + 0.1 + actor.index * 0.008,
        );
        actor.node.position.set(
          mix(((actor.index % 3) - 1) * 0.45, actor.x, q),
          mix(-0.14, actor.y, q),
          mix(1.38, actor.z, q),
        );
        actor.node.rotation.y = mix(-0.22, 0, q);
      } else if (actor.type === "report") {
        const q = at(
          p,
          a + actor.index * 0.015,
          a + 0.095 + actor.index * 0.015,
        );
        actor.node.position.x = actor.x + mix(-0.65, 0, q);
        actor.node.position.z = actor.z + mix(0.26, 0, q);
        actor.node.rotation.y = mix(-0.22, 0, q);
      } else if (actor.type === "folio") {
        actor.node.rotation.z = mix(3.1, 0.12, at(p, a + 0.055, a + 0.17));
      } else if (actor.type === "shelf") {
        actor.node.scale.y = mix(0.035, 1, at(p, a, a + 0.08));
      }
    }
    strips.forEach((m, i) => {
      m.color.copy(activation === i ? M.amber.color : M.mint.color);
      m.emissive.copy(activation === i ? M.amber.color : M.mint.color);
      m.emissiveIntensity = activation === i ? 0.2 : 0.015;
    });
    const proxy = signal.userData.proxy;
    proxy.position.copy(routePoint((p - 0.12) / 0.72));
    proxy.scale.setScalar(p >= 0.12 && p < 0.84 ? 1 : 0);
    proxy.scale.multiply(new THREE.Vector3(0.14, 0.05, 0.14));
    root.updateMatrixWorld(true);
    for (const batch of batches) {
      batch.nodes.forEach((node, i) =>
        batch.instances.setMatrixAt(i, node.matrixWorld),
      );
      batch.instances.instanceMatrix.needsUpdate = true;
    }
    const started = performance.now();
    renderer.render(scene, camera);
    canvas.dataset.progress = p.toFixed(5);
    canvas.dataset.active = String(activation);
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.instances = String(collected.length);
    canvas.dataset.renderMs = (performance.now() - started).toFixed(2);
    canvas.dataset.renderCount = String(++renderCount);
    return {
      progress: p,
      active: activation,
      renderedAt: performance.now(),
      drawCalls: renderer.info.render.calls,
      instances: collected.length,
    };
  }
  const onLost = (event) => {
    event.preventDefault();
    lost = true;
    options.onContextChange?.(false);
  };
  const onRestored = () => {
    lost = false;
    options.onContextChange?.(true);
    if (lastProgress >= 0) render(lastProgress, true);
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  function dispose() {
    if (disposed) return;
    disposed = true;
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
    for (const b of batches) b.instances.dispose();
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    key.shadow.map?.dispose();
    key.shadow.mapPass?.dispose();
    envMap.dispose();
    renderer.dispose();
    canvas.remove();
  }
  try {
    resize(options.width || 1000, options.height || 500, mobile);
    render(1, true);
    await renderer.compileAsync(scene, camera);
  } catch (error) {
    dispose();
    throw error;
  }
  return { canvas, render, resize, dispose };
}

export function proofPalette(element) {
  const css = getComputedStyle(element),
    get = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  return {
    deep: get("--deep", "#134143"),
    surface: get("--surface", "#1C5052"),
    raised: get("--raised", "#265F61"),
    fog: get("--fog", "#F3F6F6"),
    mint: get("--accent", "#9BE3D6"),
    amber: get("--proof-amber", "#F5B041"),
  };
}
