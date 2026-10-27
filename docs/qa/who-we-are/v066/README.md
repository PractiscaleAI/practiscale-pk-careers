# Mobile company film v066

Validated against the production webpack build on 2026-10-27. Build and TypeScript passed. Preview: http://127.0.0.1:3000/?review=v066-mobile-office#who-we-are

## Delivery

- Protected original: 54,946,400 bytes. Web rendition: 11,810,231 bytes, a 78.5% reduction.
- Portrait 720x1280, 30fps, 950 sequential frames, 31.666667 seconds. Full decode verified no timestamp gaps. Source and output checksums are in mobile-manifest-v066.json.
- Short eight-frame keyframe intervals, no B-frames and faststart support seeking. SSIM against downscaled source: 0.980166.
- 36,452-byte WebP first-frame poster. No office video requested at page start; only the matching rendition requested near the section.
- Full portrait composition is contained in the viewport. Black letterboxing intentionally preserves the original frame and final vision text on differently shaped screens.

## Checks

- qa-who-mobile.cjs: 68/68 checks, zero page errors. Viewports: 320x568, 390x844, 430x932, 768x1024, 844x390, 1440x900 and 1366x600.
- qa-who-we-are.cjs native: 10/10 checks, zero page errors. Direct link, wheel, keyboard, final frame, short desktop fallback, failed loading and accessibility checks passed.
- qa-who-resize.cjs: four size-change checks passed, with correct source, one heading, no horizontal overflow and matching settled progress after height changes. This is not a physical browser-toolbar or orientation test.
- Actual presented-frame forward sweep: 110 updates, no wrong-direction updates, maximum gap 51.6ms. Reverse: 109 updates, no wrong-direction updates, maximum gap 132.7ms. Desktop Chrome headless measurements are not mobile hardware frame-rate guarantees.
- Reduced-motion, Save Data and failed-video states retain native controls and readable content.
- Visually inspected 320px introduction; 390px preview/final frame; 430px expansion; 768px preview; 1440px and short 1366px desktop previews.

## Limits

Physical iOS/Safari and low-end Android GPU/decode performance remain unverified. No simulated network-throughput benchmark was run. Fast scrolling necessarily skips intermediate displayed frames while catching up to the latest position; the delivered media itself preserves every source frame in order. Existing desktop choreography and other homepage scenes were not redesigned.
