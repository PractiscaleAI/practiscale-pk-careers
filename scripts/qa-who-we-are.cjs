const { chromium } = require("@playwright/test");
const { AxeBuilder } = require("@axe-core/playwright");
const fs = require("node:fs/promises"),
  path = require("node:path");
const out = path.join(
  __dirname,
  "../docs/qa/who-we-are/v052",
  process.argv[2] === "native" ? "native" : "main",
);
const result = { checks: [], errors: [], layouts: [], accessibility: [] };
const check = (name, pass, data) => {
  result.checks.push({ name, pass: !!pass, data });
  if (!pass) console.log("FAIL " + name + " " + JSON.stringify(data));
};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function ready(page, hash = "") {
  await page.goto("http://127.0.0.1:3000/" + hash, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.waitForFunction(
    () =>
      document.querySelector("main") &&
      (document.querySelector("main").inert ||
        !document.querySelector(".preloader") ||
        document.querySelector(".preloader")?.getAttribute("aria-hidden") ===
          "true"),
  );
  if (
    await page
      .locator(".preloader")
      .isVisible()
      .catch(() => false)
  )
    await page.keyboard.press("Escape");
  await page.locator(".preloader").waitFor({ state: "hidden", timeout: 15000 });
  await page.waitForFunction(() => !document.querySelector("main")?.inert);
  await page.evaluate(() => document.fonts.ready);
  await pause(600);
}
async function progress(page, p) {
  await page.evaluate((p) => {
    const r = document.querySelector("[data-who-rail]"),
      v = r.querySelector("[data-who-viewport]");
    scrollTo({
      top:
        r.getBoundingClientRect().top +
        scrollY +
        (r.offsetHeight - v.offsetHeight) * p,
      behavior: "instant",
    });
  }, p);
  await pause(850);
  await page.waitForFunction(
    () => {
      const r = document.querySelector("[data-who-rail]"),
        v = r.querySelector("video");
      return (
        !v.seeking &&
        Math.abs(v.currentTime - Number(r.dataset.targetTime)) < 0.07
      );
    },
    null,
    { timeout: 20000 },
  );
}
async function state(page) {
  return page.evaluate(() => {
    const r = document.querySelector("[data-who-rail]"),
      s = r.closest("section"),
      v = r.querySelector("video");
    const box = (e) => {
      const b = e.getBoundingClientRect();
      return {
        x: b.x,
        y: b.y,
        w: b.width,
        h: b.height,
        b: b.bottom,
        r: b.right,
      };
    };
    const frame = box(r.querySelector("[data-who-frame]")),
      clip = getComputedStyle(r.querySelector("[data-who-frame]")).clipPath;
    const insets = (
      clip
        .match(/^inset\(([^)]*)\)/)?.[1]
        .split(" round ")[0]
        .match(/[\d.]+/g) || ["0"]
    ).map(Number);
    const [t, rt, b, l] = [
      insets[0],
      insets[1] ?? insets[0],
      insets[2] ?? insets[0],
      insets[3] ?? insets[1] ?? insets[0],
    ];
    const windowRect = {
      x: frame.x + l,
      y: frame.y + t,
      w: frame.w - l - rt,
      h: frame.h - t - b,
      b: frame.b - b,
      r: frame.r - rt,
    };
    const vr = box(v),
      imageWidth = Math.min(vr.w, (vr.h * 16) / 9),
      imageHeight = (imageWidth * 9) / 16;
    const imageRect = {
      x: vr.x + (vr.w - imageWidth) / 2,
      y: vr.y + (vr.h - imageHeight) / 2,
      r: vr.x + (vr.w + imageWidth) / 2,
      b: vr.y + (vr.h + imageHeight) / 2,
    };
    const translation = (el) => {
      const transform = getComputedStyle(el).transform;
      return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41;
    };
    return {
      width: innerWidth,
      height: innerHeight,
      overflow: document.documentElement.scrollWidth - innerWidth,
      mode: r.dataset.mode,
      ready: r.dataset.ready,
      p: Number(r.dataset.progress),
      split: Number(r.dataset.split),
      leftX: translation(r.querySelector('[data-who-panel="left"]')),
      rightX: translation(r.querySelector("[data-who-plane]")),
      target: Number(r.dataset.targetTime),
      actual: v.currentTime,
      duration: v.duration,
      paused: v.paused,
      muted: v.muted,
      controls: v.controls,
      section: box(s),
      copy: box(r.querySelector("[data-who-copy]")),
      description: box(r.querySelector("[data-who-description]")),
      descriptionColor: getComputedStyle(
        r.querySelector("[data-who-description]"),
      ).color,
      windowRect,
      clip,
      backCount: r.querySelectorAll(
        "[data-who-back], [data-who-stack], [data-who-shadow]",
      ).length,
      captionCount: r.querySelectorAll("[data-who-caption]").length,
      videoCount: r.querySelectorAll("video").length,
      fit: getComputedStyle(v).objectFit,
      neutral: getComputedStyle(r.querySelector("[data-who-plane]"))
        .backgroundColor,
      panelClip: getComputedStyle(r.querySelector("[data-who-plane]")).clipPath,
      backdropClip: getComputedStyle(r.querySelector("[data-who-background]"))
        .clipPath,
      scale: (() => {
        const matrix = new DOMMatrixReadOnly(
          getComputedStyle(r.querySelector("[data-who-surface]")).transform,
        );
        return { x: matrix.a, y: matrix.d };
      })(),
      sections: [...document.querySelectorAll("main>section")].map((e) => e.id),
      videoRect: vr,
      imageRect,
    };
  });
}
(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    if (process.argv[2] === "native") {
      const ctx = await browser.newContext({
          viewport: { width: 1440, height: 900 },
        }),
        page = await ctx.newPage();
      page.on("pageerror", (e) => result.errors.push(String(e)));
      await ready(page, "#who-we-are");
      await pause(1600);
      check(
        "Direct company-film link aligns",
        Math.abs((await page.locator("#who-we-are").boundingBox()).y) < 3,
      );
      await page.waitForFunction(
        () =>
          document.querySelector("[data-who-rail]").dataset.ready === "true",
        null,
        { timeout: 20000 },
      );
      for (const p of [0, 0.04, 0.1]) {
        await progress(page, p);
        const a = await new AxeBuilder({ page }).analyze();
        check(
          `Initial/transition ${p} full-page accessibility`,
          a.violations.length === 0,
          a.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              data: n.any.map((a) => a.data),
            })),
          })),
        );
      }
      await progress(page, 0);
      await page.mouse.wheel(0, 220);
      await pause(1000);
      let s = await state(page);
      check("Real wheel advances the company scene", s.p > 0.02, s.p);
      const before = s.p;
      await page.keyboard.press("PageDown");
      await pause(1400);
      s = await state(page);
      check("Native PageDown advances the scene", s.p > before, s.p);
      await progress(page, 0.705);
      await page.screenshot({ path: path.join(out, "team.png") });
      await progress(page, 1);
      await page.screenshot({ path: path.join(out, "vision.png") });
      check(
        "Final vision frame is retained",
        Math.abs((await state(page)).actual - 31.633333) < 0.07,
      );
      await page.setViewportSize({ width: 1280, height: 420 });
      await pause(1000);
      s = await state(page);
      check(
        "Content-constrained desktop releases extended travel",
        s.mode === "static" && s.controls && s.section.h < 1400,
        s,
      );
      check(
        "Releasing the pin keeps the company film in view",
        Math.abs(s.section.y) < 3,
        s.section,
      );
      await page.screenshot({ path: path.join(out, "short-desktop.png") });
      await ctx.close();
      const failed = await browser.newContext({
          viewport: { width: 1440, height: 900 },
        }),
        fp = await failed.newPage();
      await failed.route("**/media/who-we-are/office-scroll*.mp4", (r) =>
        r.abort("failed"),
      );
      await ready(fp, "#who-we-are");
      await fp
        .locator("[data-who-error]")
        .waitFor({ state: "visible", timeout: 15000 });
      await pause(1000);
      const fa = await new AxeBuilder({ page: fp })
        .include("#who-we-are")
        .analyze();
      check(
        "Failure recovery text keeps accessible contrast",
        fa.violations.length === 0,
        fa.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      );
      await fp.screenshot({ path: path.join(out, "failure-recovery.png") });
      await failed.close();
      return;
    }
    for (const [w, h] of [
      [1440, 900],
      [1280, 800],
      [1024, 768],
      [1920, 1080],
      [2560, 1080],
      [1280, 720],
      [1920, 686],
      [1536, 550],
      [1366, 600],
      [1024, 600],
    ]) {
      const ctx = await browser.newContext({
          viewport: { width: w, height: h },
        }),
        page = await ctx.newPage();
      page.on("pageerror", (e) =>
        result.errors.push({ case: `${w}`, error: String(e) }),
      );
      await ready(page);
      await page.locator("#who-we-are").evaluate((e) =>
        scrollTo({
          top: e.getBoundingClientRect().top + scrollY - 100,
          behavior: "instant",
        }),
      );
      await pause(850);
      if (w === 1440) {
        const edge = await page.screenshot({
          clip: { x: 0, y: 101, width: w, height: 2 },
        });
        const samples = await page.evaluate(async (encoded) => {
          const bitmap = await createImageBitmap(
            new Blob([Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))], {
              type: "image/png",
            }),
          );
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height),
            ctx = canvas.getContext("2d");
          ctx.drawImage(bitmap, 0, 0);
          return [
            16,
            Math.floor(bitmap.width * 0.3),
            Math.floor(bitmap.width * 0.6),
            bitmap.width - 32,
          ].map((x) =>
            Array.from(ctx.getImageData(x, 0, 1, 1).data).slice(0, 3),
          );
        }, edge.toString("base64"));
        check(
          "Entry shares the preceding Fog background without a hard split cut",
          samples.every((c) =>
            c.every((v, i) => Math.abs(v - [243, 246, 246][i]) <= 2),
          ),
          samples,
        );
        await page.screenshot({ path: path.join(out, "entry-seam.png") });
      }
      await page.locator("#who-we-are").evaluate((e) =>
        scrollTo({
          top: e.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        }),
      );
      await page.waitForFunction(
        () =>
          document.querySelector("[data-who-rail]")?.dataset.ready === "true",
        null,
        { timeout: 25000 },
      );
      await progress(page, 0);
      let s = await state(page);
      result.layouts.push(s);
      check(`${w}: desktop motion enabled`, s.mode === "motion", s);
      check(
        `${w}: exact section order`,
        JSON.stringify(s.sections) ===
          JSON.stringify([
            "",
            "the-problem",
            "who-we-are",
            "career-paths",

            "the-proof",
          ]),
        s.sections,
      );
      check(`${w}: opening is unadvanced`, s.actual < 0.04, s.actual);
      check(
        `${w}: rounded inset diagonal uses the approved soft neutral`,
        s.neutral === "rgb(230, 236, 236)" &&
          s.panelClip.startsWith("polygon(") &&
          s.backdropClip.startsWith("inset(") &&
          s.backdropClip.includes("round 24px"),
        { neutral: s.neutral, panel: s.panelClip, backdrop: s.backdropClip },
      );
      check(
        `${w}: complete supplied company description is present`,
        (await page
          .locator("[data-who-description]")
          .innerText()
          .then((t) => t.replace(/\s+/g, " ").trim())) ===
          "PractiScale helps US healthcare businesses grow through professional referral relationships. We find the right referral partners in each client's area, reach out, qualify them and set up introductions. All of it is done here, by people we trained.",
      );
      check(
        `${w}: single video with no stacked layers or card footer`,
        s.videoCount === 1 && s.backCount === 0 && s.captionCount === 0,
        s,
      );
      check(
        `${w}: both background panels start closed`,
        Math.abs(s.leftX) < 0.1 && Math.abs(s.rightX) < 0.1,
        s,
      );
      check(
        `${w}: copy clear of the opening video`,
        s.copy.b + 23.9 <= s.windowRect.y &&
          Math.abs(s.windowRect.x + s.windowRect.w / 2 - w / 2) < 1 &&
          s.copy.y >= 111.9 &&
          s.copy.b <= h - 48,
        s,
      );
      check(
        `${w}: description anchors bottom-right opposite the heading`,
        Math.abs(s.description.r - (w - s.copy.x)) < 1 &&
          h - s.description.b >= 47.9 &&
          h - s.description.b <= 128.1 &&
          s.description.y >= s.windowRect.b + 23.9 &&
          s.description.x > s.copy.x &&
          s.descriptionColor === "rgb(19, 65, 67)",
        { heading: s.copy, description: s.description, window: s.windowRect },
      );
      check(
        `${w}: opening video fits viewport at its source aspect`,
        s.windowRect.b <= h - 40 &&
          s.windowRect.x >= 0 &&
          s.windowRect.r <= w &&
          Math.abs(s.windowRect.w / s.windowRect.h - 16 / 9) < 0.001,
        s.windowRect,
      );
      check(
        `${w}: native paused silent film`,
        s.paused && s.muted && !s.controls,
      );
      check(
        `${w}: native cover framing preserves proportions`,
        s.fit === "cover",
      );
      check(`${w}: no horizontal overflow`, s.overflow <= 1, s.overflow);
      await page.screenshot({ path: path.join(out, `${w}x${h}-opening.png`) });
      const points =
        w === 1440
          ? [0.1, 0.195, 0.38, 0.64, 0.9, 1, 0.64, 0.38, 0]
          : [0.195, 0.64, 1];
      for (const p of points) {
        await progress(page, p);
        s = await state(page);
        check(
          `${w}/${p}: rendered film follows scroll`,
          Math.abs(s.actual - s.target) < 0.07,
          { p: s.p, target: s.target, actual: s.actual },
        );
        check(
          `${w}/${p}: uniform centered zoom preserves source proportions`,
          Math.abs(s.scale.x - s.scale.y) < 0.0001 &&
            Math.abs(s.videoRect.x + s.videoRect.w / 2 - w / 2) < 1 &&
            Math.abs(s.videoRect.y + s.videoRect.h / 2 - h / 2) < 1 &&
            Math.abs(s.windowRect.y + s.windowRect.h / 2 - h / 2) < 1,
          { scale: s.scale, video: s.videoRect },
        );
        if (p === 0.1)
          check(
            "Both diagonal panels open apart during video expansion",
            s.leftX < -w * 0.1 &&
              s.rightX > w * 0.1 &&
              Math.abs(s.leftX + s.rightX) < 0.5 &&
              s.split > 0 &&
              s.split < 1,
            s,
          );
        if (p === 0.195) {
          check(
            `${w}: expansion precedes film`,
            s.actual < 0.04 && /^inset\(0px(?: round 0px)?\)$/.test(s.clip),
            s,
          );
          check(
            `${w}: expanded video surface fills 100vh without side bars`,
            Math.abs(s.windowRect.x) < 1 &&
              Math.abs(s.windowRect.y) < 1 &&
              Math.abs(s.windowRect.w - w) < 1 &&
              Math.abs(s.windowRect.h - h) < 1 &&
              s.imageRect.x <= 1 &&
              s.imageRect.y <= 1 &&
              s.imageRect.r >= w - 1 &&
              s.imageRect.b >= h - 1 &&
              s.fit === "cover",
            s.imageRect,
          );
          check(
            `${w}: both background panels fully open with fullscreen film`,
            s.leftX <= -w * 0.77 && s.rightX >= w * 0.77 && s.split === 1,
            s,
          );
        }
        if (p === 0)
          check(
            "Reverse scroll closes both background panels with the video",
            Math.abs(s.leftX) < 0.1 &&
              Math.abs(s.rightX) < 0.1 &&
              s.split === 0,
            s,
          );
        if (w === 1440 || p === 1)
          await page.screenshot({
            path: path.join(out, `${w}x${h}-p${p}.png`),
          });
      }
      if (w === 1440) {
        await progress(page, 0.64);
        const a = await new AxeBuilder({ page }).analyze();
        result.accessibility.push(
          a.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        );
        check(
          "Full desktop page passes accessibility scan",
          a.violations.length === 0,
          a.violations.map((v) => v.id),
        );
        const before = await state(page);
        await page.setViewportSize({ width: 1280, height: 800 });
        await pause(1300);
        s = await state(page);
        check(
          "Resize preserves active film progress",
          Math.abs(before.p - s.p) < 0.02,
          { before: before.p, after: s.p },
        );
        await page.locator("[data-who-skip]").focus();
        await page.keyboard.press("Enter");
        await pause(500);
        check(
          "Keyboard skip focuses the following section",
          (await page.evaluate(() => document.activeElement?.id)) ===
            "career-heading",
        );
      }
      await ctx.close();
      console.log(`Desktop ${w} complete`);
    }
    for (const [w, h] of [
      [390, 844],
      [768, 1024],
    ]) {
      const ctx = await browser.newContext({
          viewport: { width: w, height: h },
          hasTouch: true,
        }),
        page = await ctx.newPage(),
        requests = [];
      page.on("request", (r) => {
        if (r.url().includes("office-scroll")) requests.push(r.url());
      });
      await ready(page);
      await page.locator("#career-paths").scrollIntoViewIfNeeded();
      await pause(700);
      const s = await state(page);
      check(
        `${w}: desktop section omitted from layout`,
        s.section.h === 0,
        s.section,
      );
      check(
        `${w}: desktop film not downloaded`,
        requests.length === 0,
        requests,
      );
      check(
        `${w}: unchanged mobile page has no overflow`,
        s.overflow <= 1,
        s.overflow,
      );
      await page.screenshot({
        path: path.join(out, `${w}-mobile-unchanged.png`),
      });
      await ctx.close();
    }
    for (const kind of ["reduced", "no-js", "save-data", "failed-video"]) {
      const ctx = await browser.newContext({
          viewport: { width: 1440, height: 900 },
          reducedMotion: kind === "reduced" ? "reduce" : "no-preference",
          javaScriptEnabled: kind !== "no-js",
        }),
        page = await ctx.newPage();
      if (kind === "save-data")
        await ctx.addInitScript(() =>
          Object.defineProperty(navigator, "connection", {
            value: { saveData: true },
            configurable: true,
          }),
        );
      if (kind === "failed-video")
        await ctx.route("**/media/who-we-are/office-scroll*.mp4", (r) =>
          r.abort("failed"),
        );
      if (kind === "no-js")
        await page.goto("http://127.0.0.1:3000/", { waitUntil: "load" });
      else await ready(page);
      await page.locator("#who-we-are").evaluate((e) =>
        scrollTo({
          top: e.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        }),
      );
      await pause(2000);
      const s = await state(page);
      check(
        `${kind}: normal flow fallback`,
        s.mode === "static" && s.section.h < 1400,
        s,
      );
      check(`${kind}: native film control retained`, s.controls);
      if (kind === "failed-video")
        check(
          "Failure offers the source film link",
          await page.locator("[data-who-error]").isVisible(),
        );
      await page.screenshot({ path: path.join(out, `${kind}.png`) });
      await ctx.close();
    }
  } catch (error) {
    result.fatal = String(error);
    console.error(error);
  } finally {
    await browser.close();
    await fs.writeFile(
      path.join(out, "report.json"),
      JSON.stringify(result, null, 2),
    );
    console.log(
      JSON.stringify({
        checks: result.checks.length,
        failed: result.checks.filter((c) => !c.pass).length,
        errors: result.errors.length,
        fatal: result.fatal,
      }),
    );
  }
  if (
    result.fatal ||
    result.errors.length ||
    result.checks.some((c) => !c.pass)
  )
    process.exitCode = 1;
})();
