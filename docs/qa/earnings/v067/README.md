# First-entry repair, 27 October 2026

## Findings and changes

- First intersection previously started module/font loading, procedural geometry, live PMREM room-light generation, shader compilation and initial texture/shadow uploads. The initial unprofiled phone-size run showed a 2432.5ms maximum presented animation-frame gap.
- The loading poster showed the final open laptop, then switched to the closed initial pose. Added matching closed-pose WebP posters (desktop 10,884 bytes; portrait 8,554 bytes), inside the same transformed world as the live model. Keep the summary poster for static fallback.
- Prepare the module within 1200px and initialize after 180ms without scrolling, or immediately on entry. Yield between expensive construction phases. Render the current state before exposing the canvas.
- Precompute the same room environment offline, with a 64px cube basis, sigma 0.06, preserving half-float HDR data. Gzipped delivery is 113,333 bytes. Direct lighting remains if the optional environment cannot load/decompress.
- Visual inspection caught stale pixels after the portrait screen canvas changed from 1280px to 960px. Dispose the prior GPU texture allocation on dimension changes before uploading the resized image. Re-inspected portrait earnings screens after correction.

## Verification

- Production webpack build and TypeScript passed.
- Final layout: 150/150 checks across 360, 390, 430, 768, 1024, 1280, 1440 and 1920px widths, including fallback and accessibility checks.
- Edges: 25/25 checks, including resize, orientation, jumps, reverse and context recovery.
- Cold-entry: each of the three fresh page contexts produced one rendered canvas and a loaded matching opening poster before handoff. Final observed maximum frame gaps: 316.6ms at 390px, 200ms at 768px, 150ms at 1440px. These local headless observations vary with browser/GPU cache state and are not a controlled mobile hardware benchmark. Startup timing includes the page's smooth scroll to entry.
- Approach entry: 3/3 passed. Maximum sampled frame gaps were 17ms (phone), 49.8ms (tablet) and 16.9ms (desktop), with the live model ready before visibility. Results are recorded in approach.json. The test traverses the preceding career section, then waits for preparation before the proof is visible. Its sampled scroll uses instant positions to avoid restarting CSS smooth scrolling on every animation frame.
- Visual inspection: desktop and phone opening, tablet and phone earnings, and responsive office expansion. No new sounds, controls, amounts or record ordering.
- Office regression: docs/qa/who-we-are/v067/report.json, 80/80 checks. The aperture follows the image with less than 1px edge error; no black backing, no discarded source frames, desktop behavior retained.

## Limits

An immediate cold jump can still require brief WebGL preparation, covered by the matching poster. No claim of zero startup work or universal 60fps. Physical Safari/iOS and low-end Android remain unverified; viewport emulation does not replace hardware testing. No deployment performed.

