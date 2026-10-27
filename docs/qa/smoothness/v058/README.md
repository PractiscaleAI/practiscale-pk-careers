# Homepage smoothness audit, revision 0.58

Audited the six mounted homepage sections with continuous native scrolling, reversal, fast jumps and real wheel input. Preserved the approved hero, problem-card, company-film, career and testimonial choreography. The company film remains desktop-only.

## Issues reproduced and repaired

1. The laptop repainted and uploaded its screen and rebuilt shadows even when the visible state was identical. Its baseline forward-sweep 95th-percentile animation-frame interval was 183.3ms at 1440x900 and 133.2ms at 390x844. Intermediate caching and smaller textures improved this but still left substantial CanvasTexture upload stalls. A CPU profile identified `texSubImage2D` as the largest sampled application cost. The final version uploads CPU ImageData into a persistent DataTexture, skips identical screen states, avoids mipmap generation and updates shadows only when geometry changes. Screen logical coordinates, model, record order and reporting periods are unchanged.
2. Discrete wheel input snapped the laptop between two poses. The player now eases a single presented progress toward the latest native position with a 75ms time constant. Panel, copy, facts, lid, screen and background use that same progress. There is no playback queue or wheel interception, and the loop stops at rest, offscreen and in hidden tabs.
3. A fresh #testimonials link landed near the top of the page while the target was about 21,656px farther down, because upstream rails were not yet measured. The shared layout-settling anchor helper now handles testimonial links and cancels on real user input.
4. The existing laptop text departure crossed the expanding panel between progress checkpoints on narrower desktops. Moving the end of its departure from 0.055 to 0.043 clears the panel throughout the sampled transition. The layout suite now includes 0.03 and 0.035 checkpoints and waits for presented progress rather than accepting a 0.003 timing error.

## Measured release results

`release/report.json` is the final full-page motion run. All 24 functional assertions passed without browser errors. Values below are RAF intervals during each 2.4-second forward sweep, not a claim that every video/image source presents 60 unique frames per second.

| Section       | Desktop p95 |     Phone-layout p95 |
| ------------- | ----------: | -------------------: |
| CEO hero      |      16.8ms |               16.8ms |
| Problem cards |      16.8ms |               16.8ms |
| Company film  |      16.8ms | Omitted as requested |
| Career cards  |      16.9ms |               16.8ms |
| Laptop        |      16.9ms |               17.0ms |
| Testimonials  |      16.8ms |               16.8ms |

The final laptop desktop sweep presented 140 updates versus 31 in the baseline. The phone layout presented 129 versus 28. In an isolated final laptop run (`pixels/report.json`), both layouts had maximum intervals of about 33ms and no recorded long tasks. The full-page run still contained isolated outliers: about 183ms for desktop problem cards, 133ms for desktop testimonials and 167ms for the phone-layout laptop. These are retained in raw traces; a good p95 does not certify a hitch-free site on every device. No sustained freeze or stale reverse result was reproduced after the repairs.

The local desktop reports Intel UHD Graphics 620 with GPU compositing, WebGL and hardware video decode enabled. Phone sizes are Chromium emulation on that machine, not physical phones. Safari, Firefox, real iOS/Android, battery-saving modes and throttled-network behavior remain outside this audit. Fast scrolling deliberately moves to the latest position and may skip intermediate source frames or records; it does not force the user to watch skipped content.

## Supporting evidence

- `hero/continuity-qa.json`: 40 passing checks, including 40ms artificial decode delay, directional continuity and bounded frame resources. Hero source and layout were not changed.
- `earnings-release/report.json`: 150 passing final screen/layout, semantic content, accessibility and fallback checks across eight viewport sizes.
- `earnings-edges-release/report.json`: 25 passing checks for final record order, active resizing, enlarged-text fallback, recovery, keyboard skip and silent behavior.
- `release/`: actual desktop and phone section captures plus continuous traces; `earnings-release/` contains desktop, tablet and phone screen captures for visual inspection.
- `baseline/`, `optimized/`, `tuned/`, `final/` and `pixels/` retain intermediate diagnostics. In particular, `final/` predates the direct DataTexture optimization; use `release/` for the delivered implementation.
- `laptop-profile.json` and `scripts/qa-laptop-profile.cjs` record the CPU-profile experiment that motivated the upload change. Profiling itself changes timing and is not the release benchmark.

Run the production server, then `node scripts/qa-smoothness.cjs <output-name>`. An optional `QA_SECTIONS` comma-separated filter narrows the run. Existing earnings and hero suites accept `QA_OUTPUT_DIR` to preserve prior evidence. Build and type checking are required alongside browser verification.

Final verification: 239 assertions passed across the four principal suites above, with no reported browser errors. Production build and TypeScript checks passed. Rendered earnings were inspected at desktop, tablet and phone sizes after the DataTexture change; screen orientation, colour roles and text layout remained correct. Intermediate failed runs are retained as diagnostic history, not counted as release passes.
