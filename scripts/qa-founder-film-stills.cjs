// Review representative frames from the approved founder films before selecting posters.
const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const out =
    process.argv[2] || path.join(process.cwd(), "tmp", "founder-stills");
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded" });
  for (const [name, src, marks] of [
    [
      "desktop",
      "/media/founder/ceo-story-desktop-v062.mp4",
      [0.2, 2, 5, 10, 18, 30, 45, 65],
    ],
    [
      "portrait",
      "/media/founder/ceo-story-portrait-v062.mp4",
      [0.2, 2, 5, 10, 18, 30, 45, 65],
    ],
  ]) {
    const frames = await page.evaluate(
      async ({ src, marks }) => {
        const video = document.createElement("video");
        video.src = src;
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.style.display = "none";
        document.body.append(video);
        await new Promise((resolve, reject) => {
          video.addEventListener("loadedmetadata", resolve, { once: true });
          video.addEventListener(
            "error",
            () => reject(new Error("Video load failed")),
            { once: true },
          );
          video.load();
        });
        const result = [];
        for (const seconds of marks) {
          video.currentTime = Math.min(
            seconds,
            Math.max(0, video.duration - 0.1),
          );
          await new Promise((resolve) =>
            video.addEventListener("seeked", resolve, { once: true }),
          );
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d").drawImage(video, 0, 0);
          result.push({
            seconds,
            width: canvas.width,
            height: canvas.height,
            data: canvas.toDataURL("image/png"),
          });
        }
        video.remove();
        return result;
      },
      { src, marks },
    );
    const thumbs = [];
    for (const frame of frames) {
      const raw = Buffer.from(frame.data.split(",")[1], "base64");
      const file = path.join(
        out,
        `${name}-${String(frame.seconds).replace(".", "_")}.png`,
      );
      await fs.writeFile(file, raw);
      const thumb = await sharp(raw)
        .resize({ width: name === "desktop" ? 400 : 180 })
        .png()
        .toBuffer();
      thumbs.push(thumb);
      console.log(
        `${name} ${frame.seconds}s ${frame.width}x${frame.height} ${file}`,
      );
    }
    const meta = await Promise.all(
      thumbs.map((buffer) => sharp(buffer).metadata()),
    );
    const pad = 18;
    const cellW = Math.max(...meta.map((m) => m.width)) + pad;
    const cellH = Math.max(...meta.map((m) => m.height)) + pad;
    const columns = name === "desktop" ? 2 : 4;
    const sheet = sharp({
      create: {
        width: cellW * columns,
        height: cellH * Math.ceil(thumbs.length / columns),
        channels: 4,
        background: "#143e40",
      },
    });
    await sheet
      .composite(
        thumbs.map((input, i) => ({
          input,
          left: (i % columns) * cellW + pad / 2,
          top: Math.floor(i / columns) * cellH + pad / 2,
        })),
      )
      .png()
      .toFile(path.join(out, `${name}-contact.png`));
    const selected = Buffer.from(
      frames.find((frame) => frame.seconds === 5).data.split(",")[1],
      "base64",
    );
    const poster =
      name === "portrait"
        ? sharp(selected)
            .extract({ left: 67, top: 120, width: 405, height: 720 })
            .resize(540, 960)
        : sharp(selected);
    const mediaBase = path.join(
      process.cwd(),
      "public",
      "media",
      "founder",
      `founder-film-still-${name}-v1`,
    );
    await poster
      .clone()
      .webp({ quality: 84, effort: 6 })
      .toFile(`${mediaBase}.webp`);
    await poster
      .clone()
      .avif({ quality: 68, effort: 7 })
      .toFile(`${mediaBase}.avif`);
    console.log(`Selected authentic ${name} poster: ${mediaBase}.{webp,avif}`);
  }
  await browser.close();
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
