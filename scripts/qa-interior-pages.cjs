const { chromium } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const output =
  process.env.QA_ARTIFACTS_DIR ||
  path.join(os.tmpdir(), "practiscale-interior-qa");
const routes = [
  "/about/our-story",
  "/about/how-we-work",
  "/about/why-practiscale",
  "/training-programs/appointment-setter",
  "/training-programs/virtual-assistant",
  "/jobs",
  "/who-we-serve",
];
const sizes = [
  { width: 1440, height: 900, name: "desktop" },
  { width: 768, height: 1024, name: "tablet" },
  { width: 390, height: 844, name: "phone" },
  { width: 320, height: 640, name: "small-phone" },
];

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader"],
  });
  const report = { checks: [], errors: [], violations: [] };
  const check = (name, pass, details) => {
    report.checks.push({ name, pass, details });
    if (!pass) process.exitCode = 1;
  };
  try {
    for (const size of sizes) {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) =>
        report.errors.push({ route: page.url(), message: error.message }),
      );
      for (const route of routes) {
        const response = await page.goto(base + route, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await page.evaluate(() => document.fonts.ready);
        const state = await page.evaluate(() => {
          const heading = document.querySelector("main h1");
          const header = document.querySelector("header.site-header");
          const h = heading?.getBoundingClientRect();
          const nav = header?.getBoundingClientRect();
          return {
            h1Count: document.querySelectorAll("main h1").length,
            mainCount: document.querySelectorAll("main#main").length,
            footerCount: document.querySelectorAll("footer#site-footer").length,
            viewportWidth: innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            headingTop: h?.top,
            headingBottom: h?.bottom,
            headerBottom: nav?.bottom,
            font: heading ? getComputedStyle(heading).fontFamily : "",
            emptyLinks: document.querySelectorAll('main a[href="#"]').length,
            preloaderCount: document.querySelectorAll(".preloader").length,
          };
        });
        const key = `${size.name} ${route}`;
        check(
          `${key}: page renders`,
          response?.status() === 200 &&
            state.mainCount === 1 &&
            state.h1Count === 1 &&
            state.footerCount === 1,
          state,
        );
        check(
          `${key}: no horizontal overflow`,
          state.documentWidth <= state.viewportWidth + 1,
          state,
        );
        check(
          `${key}: heading clears header`,
          state.headingTop >= state.headerBottom - 3 &&
            state.headingBottom <= size.height + 200,
          state,
        );
        check(
          `${key}: design type and working links`,
          state.font.includes("Sora") && state.emptyLinks === 0,
          state,
        );
        check(
          `${key}: no intro on direct visit`,
          state.preloaderCount === 0,
          state,
        );
        if (route === "/about/our-story") {
          const hero = page.locator("section").filter({
            has: page.getByRole("heading", { level: 1 }),
          });
          const heroLayout = await hero
            .locator("img")
            .evaluate(async (image) => {
              await image.decode();
              const panel = image.closest("section");
              const copy = panel.querySelector("h1 + p").getBoundingClientRect();
              const photo = image.getBoundingClientRect();
              const frame = panel.getBoundingClientRect();
              return {
                source: new URL(image.currentSrc).pathname,
                stacked: photo.top >= copy.bottom,
                edgeAligned: Math.abs(photo.right - frame.right) < 1,
                fullPhoto:
                  Math.abs(
                    photo.width / photo.height -
                      image.naturalWidth / image.naturalHeight,
                  ) < 0.002 && getComputedStyle(image).objectFit === "contain",
                blend: getComputedStyle(
                  image.closest("picture").parentElement,
                  "::after",
                ).backgroundImage,
              };
            });
          check(
            key +
              ": Our Story shows the complete building photo with the teal fade",
            heroLayout.source ===
              "/media/about/about-office-exterior-clean-v1.webp" &&
              heroLayout.stacked === size.width <= 840 &&
              heroLayout.edgeAligned &&
              heroLayout.fullPhoto &&
              heroLayout.blend.includes("linear-gradient"),
            heroLayout,
          );
          const profile = await page
            .locator("#founder")
            .getByRole("img", {
              name: "Afrasyab Ahmed, Founder and CEO of PractiScale",
              exact: true,
            })
            .evaluate(async (image) => {
              await image.decode();
              const section = image.closest("section");
              const figure = image.closest("figure");
              const editorial = figure.parentElement;
              const profile = editorial.parentElement.parentElement;
              const name = section.querySelector("h2").getBoundingClientRect();
              const portrait = image.getBoundingClientRect();
              const paragraphs = [...section.querySelectorAll("p")].slice(1);
              const quotes = section.querySelectorAll("blockquote");
              const quote = quotes[0].getBoundingClientRect();
              const style = getComputedStyle(image);
              return {
                source: new URL(image.currentSrc).pathname,
                aspect: portrait.width / portrait.height,
                originalAspect: image.naturalWidth / image.naturalHeight,
                fit: style.objectFit,
                mask: style.maskImage,
                profileWidth: profile.clientWidth,
                portraitBelowName: portrait.top >= name.bottom,
                portraitLeftOfName: portrait.right <= name.left,
                paragraphCount: paragraphs.length,
                quoteCount: quotes.length,
                quoteBelow:
                  quote.top >= editorial.getBoundingClientRect().bottom,
                chapterHeadings: section.querySelectorAll("h3").length,
                chapterControls: section.querySelectorAll("nav, button").length,
              };
            });
          check(
            key + ": original founder portrait is displayed without clipping",
            profile.source === "/media/about/ceo-image-3.webp" &&
              Math.abs(profile.aspect - profile.originalAspect) < 0.001 &&
              profile.fit === "contain" &&
              profile.mask === "none",
            profile,
          );
          check(
            key + ": founder profile reflows and ends with one quote",
            (profile.profileWidth <= 560
              ? profile.portraitBelowName
              : profile.portraitLeftOfName) &&
              profile.paragraphCount === 3 &&
              profile.quoteCount === 1 &&
              profile.quoteBelow &&
              profile.chapterHeadings === 0 &&
              profile.chapterControls === 0,
            profile,
          );
        }
        if (size.name === "desktop" || size.name === "phone") {
          const name = route.split("/").filter(Boolean).join("-");
          await page.screenshot({
            path: path.join(output, `${size.name}-${name}.png`),
          });
          const axe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze();
          for (const violation of axe.violations) {
            report.violations.push({
              key,
              id: violation.id,
              impact: violation.impact,
              targets: violation.nodes.map((node) => node.target),
            });
          }
        }
        if (route === "/jobs") {
          const banner = page.getByRole("region", {
            name: "Open jobs at PractiScale",
          });
          const image = await banner
            .getByRole("img")
            .evaluate(async (photo) => {
              await photo.decode();
              const frame = photo.getBoundingClientRect();
              const section = photo.closest("section");
              const copy = section.querySelector("p").getBoundingClientRect();
              const search = section
                .querySelector('[role="search"]')
                .getBoundingClientRect();
              return {
                width: photo.naturalWidth,
                stacked: copy.bottom <= frame.top && frame.bottom <= search.top,
                searchAboveImage: search.bottom <= frame.top,
              };
            });
          check(
            key +
              ": Careers banner photo and search follow the responsive layout",
            image.width > 0 &&
              image.stacked === size.width <= 900 &&
              !image.searchAboveImage,
            image,
          );
          const firstRole = page.locator("#open-roles article").first();
          const apply = firstRole.getByRole("link", {
            name: /^Apply now for /,
          });
          await firstRole.scrollIntoViewIfNeeded();
          const before = await firstRole.boundingBox();
          const visibleBefore = await apply.isVisible();
          if (size.width > 760) await firstRole.hover();
          const after = await firstRole.boundingBox();
          check(
            key + ": Apply action stays visible without moving the role card",
            visibleBefore &&
              (await apply.isVisible()) &&
              before !== null &&
              JSON.stringify(before) === JSON.stringify(after),
            { visibleBefore, before, after },
          );
        }
      }
      await context.close();
    }
    check("No runtime errors", report.errors.length === 0, report.errors);
    check(
      "No accessibility violations",
      report.violations.length === 0,
      report.violations,
    );
  } catch (error) {
    report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(
      path.join(output, "report.json"),
      JSON.stringify(report, null, 2),
    );
    await browser.close();
    console.log(
      JSON.stringify(
        {
          total: report.checks.length,
          failed: report.checks.filter((item) => !item.pass),
          errors: report.errors,
          violations: report.violations,
          failure: report.failure,
          output,
        },
        null,
        2,
      ),
    );
  }
})();
