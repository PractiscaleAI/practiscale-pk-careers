const { chromium } = require("@playwright/test");
const fs = require("fs");
(async () => {
  const b = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  });
  const report = { date: new Date().toISOString(), checks: [], errors: [] };
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (!pass) throw Error(name + JSON.stringify(detail));
  };
  fs.mkdirSync("docs/qa/reload", { recursive: true });
  try {
    for (const [w, h] of [
      [1440, 900],
      [375, 812],
    ]) {
      const c = await b.newContext({ viewport: { width: w, height: h } }),
        p = await c.newPage();
      p.on("pageerror", (e) => report.errors.push(e.message));
      await p.addInitScript(() => {
        window.introEvents = [];
        addEventListener("message", (e) => {
          if (
            e.data?.source === "practiscale-original-preloader" &&
            e.data.type !== "progress"
          )
            window.introEvents.push({
              type: e.data.type,
              locked: document.querySelector("main")?.inert,
              overflow: document.documentElement.style.overflow,
            });
        });
      });
      let baseline;
      for (let visit = 0; visit < 3; visit++) {
        if (visit === 0)
          await p.route("**/_next/**/*.js", async (route) => {
            await new Promise((r) => setTimeout(r, 2500));
            await route.continue().catch(() => {});
          });
        else await p.unroute("**/_next/**/*.js");
        await p.goto("http://127.0.0.1:3000/?no3d=1", {
          waitUntil: "domcontentloaded",
        });
        await p
          .locator(".preloader-original-frame")
          .waitFor({ state: "attached", timeout: 10000 });
        await p.waitForFunction(
          () =>
            Number(
              document
                .querySelector(".preloader-original-frame")
                ?.contentDocument?.querySelector("#pre")
                ?.getAttribute("aria-valuenow"),
            ) >= 35,
        );
        await p.waitForFunction(
          () => document.querySelector(".preloader")?.dataset.ready === "true",
        );
        const sample = await p.evaluate(() => {
          const root = document.querySelector(".preloader"),
            doc = document.querySelector(
              "iframe.preloader-original-frame",
            ).contentDocument;
          return {
            background: getComputedStyle(root).backgroundColor,
            locked: document.querySelector("main").inert,
            fingerprint: {
              rings: [...doc.querySelectorAll("circle")].map((e) =>
                e.getAttribute("r"),
              ),
              width: doc.querySelector(".ring").getBoundingClientRect().width,
              duration: doc.querySelector("#duration").value,
              wordmark: doc.querySelector(".stage .logo").src,
              veil: doc.querySelector(".veil").getAttribute("fill"),
            },
            readyEvent: window.introEvents.find((e) => e.type === "ready"),
          };
        });
        check(
          `Host receives readiness before reveal ${w} visit ${visit}`,
          sample.background === "rgba(0, 0, 0, 0)" &&
            sample.locked &&
            sample.readyEvent.locked &&
            sample.readyEvent.overflow === "hidden",
          { background: sample.background, ready: sample.readyEvent },
        );
        if (!baseline) baseline = sample.fingerprint;
        check(
          `Same original visual configuration ${w} visit ${visit}`,
          JSON.stringify(sample.fingerprint) === JSON.stringify(baseline),
        );
        await p.screenshot({ path: `docs/qa/reload/fill-${w}-${visit}.png` });
        await p
          .locator('.preloader[data-landed="true"]')
          .waitFor({ state: "attached" });
        check(
          `Logo-window reveal uses transparent host ${w} visit ${visit}`,
          await p
            .locator(".preloader")
            .evaluate(
              (e) => getComputedStyle(e).backgroundColor === "rgba(0, 0, 0, 0)",
            ),
        );
        if (visit === 0 || visit === 2)
          await p.screenshot({
            path: `docs/qa/reload/reveal-${w}-${visit}.png`,
          });
        await p
          .locator(".preloader")
          .waitFor({ state: "hidden", timeout: 11000 });
        check(
          `Original completion unlocks page ${w} visit ${visit}`,
          await p.evaluate(
            () =>
              window.introEvents.some((e) => e.type === "complete") &&
              !document.querySelector("main").inert &&
              document.documentElement.style.overflow !== "hidden",
          ),
        );
        check(
          `Removed scroll hint stays absent ${w} visit ${visit}`,
          (await p
            .getByRole("link", { name: "Scroll to move forward" })
            .count()) === 0,
        );
        if (visit === 2)
          await p.screenshot({ path: `docs/qa/reload/hero-${w}.png` });
      }
      await c.close();
    }
    check(
      "No runtime errors across cold visits and two reloads",
      report.errors.length === 0,
      report.errors,
    );
  } catch (e) {
    report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(
      "docs/preloader-reload-qa.json",
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report, null, 2));
    await b.close();
  }
})();
