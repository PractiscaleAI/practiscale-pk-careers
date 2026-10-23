const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");

(async () => {
  const report = { checks: [], errors: [], viewports: [] };
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (!pass) console.error(name, JSON.stringify(detail));
  };
  const dir = "docs/qa/typography";
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: [
      "--no-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    await page.goto("http://127.0.0.1:3000/", {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await dismissIntroduction(page);
    await page.evaluate(() => document.fonts.ready);
    for (const [width, height] of [
      [1440, 900],
      [1920, 1080],
      [1536, 696],
      [1192, 768],
      [1024, 900],
      [768, 1024],
      [530, 900],
      [443, 646],
      [430, 932],
      [375, 812],
      [375, 667],
      [320, 568],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(600);
      const m = await page.evaluate(() => {
        const type = (el) => {
          const s = getComputedStyle(el);
          return {
            family: s.fontFamily,
            size: parseFloat(s.fontSize),
            line: parseFloat(s.lineHeight),
            tracking: s.letterSpacing,
            weight: s.fontWeight,
          };
        };
        const all = (selector) => [...document.querySelectorAll(selector)];
        // Measure text without the fan's rotation or a card's offscreen transform.
        const lineWords = (el) => {
          const clone = el.cloneNode(true),
            s = getComputedStyle(el);
          for (const prop of s)
            clone.style.setProperty(prop, s.getPropertyValue(prop));
          Object.assign(clone.style, {
            position: "absolute",
            top: "0",
            left: "-10000px",
            width: `${parseFloat(s.width) || el.getBoundingClientRect().width}px`,
            height: "auto",
            padding: "0",
            margin: "0",
            transform: "none",
            visibility: "hidden",
            maxWidth: "none",
          });
          document.body.append(clone);
          const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT),
            lines = new Map();
          while (walker.nextNode()) {
            const text = walker.currentNode;
            for (const match of text.textContent.matchAll(/\S+/g)) {
              const r = document.createRange();
              r.setStart(text, match.index);
              r.setEnd(text, match.index + match[0].length);
              const y = Math.round(r.getBoundingClientRect().top),
                row = lines.get(y) || [];
              row.push(match[0]);
              lines.set(y, row);
            }
          }
          clone.remove();
          return [...lines.values()];
        };
        const headings = all(
          "#problem-heading,#career-heading,#proof-heading",
        ).map((el) => ({
          ...type(el),
          id: el.id,
          before:
            parseFloat(getComputedStyle(el).marginTop) ||
            parseFloat(
              getComputedStyle(el.previousElementSibling).marginBottom,
            ),
          after:
            el.id === "proof-heading"
              ? parseFloat(getComputedStyle(el.nextElementSibling).marginTop)
              : parseFloat(getComputedStyle(el.parentElement).marginBottom),
        }));
        const cardTitles = all(
          "[data-problem-copy] h3,[data-career-text] h3",
        ).map(type);
        const bodies = all(
          ".hero-copy>p,[data-problem-copy]>p,[data-career-text] [data-career-group]:nth-child(2)>p,[data-laptop-copy]>p:not(.eyebrow):not([data-laptop-note])",
        ).map((el) => ({
          ...type(el),
          text: el.textContent,
          lines: lineWords(el),
          overflow: el.scrollWidth > el.clientWidth + 1,
        }));
        const actions = all("main .action").map((el) => {
          const s = getComputedStyle(el);
          const range = document.createRange();
          range.selectNodeContents(el.firstElementChild);
          const labelLines = new Set(
            [...range.getClientRects()].map((rect) => Math.round(rect.y)),
          ).size;
          return {
            ...type(el),
            height: el.offsetHeight,
            radius: parseFloat(s.borderRadius),
            overflow: el.scrollWidth > el.clientWidth + 1,
            background: s.backgroundImage,
            labelLines,
          };
        });
        return {
          headings,
          cardTitles,
          bodies,
          actions,
          hero: type(document.querySelector("h1")),
          eyebrows: all(
            "#the-problem .eyebrow,#career-paths .eyebrow,#the-proof .eyebrow",
          ).map(type),
          overflow: document.documentElement.scrollWidth > innerWidth,
          problem: document.querySelector("#the-problem").dataset.motion,
          career: document.querySelector("[data-career-rail]").dataset.mode,
        };
      });
      const same = (items, key) =>
        items.every((item) => item[key] === items[0][key]);
      check(
        `Matching section heading styles ${width}x${height}`,
        ["size", "line", "tracking", "family", "weight"].every((k) =>
          same(m.headings, k),
        ),
        m.headings,
      );
      check(
        `Heading hierarchy ${width}x${height}`,
        m.hero.size > m.headings[0].size &&
          m.headings[0].size > m.cardTitles[0].size,
        {
          hero: m.hero.size,
          section: m.headings[0].size,
          card: m.cardTitles[0].size,
        },
      );
      check(
        `Shared 12px and 24px heading rhythm ${width}x${height}`,
        m.headings.every((h) => h.before === 12 && h.after === 24),
        m.headings,
      );
      check(
        `Matching card title styles ${width}x${height}`,
        ["size", "line", "tracking", "family", "weight"].every((k) =>
          same(m.cardTitles, k),
        ),
        m.cardTitles,
      );
      check(
        `Readable consistent body copy ${width}x${height}`,
        m.bodies.every(
          (p) => p.size === 16 && Math.abs(p.line - 25.6) < 0.01 && !p.overflow,
        ),
        m.bodies,
      );
      check(
        `Paragraphs avoid orphaned final words ${width}x${height}`,
        m.bodies.every((p) => p.lines.length < 2 || p.lines.at(-1).length >= 2),
        m.bodies.map((p) => p.lines),
      );
      check(
        `Matching section labels ${width}x${height}`,
        m.eyebrows.every(
          (e) =>
            e.size === 11 &&
            e.line === 16.5 &&
            e.tracking === m.eyebrows[0].tracking,
        ),
        m.eyebrows,
      );
      check(
        `Consistent accessible actions ${width}x${height}`,
        m.actions.every(
          (a) =>
            a.size === 15 &&
            a.line === 20 &&
            a.height === 52 &&
            a.radius === 12 &&
            !a.overflow &&
            a.labelLines === 1,
        ) && same(m.actions, "background"),
        m.actions,
      );
      check(`No horizontal overflow ${width}x${height}`, !m.overflow, m);
      report.viewports.push({ width, height, ...m });
      console.log(`Typography ${width}x${height}: ${m.problem}/${m.career}`);
    }
    check("No page runtime errors", report.errors.length === 0, report.errors);
    await context.close();
  } catch (e) {
    report.errors.push(e.stack);
  } finally {
    await browser.close();
    fs.writeFileSync(
      "docs/typography-qa.json",
      JSON.stringify(report, null, 2),
    );
    const failed = report.checks.filter((c) => !c.pass);
    console.log(
      JSON.stringify(
        {
          passed: report.checks.length - failed.length,
          failed: failed.map((c) => c.name),
          errors: report.errors,
        },
        null,
        2,
      ),
    );
    if (failed.length || report.errors.length) process.exitCode = 1;
  }
})();
