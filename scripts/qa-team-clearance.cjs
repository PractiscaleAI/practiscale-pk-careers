const {
  teamNodes,
  teamLinks,
  sampleTeamLink,
} = require("../src/lib/career-particles.ts");

// Protect the reported visual defect: a connecting beam must not run through
// an unrelated node, and the node silhouettes must remain clearly separate.
module.exports = async function teamClearance(width, height, distance) {
  const THREE = await import("three");
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 40);
  camera.position.z = distance;
  camera.updateMatrixWorld();
  const point = new THREE.Vector3();
  let nodeGap = Infinity,
    linkGap = Infinity;
  for (const yaw of [0.19, 0.27, 0.35]) {
    const rotation = new THREE.Euler(-0.06, yaw, 0.025);
    const project = (position) => {
      point
        .fromArray(position)
        .multiplyScalar(0.96)
        .applyEuler(rotation)
        .project(camera);
      return [((point.x + 1) * width) / 2, ((1 - point.y) * height) / 2];
    };
    const nodes = teamNodes.map((node) => {
      const center = project(node.position);
      let radius = 0;
      for (let axis = 0; axis < 3; axis++)
        for (const sign of [-1, 1]) {
          const position = [...node.position];
          position[axis] += (node.radius + 0.02) * sign;
          const edge = project(position);
          radius = Math.max(
            radius,
            Math.hypot(edge[0] - center[0], edge[1] - center[1]),
          );
        }
      return { center, radius };
    });
    for (let a = 0; a < nodes.length; a++)
      for (let b = a + 1; b < nodes.length; b++)
        nodeGap = Math.min(
          nodeGap,
          Math.hypot(
            nodes[a].center[0] - nodes[b].center[0],
            nodes[a].center[1] - nodes[b].center[1],
          ) -
            nodes[a].radius -
            nodes[b].radius,
        );
    teamLinks.forEach((target, link) => {
      for (let sample = 0; sample <= 32; sample++) {
        const t = sample / 32,
          a = sampleTeamLink(link, t, 0).point,
          b = sampleTeamLink(link, t, Math.PI).point;
        const center = project(a.map((n, j) => (n + b[j]) / 2));
        nodes.forEach((node, index) => {
          if (index === 0 || index === target) return;
          linkGap = Math.min(
            linkGap,
            Math.hypot(center[0] - node.center[0], center[1] - node.center[1]) -
              node.radius,
          );
        });
      }
    });
  }
  return { nodeGap, linkGap, nodes: teamNodes.length, links: teamLinks.length };
};
