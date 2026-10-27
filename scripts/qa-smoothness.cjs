const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const path = require("node:path");
const out = path.join("docs/qa/smoothness/v058", process.argv[2] || "baseline");
const report = {
  method:
    "Sequential local Chromium runs, continuous native scrolling and discrete wheel steps. Timing is diagnostic local-browser evidence, not a physical-device frame-rate guarantee.",
  cases: [],
  checks: [],
  errors: [],
};
const check = (name, pass, detail) => {
  report.checks.push({ name, pass, detail });
  if (!pass) console.log("FAIL", name, detail);
};
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
    ]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      page.on("pageerror", (e) => report.errors.push(e.message));
      await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
      await dismissIntroduction(page);
      await page.waitForTimeout(1000);
      for (const [name, selector, viewport] of [
        ["hero", ".hero-scroll", ".hero-scroll"],
        ["problem", "#the-problem", "#the-problem"],
        ["office", "[data-who-rail]", "[data-who-viewport]"],
        ["career", "[data-career-rail]", "[data-career-viewport]"],
        ["laptop", "[data-laptop-rail]", "[data-laptop-viewport]"],
        ["testimonials", "#testimonials", "[data-testimonial-stage]"],
      ]) {
        if (name === "office" && width < 1024) continue;
        if (
          process.env.QA_SECTIONS &&
          !process.env.QA_SECTIONS.split(",").includes(name)
        )
          continue;
        const scene = await page.locator(selector).evaluate(
          (el, { name, viewport }) => {
            const v = document.querySelector(viewport);
            const top = el.getBoundingClientRect().top + scrollY;
            let travel = el.offsetHeight - v.offsetHeight;
            if (name === "hero") travel = el.offsetHeight - innerHeight;
            if (name === "problem") travel = el.offsetHeight - innerHeight;
            if (name === "career")
              travel =
                parseFloat(el.style.getPropertyValue("--career-travel")) ||
                travel;
            return {
              top:
                name === "career"
                  ? top - parseFloat(getComputedStyle(v).top)
                  : top,
              travel,
              mode: el.dataset.mode || el.dataset.motion || "scroll",
            };
          },
          { name, viewport },
        );
        if (scene.travel < 100) {
          report.cases.push({ width, name, scene, fallback: true });
          continue;
        }
        await page.evaluate(
          (y) => scrollTo({ top: y, behavior: "instant" }),
          scene.top,
        );
        await page.waitForTimeout(
          name === "career" || name === "laptop" ? 2200 : 1000,
        );
        const sample = await page.evaluate(
          async ({ name, scene }) => {
            const sampleState = () => {
              const hero = document.querySelector(".hero-portrait"),
                p = document.querySelector("#the-problem [data-progress]"),
                w = document.querySelector("[data-who-rail]"),
                c = document.querySelector("[data-career-rail]"),
                l = document.querySelector("[data-laptop-rail]"),
                t = document.querySelector(
                  "#testimonials [data-testimonial-track]",
                );
              if (name === "hero") return +hero.dataset.frame;
              if (name === "problem") return +p.dataset.progress;
              if (name === "office")
                return w.querySelector("video").currentTime;
              if (name === "career") return +c.dataset.progress;
              if (name === "laptop") return +l.dataset.progress;
              return -new DOMMatrixReadOnly(getComputedStyle(t).transform).m41;
            };
            const rows = [],
              longTasks = [];
            const observer = new PerformanceObserver((list) =>
              longTasks.push(
                ...list
                  .getEntries()
                  .map((e) => ({ start: e.startTime, duration: e.duration })),
              ),
            );
            observer.observe({ type: "longtask" });
            async function sweep(from, to, duration, label) {
              const start = performance.now();
              await new Promise((resolve) => {
                function frame(now) {
                  const t = Math.min(1, (now - start) / duration);
                  scrollTo({
                    top: scene.top + scene.travel * (from + (to - from) * t),
                    behavior: "instant",
                  });
                  rows.push({
                    t: now,
                    label,
                    value: sampleState(),
                    y: scrollY,
                  });
                  if (t < 1) requestAnimationFrame(frame);
                  else resolve();
                }
                requestAnimationFrame(frame);
              });
              await new Promise((r) => setTimeout(r, 850));
              rows.push({
                t: performance.now(),
                label: label + "-settled",
                value: sampleState(),
                y: scrollY,
              });
            }
            await sweep(0, 1, 2400, "forward");
            await sweep(1, 0, 2400, "reverse");
            await sweep(0, 0.9, 160, "fast-forward");
            await sweep(0.9, 0.1, 160, "fast-reverse");
            observer.disconnect();
            return { rows, longTasks };
          },
          { name, scene },
        );
        const forward = sample.rows.filter((r) => r.label === "forward"),
          reverse = sample.rows.filter((r) => r.label === "reverse");
        const gaps = forward
          .slice(1)
          .map((r, i) => r.t - forward[i].t)
          .sort((a, b) => a - b);
        const result = {
          width,
          name,
          scene,
          updates: forward.filter(
            (r, i) => i && r.value !== forward[i - 1].value,
          ).length,
          p95FrameGap: gaps[Math.floor(gaps.length * 0.95)],
          maxFrameGap: Math.max(...gaps),
          longTasks: sample.longTasks,
          settled: sample.rows.filter((r) => r.label.endsWith("settled")),
        };
        report.cases.push(result);
        fs.writeFileSync(
          path.join(out, `${width}-${name}-trace.json`),
          JSON.stringify(sample),
        );
        check(
          `${width} ${name} advances during scroll`,
          result.updates >= 3,
          result,
        );
        check(
          `${width} ${name} reverse reaches opening`,
          Math.abs(result.settled[1].value - forward[0].value) <=
            (name === "hero" ? 1 : name === "testimonials" ? 2 : 0.15),
          result.settled,
        );
        await page.screenshot({ path: path.join(out, `${width}-${name}.png`) });
        console.log(
          width,
          name,
          "updates",
          result.updates,
          "p95",
          Math.round(result.p95FrameGap),
        );
      }
      // Discrete wheel input should produce intermediate presented laptop poses.
      if (width === 1440) {
        await page.locator("[data-laptop-rail]").evaluate((el) =>
          scrollTo({
            top:
              el.getBoundingClientRect().top +
              scrollY +
              (el.offsetHeight - innerHeight) * 0.03,
            behavior: "instant",
          }),
        );
        await page.waitForTimeout(1000);
        await page.evaluate(() => {
          window.lidTrace = [];
          const start = performance.now();
          function sample(now) {
            const el = document.querySelector("[data-laptop-rail]");
            window.lidTrace.push({ t: now, p: +el.dataset.progress });
            if (now - start < 1000) requestAnimationFrame(sample);
          }
          requestAnimationFrame(sample);
        });
        await page.mouse.wheel(0, 120);
        await page.waitForTimeout(1100);
        const poses = await page.evaluate(() => window.lidTrace);
        const distinct = new Set(poses.map((p) => p.p)).size;
        check(
          "Laptop wheel step is eased over intermediate poses",
          distinct >= 5,
          { distinct, poses },
        );
      }
      await context.close();
    }
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      }),
      page = await context.newPage();
    await page.goto("http://127.0.0.1:3000/#testimonials", {
      waitUntil: "networkidle",
    });
    await dismissIntroduction(page);
    await page.waitForTimeout(2500);
    const anchor = await page.locator("#testimonials").evaluate((el) => ({
      top: el.getBoundingClientRect().top,
      active: el.querySelector("[data-active]").dataset.active,
    }));
    check(
      "Testimonial deep link settles at its own section",
      Math.abs(anchor.top) < 2 && anchor.active === "0",
      anchor,
    );
    await page.screenshot({
      path: path.join(out, "testimonials-deep-link.png"),
    });
    await context.close();
  } catch (e) {
    report.errors.push(e.stack);
    console.error(e);
  } finally {
    await browser.close();
    fs.writeFileSync(
      path.join(out, "report.json"),
      JSON.stringify(report, null, 2),
    );
  }
  console.log(
    JSON.stringify({
      checks: report.checks.length,
      failed: report.checks.filter((c) => !c.pass).length,
      errors: report.errors,
    }),
  );
  if (report.errors.length || report.checks.some((c) => !c.pass))
    process.exitCode = 1;
})();
