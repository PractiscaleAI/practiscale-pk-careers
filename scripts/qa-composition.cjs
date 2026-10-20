const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  });
  const report = { checks: [], errors: [], framesInSilhouetteEnvelope: 0 };
  const check = (name, pass, detail) =>
    report.checks.push({ name, pass, detail });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    await page.goto("http://127.0.0.1:3000/", {
      waitUntil: "domcontentloaded",
    });
    await dismissIntroduction(page);
    const envelope = await page.evaluate(async () => {
      const m = await fetch("/media/hero-manifest.json").then((r) => r.json());
      let width = 0,
        height = 0,
        left = [],
        right = [];
      const canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d", { willReadFrequently: true });
      for (const url of m.desktop) {
        const response = await fetch(url);
        if (!response.ok) throw Error("Missing source frame");
        const bitmap = await createImageBitmap(await response.blob());
        if (!width) {
          width = bitmap.width;
          height = bitmap.height;
          canvas.width = width;
          canvas.height = height;
          left = Array(height).fill(width);
          right = Array(height).fill(-1);
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        const data = ctx.getImageData(0, 0, width, height).data;
        for (let y = 0; y < height; y++) {
          let a = 0,
            b = width - 1;
          while (a < width && data[(y * width + a) * 4 + 3] < 64) a++;
          while (b >= 0 && data[(y * width + b) * 4 + 3] < 64) b--;
          left[y] = Math.min(left[y], a);
          right[y] = Math.max(right[y], b);
        }
      }
      return { width, height, left, right, count: m.desktop.length };
    });
    report.framesInSilhouetteEnvelope = envelope.count;
    check(
      "Visible silhouette checked across every source frame",
      envelope.count > 1,
      { count: envelope.count },
    );
    const sourceHeadRows = envelope.left
      .map((v, y) => ({ x: v, y, right: envelope.right[y] }))
      .filter((r) => r.y < envelope.height * 0.4 && r.right >= r.x);
    const head = {
      left: Math.min(...sourceHeadRows.map((r) => r.x)),
      right: Math.max(...sourceHeadRows.map((r) => r.right)),
      top: Math.min(...sourceHeadRows.map((r) => r.y)),
      bottom: Math.max(...sourceHeadRows.map((r) => r.y)),
    };
    for (const [w, h] of [
      [320, 568],
      [375, 900],
      [430, 932],
      [530, 900],
      [768, 1024],
      [1024, 768],
      [1192, 720],
      [1280, 720],
      [1440, 900],
      [1920, 1080],
    ]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(250);
      await page.evaluate(() => document.fonts.ready);
      const g = await page.evaluate(() => {
        const box = (s) => {
          const r = document.querySelector(s).getBoundingClientRect();
          return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
          };
        };
        const lines = (selector) => {
          const root = document.querySelector(selector),
            walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT),
            rows = [];
          let node;
          while ((node = walker.nextNode())) {
            const re = /\S+/g;
            let match;
            while ((match = re.exec(node.textContent))) {
              const range = document.createRange();
              range.setStart(node, match.index);
              range.setEnd(node, match.index + match[0].length);
              const r = range.getBoundingClientRect();
              if (!r.width) continue;
              let row = rows.find((row) => Math.abs(row.top - r.top) < 3);
              if (!row) {
                row = { top: r.top, left: r.left, right: r.right, words: [] };
                rows.push(row);
              }
              row.left = Math.min(row.left, r.left);
              row.right = Math.max(row.right, r.right);
              row.words.push(match[0]);
            }
          }
          return rows.sort((a, b) => a.top - b.top);
        };
        return {
          stage: box(".hero-stage"),
          portrait: box(".hero-portrait"),
          cards: box(".hero-trust"),
          copy: box(".hero-copy"),
          paragraph: box(".hero-copy p"),
          aside: box(".hero-aside"),
          divider: box(".hero-topline"),
          action: box(".hero-copy .action"),
          headingLines: lines(".hero-copy h1"),
          paragraphLines: lines(".hero-copy p"),
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      check(`No horizontal overflow ${w}x${h}`, !g.overflow);
      const projectedHead = {
        left: g.portrait.left + (head.left / envelope.width) * g.portrait.width,
        right:
          g.portrait.left + (head.right / envelope.width) * g.portrait.width,
        top: g.portrait.top + (head.top / envelope.height) * g.portrait.height,
        bottom:
          g.portrait.top + (head.bottom / envelope.height) * g.portrait.height,
      };
      check(
        `Full head stays inside hero ${w}x${h}`,
        projectedHead.left >= g.stage.left + 8 &&
          projectedHead.right <= g.stage.right - 8,
        { head: projectedHead, stage: g.stage },
      );
      if (w >= 768) {
        const y0 = Math.max(
          0,
          Math.floor(
            ((g.cards.top - g.portrait.top) / g.portrait.height) *
              envelope.height,
          ),
        );
        const y1 = Math.min(
          envelope.height - 1,
          Math.ceil(
            ((g.cards.bottom - g.portrait.top) / g.portrait.height) *
              envelope.height,
          ),
        );
        let minGap = Infinity;
        for (let y = y0; y <= y1; y++)
          if (envelope.right[y] >= envelope.left[y])
            minGap = Math.min(
              minGap,
              g.portrait.left +
                (envelope.left[y] / envelope.width) * g.portrait.width -
                g.cards.right,
            );
        check(
          `Cards clear every visible portrait frame ${w}x${h}`,
          minGap >= 16,
          { minimumGapPx: Math.round(minGap * 10) / 10, requiredGapPx: 16 },
        );
        const intersects = (a, b) =>
          a.left < b.right &&
          a.right > b.left &&
          a.top < b.bottom &&
          a.bottom > b.top;
        check(
          `Head clear of supporting copy ${w}x${h}`,
          !intersects(projectedHead, g.aside),
          { head: projectedHead, aside: g.aside },
        );
      } else {
        check(
          `Phone paragraph uses its available column ${w}x${h}`,
          g.paragraph.width >= g.copy.width * 0.96,
          { paragraph: g.paragraph.width, available: g.copy.width },
        );
        check(
          `Phone paragraph avoids a lone final word ${w}x${h}`,
          g.paragraphLines.length < 2 ||
            g.paragraphLines.at(-1).words.length >= 2,
          g.paragraphLines.map((l) => l.words.join(" ")),
        );
        check(
          `Phone heading remains two lines ${w}x${h}`,
          g.headingLines.length === 2,
          g.headingLines.map((l) => l.words.join(" ")),
        );
        const ink =
          Math.max(...g.headingLines.map((l) => l.right - l.left)) /
          g.copy.width;
        check(
          `Phone heading has balanced visual width ${w}x${h}`,
          ink >= 0.65,
          { widestLineFraction: ink },
        );
        check(
          `Phone face clears reading/action area ${w}x${h}`,
          projectedHead.top >= g.action.bottom + 16 &&
            projectedHead.bottom <= g.cards.top - 16,
          {
            head: projectedHead,
            actionBottom: g.action.bottom,
            cardTop: g.cards.top,
          },
        );
      }
    }
    await context.close();
    check("No runtime errors", !report.errors.length, report.errors);
  } catch (e) {
    report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    if (report.checks.some((c) => !c.pass)) process.exitCode = 1;
    fs.writeFileSync(
      "docs/composition-qa.json",
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify(
        {
          checks: report.checks.length,
          failed: report.checks.filter((c) => !c.pass),
          errors: report.errors,
          failure: report.failure,
        },
        null,
        2,
      ),
    );
    await browser.close();
  }
})();
