export type TeamPoint = [number, number, number];

// One team hub and five distinct contributions. Links end at the node
// surfaces, so collaboration reads without an all-to-all knot at the centre.
export const teamNodes: readonly {
  position: TeamPoint;
  radius: number;
  tint: number;
}[] = [
  { position: [0, 0, 0.18], radius: 0.35, tint: 0.12 },
  { position: [0.02, 1.25, -0.22], radius: 0.22, tint: 0.91 },
  { position: [1.2, 0.42, 0.03], radius: 0.25, tint: 0.66 },
  { position: [0.72, -1.02, -0.1], radius: 0.23, tint: 0.39 },
  { position: [-0.92, -0.84, 0.18], radius: 0.24, tint: 0.66 },
  { position: [-1.18, 0.52, -0.04], radius: 0.22, tint: 0.39 },
];

export const teamLinks = [1, 2, 3, 4, 5] as const;
export const facesTeamCamera = (n: TeamPoint) =>
  -0.267 * n[0] - 0.06 * n[1] + 0.962 * n[2] >= 0;

export function sampleTeamLink(
  link: number,
  t: number,
  angle: number,
  frontOnly = false,
) {
  const hub = teamNodes[0],
    node = teamNodes[teamLinks[link]];
  const direction = unit(
    node.position.map((n, j) => n - hub.position[j]) as TeamPoint,
  );
  const from = hub.position.map((n, j) => n + direction[j] * hub.radius * 0.97);
  const to = node.position.map((n, j) => n - direction[j] * node.radius * 0.97);
  const center = from.map(
    (n, j) =>
      n * (1 - t) + to[j] * t + (j === 2 ? Math.sin(t * Math.PI) * 0.06 : 0),
  );
  const tangent = unit(
    to.map(
      (n, j) =>
        n - from[j] + (j === 2 ? Math.cos(t * Math.PI) * Math.PI * 0.06 : 0),
    ) as TeamPoint,
  );
  const normalAxis = unit(cross(tangent, [0, 0, 1]));
  const binormal = cross(tangent, normalAxis);
  let normal = normalAxis.map(
    (n, j) => n * Math.cos(angle) + binormal[j] * Math.sin(angle),
  ) as TeamPoint;
  if (frontOnly && !facesTeamCamera(normal))
    normal = normal.map((n) => -n) as TeamPoint;
  const radius = 0.027 * (0.8 + 0.2 * Math.sin(t * Math.PI));
  return {
    point: center.map((n, j) => n + normal[j] * radius) as TeamPoint,
    normal,
  };
}

type Point = TeamPoint;
type BrainSurface = { positions: Float32Array; normals: Float32Array };
type Curve = (t: number) => Point;
const unit = (p: Point): Point => {
  const length = Math.hypot(...p) || 1;
  return [p[0] / length, p[1] / length, p[2] / length];
};
const cross = (a: Point, b: Point): Point => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

// Sample a folded elliptical surface in the local frame of a continuous curve.
// A small interior layer adds depth without replacing the surface with a spray.
function surface(
  curve: Curve,
  t: number,
  angle: number,
  width: number,
  depth: number,
  twist: number,
  shell: number,
) {
  const center = curve(t),
    before = curve(t - 0.001),
    after = curve(t + 0.001);
  const tangent = unit(after.map((n, i) => n - before[i]) as Point);
  const n = unit(
    cross(tangent, Math.abs(tangent[2]) > 0.9 ? [0, 1, 0] : [0, 0, 1]),
  );
  const b = unit(cross(tangent, n));
  const c = Math.cos(angle),
    s = Math.sin(angle),
    ct = Math.cos(twist),
    st = Math.sin(twist);
  const normal = n.map((v, i) => v * ct + b[i] * st) as Point;
  const binormal = b.map((v, i) => v * ct - n[i] * st) as Point;
  return {
    point: center.map(
      (v, i) => v + shell * (normal[i] * c * width + binormal[i] * s * depth),
    ) as Point,
    normal: unit(
      normal.map(
        (v, i) => (v * c) / width + (binormal[i] * s) / depth,
      ) as Point,
    ),
  };
}

