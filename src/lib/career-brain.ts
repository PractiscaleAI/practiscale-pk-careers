export type CareerBrain = {
  positions: Float32Array;
  normals: Float32Array;
  surface?: { positions: Float32Array; indices: Uint32Array };
};

let pending: Promise<CareerBrain> | undefined;
export function loadCareerBrain() {
  pending ??= Promise.all([
    fetch("/media/career-paths/brain-surface-v1.bin?view=frontal-1"),
    fetch("/media/career-paths/brain-depth-v1.bin.gz?view=frontal-1"),
  ])
    .then(async ([response, depthResponse]) => {
      if (!response.ok) throw new Error("Brain surface unavailable");
      const bytes = await response.arrayBuffer();
      const header = new DataView(bytes);
      if (bytes.byteLength < 8 || header.getUint32(0) !== 0x50534231)
        throw new Error("Invalid brain surface");
      const count = header.getUint32(4, true);
      if (count < 10000 || count > 20000 || bytes.byteLength !== 8 + count * 24)
        throw new Error("Invalid brain sample count");
      const positions = new Float32Array(bytes, 8, count * 3);
      const normals = new Float32Array(bytes, 8 + count * 12, count * 3);
      if (
        positions.some((n) => !Number.isFinite(n)) ||
        normals.some((n) => !Number.isFinite(n))
      )
        throw new Error("Invalid brain coordinates");
      if (!depthResponse.ok || !depthResponse.body)
        throw new Error("Brain depth surface unavailable");
      const mesh = await new Response(
        depthResponse.body.pipeThrough(new DecompressionStream("gzip")),
      ).arrayBuffer();
      const meshHeader = new DataView(mesh);
      if (mesh.byteLength < 12 || meshHeader.getUint32(0) !== 0x50534d31)
        throw new Error("Invalid brain depth surface");
      const vertices = meshHeader.getUint32(4, true);
      const faces = meshHeader.getUint32(8, true);
      if (
        vertices < 1000 ||
        vertices > 100000 ||
        faces < 1000 ||
        faces > 200000 ||
        mesh.byteLength !== 12 + vertices * 12 + faces * 12
      )
        throw new Error("Invalid brain depth dimensions");
      const surface = {
        positions: new Float32Array(mesh, 12, vertices * 3),
        indices: new Uint32Array(mesh, 12 + vertices * 12, faces * 3),
      };
      if (
        surface.positions.some((n) => !Number.isFinite(n)) ||
        surface.indices.some((n) => n >= vertices)
      )
        throw new Error("Invalid brain depth geometry");
      return { positions, normals, surface };
    })
    .catch((error) => {
      pending = undefined;
      throw error;
    });
  return pending;
}
