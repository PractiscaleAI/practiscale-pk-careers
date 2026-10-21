const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const root = path.resolve(__dirname, "..");
const source = process.argv[2];
if (!source) throw new Error("Pass the generated-image source directory.");
const version = process.argv[3] || "v2";
if (!["v1", "v2"].includes(version)) throw new Error("Choose v1 or v2.");
const manifestPath = path.join(
  root,
  version === "v1"
    ? "docs/career-image-prompts.json"
    : "docs/career-image-prompts-v2.json",
);
const records = JSON.parse(fs.readFileSync(manifestPath, "utf8")).images;
(async () => {
  const out = path.join(root, "public/media/career-problems");
  fs.mkdirSync(out, { recursive: true });
  for (const { name, source: original } of records) {
    for (const width of [480, 960]) {
      const target = path.join(
        out,
        `${name}-${version}${width === 480 ? "-480" : ""}.webp`,
      );
      await sharp(path.join(source, path.basename(original)))
        .resize({ width })
        .webp({ quality: 85, effort: 6 })
        .toFile(target);
      console.log(path.relative(root, target), fs.statSync(target).size);
    }
  }
})();
