const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");
const source = path.resolve(
  process.argv[2] || "scripts/assets/career-brain/BrainMesh_ICBM152.mz3",
);
const compressed = fs.readFileSync(source);
const bytes =
  compressed.readUInt16LE(0) === 0x8b1f
    ? zlib.gunzipSync(compressed)
    : compressed;
if (bytes.readUInt16LE(0) !== 0x5a4d || (bytes.readUInt16LE(2) & 3) !== 3)
  throw Error("Unsupported brain surface");
const faces = bytes.readUInt32LE(4),
  vertices = bytes.readUInt32LE(8),
  skip = bytes.readUInt32LE(12);
const faceOffset = 16 + skip,
  vertexOffset = faceOffset + faces * 12;
if (
  vertices < 1000 ||
  faces < 1000 ||
  vertexOffset + vertices * 12 > bytes.length
)
  throw Error("Invalid brain mesh dimensions");
const points = new Float64Array(vertices * 3),
  normals = new Float64Array(vertices * 3);
const bounds = {
  min: [Infinity, Infinity, Infinity],
  max: [-Infinity, -Infinity, -Infinity],
};
for (let i = 0; i < vertices; i++) {
  const x = bytes.readFloatLE(vertexOffset + i * 12),
    y = bytes.readFloatLE(vertexOffset + i * 12 + 4),
    z = bytes.readFloatLE(vertexOffset + i * 12 + 8);
  const p = [x, z, -y];
  p.forEach((n, j) => {
    points[i * 3 + j] = n;
    bounds.min[j] = Math.min(bounds.min[j], n);
    bounds.max[j] = Math.max(bounds.max[j], n);
  });
}
const center = bounds.min.map((n, j) => (n + bounds.max[j]) / 2);
const scale = 3.2 / Math.max(...bounds.max.map((n, j) => n - bounds.min[j]));
const cx = Math.cos(0.28),
  sx = Math.sin(0.28),
  cy = Math.cos(0.33),
  sy = Math.sin(0.33);
for (let i = 0; i < vertices; i++) {
  const x = (points[i * 3] - center[0]) * scale,
    y = (points[i * 3 + 1] - center[1]) * scale,
    z = (points[i * 3 + 2] - center[2]) * scale;
  const yy = y * cx - z * sx,
    zz = y * sx + z * cx;
  points.set([x * cy + zz * sy, yy, -x * sy + zz * cy], i * 3);
}
const indices = new Uint32Array(faces * 3),
  cdf = new Float64Array(faces);
let area = 0;
for (let face = 0; face < faces; face++) {
  const ids = [0, 1, 2].map((j) =>
    bytes.readUInt32LE(faceOffset + face * 12 + j * 4),
  );
  if (ids.some((i) => i >= vertices)) throw Error("Bad mesh index");
  indices.set(ids, face * 3);
  const [a, b, c] = ids.map((i) => [
    points[i * 3],
    points[i * 3 + 1],
    points[i * 3 + 2],
  ]);
  const u = b.map((n, j) => n - a[j]),
    v = c.map((n, j) => n - a[j]);
  const n = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  area += Math.hypot(...n) / 2;
  cdf[face] = area;
  ids.forEach((i) => n.forEach((v, j) => (normals[i * 3 + j] += v)));
}
for (let i = 0; i < vertices; i++) {
  const length =
    Math.hypot(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]) || 1;
  for (let j = 0; j < 3; j++) normals[i * 3 + j] /= length;
}
let seed = 89271;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const count = 10000,
  positions = new Float32Array(count * 3),
  sampleNormals = new Float32Array(count * 3);
// Concentrate the particle budget on the cortex that is visible in the
// reference-facing bilateral pose. Hidden inner/rear surfaces are not decorative
// confetti. The full mesh remains available for parallax depth occlusion.
const size = 768,
  depth = new Float32Array(size * size);
const view = new Float64Array(vertices * 3);
const project = (x, y, z) => {
  // Same XYZ Euler transform as the runtime hold, with zero roll.
  const xx = x * Math.cos(-0.27) + z * Math.sin(-0.27);
  const zz = -x * Math.sin(-0.27) + z * Math.cos(-0.27);
  const yy = y * Math.cos(-0.06) - zz * Math.sin(-0.06);
  const zzz = y * Math.sin(-0.06) + zz * Math.cos(-0.06);
  const inverse = 1 / (6 - zzz);
  return [size * (0.5 + xx * inverse), size * (0.5 - yy * inverse), inverse];
};
for (let i = 0; i < vertices; i++)
  view.set(project(points[i * 3], points[i * 3 + 1], points[i * 3 + 2]), i * 3);