export function createCareerParticles(
  count: number,
  brain: BrainSurface,
  includePrograms = false,
) {
  let state = 76831;
  const random = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const targets = Array.from(
    { length: 4 },
    (_, i) =>
      new Float32Array(i === 0 || i === 3 || includePrograms ? count * 3 : 0),
  );
  const normals = targets.map((target) => new Float32Array(target.length));
  if (brain.positions.length < count * 3 || brain.normals.length < count * 3)
    throw Error("Brain surface has too few samples");
  targets[0].set(brain.positions.subarray(0, count * 3));
  normals[0].set(brain.normals.subarray(0, count * 3));
  const scatter = new Float32Array(count * 3),
    seeds = new Float32Array(count * 4),
    teamStyle = new Float32Array(count * 3);
  const put = (index: number, i: number, point: Point, normal: Point) => {
    targets[index].set(point, i * 3);
    normals[index].set(normal, i * 3);
  };
  for (let i = 0; i < count; i++) {
    const u = random(),
      v = random(),
      w = random(),
      r = random();
    const angle = v * Math.PI * 2;
    const shell = r < 0.16 ? 0.45 + w * 0.45 : 0.95 + w * 0.05;
    if (includePrograms) {
      const wave: Curve = (t) => [
        (t - 0.5) * 3.7,
        Math.sin(t * Math.PI * 2) * 0.7,
        Math.cos(t * Math.PI * 2) * 0.65,
      ];
      const communication = surface(wave, u, angle, 0.4, 0.22, u * 2.3, shell);
      put(1, i, communication.point, communication.normal);

      const a = (Math.floor(u * 6) * Math.PI) / 3,
        sy = w * 2 - 1,
        sr = Math.sqrt(1 - sy * sy);
      const radial: Point = [Math.cos(angle) * sr, sy, Math.sin(angle) * sr];
      put(
        2,
        i,
        [
          Math.cos(a) * 1.1 + radial[0] * 0.63,
          Math.sin(a) * 1.05 + radial[1] * 0.63,
          Math.sin(a * 2) * 0.4 + radial[2] * 0.63,
        ],
        radial,
      );
    }

    // Spend most of the budget on legible nodes, rather than thick beams.
    if (u < 0.82) {
      const selection = u / 0.82;
      const nodeIndex =
        selection < 0.27
          ? 0
          : 1 + Math.min(4, Math.floor(((selection - 0.27) / 0.73) * 5));
      const node = teamNodes[nodeIndex];
      let normal: Point = [
        Math.cos(angle) * Math.sqrt(1 - (w * 2 - 1) ** 2),
        w * 2 - 1,
        Math.sin(angle) * Math.sqrt(1 - (w * 2 - 1) ** 2),
      ];
      if (!facesTeamCamera(normal)) normal = normal.map((n) => -n) as Point;
      put(
        3,
        i,
        node.position.map((n, j) => n + normal[j] * node.radius) as Point,
        normal,
      );
      teamStyle.set([node.tint, 0, nodeIndex === 0 ? 0.78 : 0.67], i * 3);
    } else {
      const segment = ((u - 0.82) / 0.18) * teamLinks.length;
      const connected = sampleTeamLink(
        Math.min(teamLinks.length - 1, Math.floor(segment)),
        segment % 1,
        angle,
        true,
      );
      put(3, i, connected.point, connected.normal);
      teamStyle.set([0.66, 1, 0.46], i * 3);
    }

    const radius = 1.3 + random() * 2.2;
    scatter.set(
      [Math.cos(angle) * radius, (w - 0.5) * 4.6, Math.sin(angle) * radius],
      i * 3,
    );
    seeds.set(
      [random(), random(), random(), i % 157 === 0 ? 1 : random() * 0.8],
      i * 4,
    );
  }
  return { targets, normals, scatter, seeds, teamStyle, count };
}
