// Bake the existing Three.js RoomEnvironment once, preserving its HDR pixels.
const http = require("node:http"),
  fs = require("node:fs"),
  zlib = require("node:zlib");
const { chromium } = require("@playwright/test");
(async () => {
  const server = http.createServer((req, res) => {
    const paths = {
      "/three.js": "node_modules/three/build/three.module.js",
      "/three.core.js": "node_modules/three/build/three.core.js",
      "/room.js":
        "node_modules/three/examples/jsm/environments/RoomEnvironment.js",
    };
    if (paths[req.url]) {
      res.setHeader("Content-Type", "text/javascript");
      res.end(fs.readFileSync(paths[req.url]));
    } else
      res.end(
        '<script type="importmap">{"imports":{"three":"/three.js"}}</script>',
      );
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const b = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    const p = await b.newPage();
    await p.goto(`http://127.0.0.1:${server.address().port}`);
    const result = await p.evaluate(async () => {
      const THREE = await import("/three.js"),
        { RoomEnvironment } = await import("/room.js");
      const r = new THREE.WebGLRenderer(),
        pmrem = new THREE.PMREMGenerator(r),
        env = new RoomEnvironment();
      const target = pmrem.fromScene(env, 0.06, 0.1, 100, { size: 64 }),
        pixels = new Uint16Array(target.width * target.height * 4);
      await r.readRenderTargetPixelsAsync(
        target,
        0,
        0,
        target.width,
        target.height,
        pixels,
      );
      const bytes = new Uint8Array(pixels.buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192)
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      const out = {
        width: target.width,
        height: target.height,
        data: btoa(binary),
        nonzero: pixels.some((v) => v > 0),
      };
      target.dispose();
      env.dispose();
      pmrem.dispose();
      r.dispose();
      return out;
    });
    if (!result.nonzero) throw Error("Empty environment readback");
    const bytes = zlib.gzipSync(Buffer.from(result.data, "base64"), {
      level: 9,
    });
    fs.writeFileSync(
      "public/media/earnings-laptop/room-environment-v067.bin.gz",
      bytes,
    );
    fs.writeFileSync(
      "public/media/earnings-laptop/room-environment-v067.json",
      JSON.stringify(
        {
          width: result.width,
          height: result.height,
          type: "HalfFloatType",
          mapping: "CubeUVReflectionMapping",
          colorSpace: "LinearSRGBColorSpace",
          source: "Three.js RoomEnvironment, PMREM sigma 0.06",
          bytes: bytes.length,
        },
        null,
        2,
      ),
    );
    console.log({
      width: result.width,
      height: result.height,
      bytes: bytes.length,
    });
  } finally {
    await b.close();
    await new Promise((r) => server.close(r));
  }
})();