for (let face = 0; face < faces; face++) {
  const a = indices[face * 3] * 3,
    b = indices[face * 3 + 1] * 3,
    c = indices[face * 3 + 2] * 3;
  const ax = view[a],
    ay = view[a + 1],
    bx = view[b],
    by = view[b + 1],
    cx = view[c],
    cy = view[c + 1];
  const denominator = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  if (Math.abs(denominator) < 1e-10) continue;
  const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx))),
    maxX = Math.min(size - 1, Math.ceil(Math.max(ax, bx, cx)));
  const minY = Math.max(0, Math.floor(Math.min(ay, by, cy))),
    maxY = Math.min(size - 1, Math.ceil(Math.max(ay, by, cy)));
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      const u =
        ((by - cy) * (x + 0.5 - cx) + (cx - bx) * (y + 0.5 - cy)) / denominator;
      const v =
        ((cy - ay) * (x + 0.5 - cx) + (ax - cx) * (y + 0.5 - cy)) / denominator;
      if (u < 0 || v < 0 || u + v > 1) continue;
      depth[y * size + x] = Math.max(
        depth[y * size + x],
        u * view[a + 2] + v * view[b + 2] + (1 - u - v) * view[c + 2],
      );
    }
}
let attempts = 0;
for (let i = 0; i < count;) {
  if (++attempts > 1000000) throw Error("Unable to sample visible cortex");
  const target = random() * area;
  let lo = 0,
    hi = faces - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cdf[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const r = Math.sqrt(random()),
    v = random(),
    weights = [1 - r, r * (1 - v), r * v];
  const ids = [indices[lo * 3], indices[lo * 3 + 1], indices[lo * 3 + 2]];
  for (let j = 0; j < 3; j++) {
    positions[i * 3 + j] = ids.reduce(
      (sum, id, k) => sum + points[id * 3 + j] * weights[k],
      0,
    );
    sampleNormals[i * 3 + j] = ids.reduce(
      (sum, id, k) => sum + normals[id * 3 + j] * weights[k],
      0,
    );
  }
  const length =
    Math.hypot(
      sampleNormals[i * 3],
      sampleNormals[i * 3 + 1],
      sampleNormals[i * 3 + 2],
    ) || 1;
  for (let j = 0; j < 3; j++) sampleNormals[i * 3 + j] /= length;
  const p = project(
    positions[i * 3],
    positions[i * 3 + 1],
    positions[i * 3 + 2],
  );
  const pixel = Math.floor(p[1]) * size + Math.floor(p[0]);
  if (depth[pixel] - p[2] < 0.0009) i++;
}
if ([...positions, ...sampleNormals].some((n) => !Number.isFinite(n)))
  throw Error("Invalid sampled surface");
const output = Buffer.alloc(8 + count * 24);
output.write("PSB1");
output.writeUInt32LE(count, 4);
Buffer.from(positions.buffer).copy(output, 8);
Buffer.from(sampleNormals.buffer).copy(output, 8 + count * 12);
const destination = path.resolve(
  "public/media/career-paths/brain-surface-v1.bin",
);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, output);
// Preserve the actual cortex for depth occlusion and the quiet shaded
// foundation beneath the particles. Both treatments use this same mesh.
const mesh = Buffer.alloc(12 + points.length * 4 + indices.length * 4);
mesh.write("PSM1");
mesh.writeUInt32LE(vertices, 4);
mesh.writeUInt32LE(faces, 8);
Buffer.from(Float32Array.from(points).buffer).copy(mesh, 12);
Buffer.from(indices.buffer).copy(mesh, 12 + points.length * 4);
const depthMesh = zlib.gzipSync(mesh, { level: 9 });
fs.writeFileSync("public/media/career-paths/brain-depth-v1.bin.gz", depthMesh);
const hash = (b) => crypto.createHash("sha256").update(b).digest("hex");
const provenance = {
  source:
    "https://github.com/neurolabusc/surf-ice/blob/master/BrainNet/BrainMesh_ICBM152.mz3",
  sourceSha256: hash(compressed),
  sourceVertices: vertices,
  sourceFaces: faces,
  count,
  seed: 89271,
  method:
    "Area-weighted barycentric sampling of the actual cortex, visibility-filtered in the reference-facing bilateral pose, with interpolated normals. Centered and uniformly scaled with one rigid orientation transform. No ellipsoid approximation.",
  pose: {
    sourceRotationRadians: { x: 0.28, y: 0.33 },
    runtimeHoldRadians: { x: -0.06, y: -0.27 },
    description:
      "Near frontal, slight downward view, both hemispheres and central fissure visible.",
  },
  output: "/media/career-paths/brain-surface-v1.bin",
  bytes: output.length,
  sha256: hash(output),
  depthMesh: {
    output: "/media/career-paths/brain-depth-v1.bin.gz",
    bytes: depthMesh.length,
    sha256: hash(depthMesh),
    purpose:
      "Original cortex geometry for depth occlusion and quiet surface shading.",
  },
  notices: "/media/career-paths/THIRD-PARTY-NOTICES.txt",
};
fs.writeFileSync(
  "docs/career-brain-provenance.json",
  JSON.stringify(provenance, null, 2),
);
console.log(JSON.stringify(provenance, null, 2));
