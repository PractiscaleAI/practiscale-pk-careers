import * as THREE from "three";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";
import { records, total, format, mix, range } from "./earnings-data.js";
import {
  digitRevealAt,
  recordMotionAt,
  numberPresentationAt,
} from "./number-cues.js?v=4";

export async function createLaptop(parent, onContextChange) {
  const canvas = document.createElement("canvas");
  canvas.className = "laptop-3d";
  canvas.setAttribute("aria-hidden", "true");
  parent.append(canvas);
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
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  const scene = new THREE.Scene();
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(environment, 0.06);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.48;
  environment.dispose();
  pmrem.dispose();
  const camera = new THREE.OrthographicCamera(-5, 5, 4, -4, 0.1, 60);
  const key = new THREE.DirectionalLight(0xf5fff9, 2.2);
  key.position.set(-3, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 0.1,
    far: 25,
  });
  key.shadow.normalBias = 0.015;
  key.shadow.bias = -0.0001;
  key.shadow.radius = 5;
  key.shadow.blurSamples = 10;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xa4dae6, 0.9);
  fill.position.set(5, 3, 7);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xd5eee9, 1.7);
  rim.position.set(0, 6, -5);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xeaf9f4, 0x123a3c, 0.7));
  const laptop = new THREE.Group();
  scene.add(laptop);
  const geometries = [],
    materials = [],
    textures = [],
    instanced = [];
  const geo = (g) => (geometries.push(g), g);
  const mat = (m) => (materials.push(m), m);
  const texture = (c) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.push(t);
    return t;
  };
  const metal = mat(
    new THREE.MeshStandardMaterial({
      color: 0x7c9291,
      roughness: 0.35,
      metalness: 0.82,
    }),
  );
  const edge = mat(
    new THREE.MeshStandardMaterial({
      color: 0x344c4e,
      roughness: 0.3,
      metalness: 0.85,
    }),
  );
  const black = mat(
    new THREE.MeshStandardMaterial({
      color: 0x071313,
      roughness: 0.56,
      metalness: 0.18,
    }),
  );
  const keysMaterial = mat(
    new THREE.MeshStandardMaterial({
      color: 0x040a0b,
      roughness: 0.65,
      metalness: 0,
      envMapIntensity: 0.18,
    }),
  );
  const trackMaterial = mat(
    new THREE.MeshStandardMaterial({
      color: 0x6a8584,
      roughness: 0.46,
      metalness: 0.72,
    }),
  );
  const rubber = mat(
    new THREE.MeshStandardMaterial({ color: 0x071213, roughness: 0.97 }),
  );
  function shape(w, h, r) {
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
  function slab(w, h, depth, radius, bevel = 0.025) {
    const g = new THREE.ExtrudeGeometry(
      shape(w - bevel * 2, h - bevel * 2, radius),
      {
        depth: Math.max(0.002, depth - bevel * 2),
        steps: 1,
        bevelEnabled: bevel > 0,
        bevelSegments: 3,
        bevelSize: bevel,
        bevelThickness: bevel,
        curveSegments: 10,
      },
    );
    g.translate(0, 0, -depth / 2 + bevel);
    return geo(g);
  }
  function mesh(g, m, parentGroup = laptop) {
    const object = new THREE.Mesh(g, m);
    object.castShadow = true;
    object.receiveShadow = true;
    parentGroup.add(object);
    return object;
  }
  function horizontal(w, d, t, radius, y, z, material) {
    const object = mesh(
      slab(w, d, t, radius, Math.min(0.025, t / 3)),
      material,
    );
    object.rotation.x = -Math.PI / 2;
    object.position.set(0, y, z);
    return object;
  }
  const ground = mesh(
    geo(new THREE.PlaneGeometry(40, 40)),
    mat(new THREE.ShadowMaterial({ color: 0x031b1c, opacity: 0.16 })),
    scene,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.085;
  ground.castShadow = false;
  horizontal(6.64, 4.45, 0.18, 0.18, 0.08, 0.03, edge);
  horizontal(6.6, 4.41, 0.105, 0.17, 0.175, 0.03, metal);
  horizontal(5.87, 2.16, 0.023, 0.1, 0.232, -0.64, black);
  horizontal(2.38, 1.12, 0.016, 0.1, 0.233, 1.3, edge);
  horizontal(2.33, 1.07, 0.018, 0.09, 0.245, 1.3, trackMaterial);
  // The front finger recess and hinge separate the lid from the base physically.
  horizontal(1.1, 0.09, 0.032, 0.035, 0.219, 2.205, black);
  const hinge = mesh(
    geo(new THREE.CylinderGeometry(0.105, 0.105, 5.8, 20)),
    edge,
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.285, -2.06);
  for (const x of [-2.8, 2.8]) {
    const foot = mesh(
      geo(new THREE.CylinderGeometry(0.16, 0.16, 0.07, 16)),
      rubber,
    );
    foot.position.set(x, -0.035, 1.65);
  }
  const rows = [
    [
      "esc",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "−",
      "=",
      "delete",
    ],
    ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
    ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "return"],
    ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
    ["fn", "ctrl", "opt", "cmd", "", "cmd", "opt", "←", "↑", "↓", "→"],
  ];
  const keyData = [];
  rows.forEach((labels, row) => {
    const weights = labels.map((label) =>
      label === ""
        ? 4.5
        : ["shift", "return"].includes(label)
          ? 1.65
          : ["tab", "caps", "delete"].includes(label)
            ? 1.35
            : 1,
    );
    const available = 5.62,
      gap = 0.042;
    const unit =
      (available - gap * (labels.length - 1)) /
      weights.reduce((a, b) => a + b, 0);
    let left = -available / 2;
    labels.forEach((label, i) => {
      const width = weights[i] * unit;
      keyData.push({ label, x: left + width / 2, z: -1.46 + row * 0.4, width });
      left += width + gap;
    });
  });
  const keyGeometry = slab(1, 0.33, 0.055, 0.045, 0.012);
  const keyboard = new THREE.InstancedMesh(
    keyGeometry,
    keysMaterial,
    keyData.length,
  );
  keyboard.castShadow = true;
  keyboard.receiveShadow = true;
  laptop.add(keyboard);
  instanced.push(keyboard);
  const transform = new THREE.Object3D();
  keyData.forEach((item, i) => {
    transform.position.set(item.x, 0.274, item.z);
    transform.rotation.set(-Math.PI / 2, 0, 0);
    transform.scale.set(item.width, 1, 1);
    transform.updateMatrix();
    keyboard.setMatrixAt(i, transform.matrix);
  });
  const legends = document.createElement("canvas");
  legends.width = 1600;
  legends.height = 600;
  const lc = legends.getContext("2d");
  lc.fillStyle = "#c9dbd8";
  lc.textAlign = "center";
  lc.textBaseline = "middle";
  keyData.forEach((item) => {
    lc.font = `${item.label.length > 2 ? 19 : 25}px Manrope`;
    lc.fillText(
      item.label,
      (item.x / 5.85 + 0.5) * 1600,
      ((item.z + 0.66) / 2.2 + 0.5) * 600,
    );
  });
  const legendsPlane = mesh(
    geo(new THREE.PlaneGeometry(5.85, 2.2)),
    mat(
      new THREE.MeshBasicMaterial({
        map: texture(legends),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    ),
  );
  legendsPlane.rotation.x = -Math.PI / 2;
  legendsPlane.position.set(0, 0.306, -0.66);
  legendsPlane.castShadow = false;
  // Small, actual speaker perforations sit outside the keyboard rather than floating in the scene.
  const perforationGeometry = geo(new THREE.CircleGeometry(0.009, 5));
  const speakers = new THREE.InstancedMesh(perforationGeometry, black, 240);
  laptop.add(speakers);
  instanced.push(speakers);
  let k = 0;
  for (const side of [-1, 1])
    for (let row = 0; row < 30; row++)
      for (let col = 0; col < 4; col++) {
        transform.position.set(
          side * (3.025 + col * 0.032),
          0.233,
          -1.52 + row * 0.061,
        );
        transform.rotation.set(-Math.PI / 2, 0, 0);
        transform.scale.setScalar(1);
        transform.updateMatrix();
        speakers.setMatrixAt(k++, transform.matrix);
      }
  const lid = new THREE.Group();
  lid.position.set(0, 0.335, -2.055);
  laptop.add(lid);
  const cover = mesh(slab(6.61, 4.28, 0.105, 0.17, 0.022), metal, lid);
  cover.position.y = 2.14;
  const bezel = mesh(slab(6.46, 4.13, 0.017, 0.125, 0.005), black, lid);
  bezel.position.set(0, 2.14, 0.061);
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 1920;
  screenCanvas.height = 1200;
  const sc = screenCanvas.getContext("2d", { alpha: false });
  const screenTexture = texture(screenCanvas);
  screenTexture.minFilter = THREE.LinearFilter;
  const screen = mesh(
    geo(new THREE.PlaneGeometry(6.14, 3.8375)),
    mat(new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false })),
    lid,
  );
  screen.position.set(0, 2.13, 0.075);
  screen.castShadow = false;
  screen.receiveShadow = false;
  const cameraDot = mesh(
    geo(new THREE.CircleGeometry(0.023, 16)),
    mat(
      new THREE.MeshStandardMaterial({
        color: 0x12333b,
        metalness: 0.7,
        roughness: 0.19,
      }),
    ),
    lid,
  );
  cameraDot.position.set(0, 4.157, 0.078);
  cameraDot.castShadow = false;
  const brandCanvas = document.createElement("canvas");
  brandCanvas.width = 1024;
  brandCanvas.height = 140;
  const bc = brandCanvas.getContext("2d");
  bc.textAlign = "center";
  bc.textBaseline = "middle";
  bc.fillStyle = "#c6d8d4";
  bc.font = "600 48px Sora";
  bc.fillText("PRACTISCALE", 512, 70);
  const backMark = mesh(
    geo(new THREE.PlaneGeometry(2.05, 0.28)),
    mat(
      new THREE.MeshBasicMaterial({
        map: texture(brandCanvas),
        transparent: true,
        opacity: 0.55,
        toneMapped: false,
      }),
    ),
    lid,
  );
  backMark.position.set(0, 2.22, -0.064);
  backMark.rotation.x = Math.PI;
  backMark.castShadow = false;
  const chinCanvas = document.createElement("canvas");
  chinCanvas.width = 1000;
  chinCanvas.height = 80;
  const cc = chinCanvas.getContext("2d");
  cc.font = "28px Manrope";
  cc.fillStyle = "#819794";
  cc.textAlign = "center";
  cc.fillText("PRACTISCALE", 500, 48);
  const chin = mesh(
    geo(new THREE.PlaneGeometry(1.4, 0.112)),
    mat(
      new THREE.MeshBasicMaterial({
        map: texture(chinCanvas),
        transparent: true,
        toneMapped: false,
      }),
    ),
    lid,
  );
  chin.position.set(0, 0.112, 0.077);
  chin.castShadow = false;

  function text(
    value,
    x,
    y,
    size,
    color = "#f3f6f6",
    font = "Sora",
    align = "left",
  ) {
    sc.font = `${font === "Sora" ? "600" : "400"} ${size}px ${font}`;
    sc.fillStyle = color;
    sc.textAlign = align;
    sc.fillText(value, x, y);
  }
  function drawScreen(state) {
    const { record, phase, showingRecords, summary, screen: power } = state;
    sc.fillStyle = "#0d3033";
    sc.fillRect(0, 0, 1920, 1200);
    const gradient = sc.createLinearGradient(0, 0, 1920, 1200);
    gradient.addColorStop(0, "#1c5052");
    gradient.addColorStop(0.7, "#10393c");
    gradient.addColorStop(1, "#0c2d31");
    sc.fillStyle = gradient;
    sc.fillRect(0, 0, 1920, 1200);
    sc.strokeStyle = "#9be3d62a";
    sc.lineWidth = 2;
    sc.beginPath();
    sc.moveTo(105, 165);
    sc.lineTo(1815, 165);
    sc.stroke();
    text("PractiScale / Earnings", 105, 105, 43, "#bdd3d3", "Mono");
    text(
      summary
        ? "10 / 10"
        : showingRecords
          ? `${String(record + 1).padStart(2, "0")} / 10`
          : "10 RECORDS",
      1815,
      105,
      43,
      "#bdd3d3",
      "Mono",
      "right",
    );
    if (summary) {
      const appear = state.staticMode ? 1 : range(state.p, 0.819, 0.839);
      sc.save();
      sc.globalAlpha = appear;
      sc.translate(0, (1 - appear) * 45);
      text("10 people. Real commissions.", 105, 345, 102);
      text("Combined total", 105, 463, 67, "#9be3d6", "Manrope");
      drawAmount(total, "Rs", "#f5b041");
      text("Different reporting periods.", 105, 1000, 75, "#bdd3d3", "Manrope");
      text(
        "The sum of the 10 individual amounts shown.",
        105,
        1100,
        51,
        "#bdd3d3",
        "Manrope",
      );
      sc.restore();
    } else if (showingRecords) {
      const data = records[record];
      const motion = recordMotionAt(phase);
      sc.save();
      sc.beginPath();
      sc.rect(0, 195, 1920, 1005);
      sc.clip();
      sc.translate(0, motion.y);
      sc.globalAlpha = motion.alpha;
      text(data.name, 105, 355, 116);
      text(data.role, 105, 472, 78, "#9be3d6", "Manrope");
      drawAmount(data.amount, "Rs", "#f3f6f6", phase);
      text(data.period, 105, 1050, 78, "#bdd3d3", "Manrope");
      sc.restore();
    } else {
      text("The people behind", 105, 430, 112);
      text("the numbers.", 105, 575, 112);
      text(
        "10 individual earnings records",
        105,
        1005,
        77,
        "#9be3d6",
        "Manrope",
      );
    }
    if (power < 1) {
      sc.fillStyle = `rgba(2,10,12,${1 - power})`;
      sc.fillRect(0, 0, 1920, 1200);
    }
    screenTexture.needsUpdate = true;
    canvas.dataset.screenText = summary
      ? `Combined total | Rs ${format(total)} | Different reporting periods`
      : showingRecords
        ? `${records[record].name} | Rs ${format(records[record].amount)} | ${records[record].period}`
        : "The people behind the numbers";
  }
  function drawAmount(amount, currency, color, phase = 1) {
    text(currency, 105, 828, 87, color, "Manrope");
    sc.font = "600 294px Sora";
    sc.textAlign = "left";
    let x = 258;
    for (const [i, char] of [...format(amount)].entries()) {
      const q = digitRevealAt(phase, i);
      sc.save();
      sc.beginPath();
      sc.rect(x - 3, 555, sc.measureText(char).width + 6, 340);
      sc.clip();
      sc.globalAlpha *= q;
      sc.fillStyle = color;
      sc.fillText(char, x, 835 + (1 - q) * 160);
      sc.restore();
      x += sc.measureText(char).width;
    }
  }
  let width = 1200,
    height = 800,
    portraitMode = false,
    compactMode = false,
    lastState = null,
    disposed = false,
    lost = false;
  const v = new THREE.Vector3();
  function projectedBounds(object, corners) {
    object.updateWorldMatrix(true, false);
    const points = corners.map(([x, y, z]) => {
      v.set(x, y, z).applyMatrix4(object.matrixWorld).project(camera);
      return { x: ((v.x + 1) * width) / 2, y: ((1 - v.y) * height) / 2 };
    });
    return {
      left: Math.min(...points.map((p) => p.x)),
      right: Math.max(...points.map((p) => p.x)),
      top: Math.min(...points.map((p) => p.y)),
      bottom: Math.max(...points.map((p) => p.y)),
    };
  }
  function render(state, force = false) {
    if (disposed || lost) return;
    if (
      !force &&
      lastState &&
      Math.abs(state.p - lastState.p) < 0.000005 &&
      state.staticMode === lastState.staticMode
    )
      return;
    lastState = { ...state };
    // Locked front view. Neither scroll nor cursor can introduce horizontal yaw.
    laptop.rotation.set(0, 0, 0);
    camera.position.set(0, mix(8.0, 6.8, state.open), 14);
    const target = new THREE.Vector3(0, mix(0.3, 2.0, state.open), 0);
    camera.lookAt(target);
    lid.rotation.x = mix(Math.PI / 2, -0.035, state.open);
    drawScreen(state);
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    // Fit the complete physical bounds, including the base, at every lid angle.
    // Centre by moving along the camera's vertical axis; X remains exactly zero.
    const box = new THREE.Box3().setFromObject(laptop);
    const corners = [];
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z]) corners.push([x, y, z]);
    const baseWidth = portraitMode ? 7.4 : 10.6;
    camera.left = -baseWidth / 2;
    camera.right = baseWidth / 2;
    camera.top = baseWidth / (width / height) / 2;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    let fitted = projectedBounds(laptop, corners);
    const fit = Math.max(
      1,
      (fitted.right - fitted.left) / (width * 0.89),
      (fitted.bottom - fitted.top) / (height * (compactMode ? 0.65 : 0.79)),
    );
    camera.left *= fit;
    camera.right *= fit;
    camera.top *= fit;
    camera.bottom *= fit;
    camera.updateProjectionMatrix();
    fitted = projectedBounds(laptop, corners);
    const vertical =
      ((height / 2 - (fitted.top + fitted.bottom) / 2) / height) *
      (camera.top - camera.bottom);
    const up = new THREE.Vector3(0, 1, 0)
      .applyQuaternion(camera.quaternion)
      .multiplyScalar(vertical);
    camera.position.add(up);
    target.add(up);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    const renderedAt = performance.now();
    const number = numberPresentationAt(state);
    canvas.dataset.numberKey = number?.key ?? "";
    canvas.dataset.renderedAt = renderedAt.toFixed(3);
    canvas.dataset.frontYaw = "0";
    canvas.dataset.lidOpen = state.open.toFixed(4);
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.modelBounds = JSON.stringify(
      projectedBounds(laptop, corners),
    );
    canvas.dataset.screenBounds = JSON.stringify(
      projectedBounds(screen, [
        [-3.07, -1.91875, 0],
        [3.07, -1.91875, 0],
        [3.07, 1.91875, 0],
        [-3.07, 1.91875, 0],
      ]),
    );
    canvas.dataset.record = String(state.showingRecords ? state.record : -1);
    return { renderedAt, number };
  }
  function resize(portrait, compact = false) {
    portraitMode = portrait;
    compactMode = compact;
    width = portrait ? 620 : 1200;
    height = portrait ? 900 : 800;
    renderer.setSize(width, height, false);
    const frustumWidth = portrait ? 7.4 : 10.6,
      aspect = width / height;
    camera.left = -frustumWidth / 2;
    camera.right = frustumWidth / 2;
    camera.top = frustumWidth / aspect / 2;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    if (lastState) render(lastState, true);
  }
  const onLost = (event) => {
    event.preventDefault();
    lost = true;
    onContextChange(false);
  };
  const onRestored = () => {
    lost = false;
    screenTexture.needsUpdate = true;
    onContextChange(true);
    if (lastState) render(lastState, true);
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  resize(false);
  await renderer.compileAsync(scene, camera);
  return {
    canvas,
    render,
    resize,
    dispose() {
      disposed = true;
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      for (const i of instanced) i.dispose();
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
      envTarget.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
