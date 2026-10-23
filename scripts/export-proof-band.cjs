const { chromium } = require("@playwright/test");
const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const out =
  process.env.PROOF_RENDER_DIR || path.join(root, ".next/proof-render");
const media = path.join(root, "public/media/proof-band");
const laptopMedia = path.join(root, "public/media/earnings-laptop");
const mode = process.argv[2] || "styles";
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const writeData = async (file, data) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(data.split(",")[1], "base64"));
};
const run = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, args, {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
    });
    let error = "";
    child.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => (code ? reject(Error(error)) : resolve(error)));
  });

(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: [
      "--autoplay-policy=user-gesture-required",
      "--disable-background-timer-throttling",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  try {
    await page.goto("http://127.0.0.1:3000/proof-render", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForFunction(
      () => window.__proofExport || window.__proofExportError,
      { timeout: 120000 },
    );
    const initError = await page.evaluate(() => window.__proofExportError);
    if (initError) throw Error(initError);
    if (mode === "styles") {
      const keys = [
        ["initial", 0],
        ["healthcare", 0.26],
        ["team", 0.44],
        ["portal", 0.62],
        ["publications", 0.8],
        ["final", 1],
      ];
      for (const [name, p] of keys) {
        await writeData(
          path.join(out, `style-${name}.png`),
          await page.evaluate(
            ({ p }) => window.__proofExport.frame(p, "desktop"),
            { p },
          ),
        );
        console.log(`Style frame: ${name}`);
      }
      await writeData(
        path.join(out, "style-mobile-final.png"),
        await page.evaluate(() => window.__proofExport.frame(1, "mobile")),
      );
      for (const variant of ["desktop", "mobile"]) {
        await writeData(
          path.join(media, `${variant}-final.webp`),
          await page.evaluate((v) => window.__proofExport.poster(v), variant),
        );
        await writeData(
          path.join(laptopMedia, `${variant}-summary.webp`),
          await page.evaluate(
            (v) => window.__proofExport.laptopPoster(v),
            variant,
          ),
        );
      }
      const repeated = await page.evaluate(() => {
        const first = window.__proofExport.frame(0.44, "desktop");
        window.__proofExport.frame(0.8, "desktop");
        window.__proofExport.frame(0.1, "desktop");
        return first === window.__proofExport.frame(0.44, "desktop");
      });
      await fs.writeFile(
        path.join(out, "style-diagnostics.json"),
        JSON.stringify(
          {
            info: await page.evaluate(() => window.__proofExport.info()),
            deterministicReverse: repeated,
            errors,
          },
          null,
          2,
        ),
      );
      console.log(JSON.stringify({ deterministicReverse: repeated, errors }));
    } else {
      for (const variant of ["desktop", "mobile"]) {
        const frames = path.join(out, variant);
        await fs.mkdir(frames, { recursive: true });
        const started = Date.now();
        for (let i = 0; i < 192; i++) {
          await writeData(
            path.join(frames, `${String(i).padStart(4, "0")}.png`),
            await page.evaluate(
              ({ p, variant }) => window.__proofExport.frame(p, variant),
              { p: i / 191, variant },
            ),
          );
          if (i % 24 === 0) console.log(`${variant}: ${i + 1}/192 frames`);
        }
        await run([
          "-hide_banner",
          "-loglevel",
          "error",
          "-y",
          "-framerate",
          "24",
          "-i",
          path.join(frames, "%04d.png"),
          "-c:v",
          "libx264",
          "-preset",
          "slow",
          "-crf",
          "17",
          "-pix_fmt",
          "yuv420p",
          "-an",
          "-movflags",
          "+faststart",
          path.join(media, `practiscale-proof-${variant}.mp4`),
        ]);
        console.log(
          `${variant}: MP4 complete in ${((Date.now() - started) / 1000).toFixed(1)}s`,
        );
      }
      await fs.writeFile(
        path.join(out, "export-diagnostics.json"),
        JSON.stringify(
          {
            info: await page.evaluate(() => window.__proofExport.info()),
            errors,
          },
          null,
          2,
        ),
      );
    }
    if (errors.length) throw Error(errors.join("\n"));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
