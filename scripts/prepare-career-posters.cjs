const fs = require("node:fs");
const path = require("node:path");
const { createCareerParticles } = require("../src/lib/career-particles.ts");
const names = ["training", "setter", "va", "jobs"];
const binary = fs.readFileSync(
  "public/media/career-paths/brain-surface-v1.bin",
);
const bytes = binary.buffer.slice(
  binary.byteOffset,
  binary.byteOffset + binary.byteLength,
);
const sampleCount = new DataView(bytes).getUint32(4, true);
const data = createCareerParticles(
  3200,
  {
    positions: new Float32Array(bytes, 8, sampleCount * 3),
    normals: new Float32Array(bytes, 8 + sampleCount * 12, sampleCount * 3),
  },
  true,
);
const destination = path.resolve("public/media/career-paths");
fs.mkdirSync(destination, { recursive: true });
for (let shape = 0; shape < 4; shape++) {
  const particles = [];
  for (let i = 0; i < data.count; i++) {
    const at = i * 3,
      seed = i * 4;
    const p = data.targets[shape],
      a = shape === 3 ? 0.27 : -0.17 + shape * 0.21;
    const x = p[at] * Math.cos(a) + p[at + 2] * Math.sin(a),
      z = -p[at] * Math.sin(a) + p[at + 2] * Math.cos(a);
    const scale =
        shape === 3
          ? ((720 / (2 * Math.tan((21 * Math.PI) / 180))) * 0.96) / (4.3 - z)
          : 115 * 0.96 * (7.6 / (7.6 - z)),
      px = 360 + x * scale,
      py = 350 - p[at + 1] * scale;
    const outlined = data.seeds[seed + 2] > (shape === 3 ? 0.18 : 0.1),
      size =
        (1.2 + data.seeds[seed] * 2.3) *
        (shape === 3 ? data.teamStyle[at + 2] : 1);
    const angle = data.seeds[seed + 1] * Math.PI * 2;
    const points = Array.from({ length: 3 }, (_, v) => {
      const r = angle + (v * Math.PI * 2) / 3;
      return `${(px + Math.cos(r) * size).toFixed(2)},${(py + Math.sin(r) * size).toFixed(2)}`;
    }).join(" ");
    const normal = data.normals[shape];
    const light =
      0.2 +
      0.8 *
        Math.max(
          0,
          (-0.45 * normal[at] + 0.7 * normal[at + 1] + normal[at + 2]) / 1.3,
        );
    const brain = data.targets[0];
    const brainRegion =
      0.5 +
      0.5 * Math.sin(brain[at + 1] * 2.8 + brain[at] * 2 + brain[at + 2] * 1.2);
    const region = shape === 3 ? data.teamStyle[at] : brainRegion;
    const color =
      region > 0.79
        ? "#f3f6f6"
        : region > 0.53
          ? "#9be3d6"
          : region > 0.26
            ? shape === 3
              ? "#75b0cc"
              : "#579fc2"
            : "#20bfa8";
    particles.push({
      z,
      svg: `<polygon points="${points}" ${outlined ? `fill="none" stroke="${color}" stroke-width="${shape === 3 && data.teamStyle[at + 1] ? ".5" : ".8"}"` : `fill="${color}"`} opacity="${((0.4 + light * 0.5) * (shape === 3 && data.teamStyle[at + 1] ? 0.78 : 1)).toFixed(2)}"/>`,
    });
  }
  particles.sort((a, b) => a.z - b.z);
  fs.writeFileSync(
    path.join(destination, `${names[shape]}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720"><rect width="720" height="720" fill="#134143"/>${particles.map((p) => p.svg).join("")}</svg>`,
  );
}
console.log(
  "Four static fallback previews derived from the same seeded particle targets.",
);
