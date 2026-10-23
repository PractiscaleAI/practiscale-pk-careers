# Proof campus and laptop QA, revision 0.44

23 October 2026. Verified against the optimized local production preview. The current full-page design findings are in [the homepage audit](../homepage-design-audit-v044.md).

## Current implementation

- Five homepage sections retain their order. Original hero media/composition, introduction, navigation behaviour and card choreography remain.
- Stats now have a visible heading, shared H2 styling, full-opacity 16px descriptions and canonical fact order at every breakpoint.
- Desktop pins only when the heading, scene, metrics and spacing fit. Phones/tablets and enlarged content retain normal reading flow.
- Earnings has no external caption/counter, sound controls, audio context or synthesis. All ten records, their periods and qualified total retain their sequence. Native expansion, lid opening/closing and front-facing orientation remain.
- Static posters and semantic HTML cover reduced motion, Save-Data, no JavaScript, unavailable WebGL and renderer failure. Historical standalone prototypes and original media remain preserved.

## Verification performed

- 131 responsive/integration assertions passed across six phone/tablet/desktop viewports.
- 29 edge assertions passed: repeated and reverse scrolling, native wheel/PageDown, pin release, keyboard skips, all ten records in order, zero AudioContext creation and sound starts, active resize, enlarged text, settled/offscreen pause, context loss, delayed/failed modules and browser history.
- 109 typography assertions across 12 sizes passed.
- 22 whole-page navigation/accessibility/fallback assertions passed.
- 32 direct-link/short-screen assertions passed, including 320x568 stats and earnings, 844x390 landscape and a 1024x620 stats stage.
- Final rendered inspection covered 33 states at 1440x900, 768x1024 and 390x844. Full-page Axe scans reported zero violations at these sizes, with no page runtime errors.
- TypeScript checking and the optimized Next.js production build passed.

Evidence: `docs/qa/proof-band/v044/`. Before/after source captures are under `visual/`. The first production asset-injection pass did not match the minified variable name. Its selector was corrected to the stable dataset marker and the full affected edge suite passed on rerun.

## Media and release scope

The 3D geometry and final scene posters were not regenerated. Existing eight-second MP4 examples are historical revision 0.43 exports; they are not homepage resources. Their original integrity evidence remains under v043. The current export source uses the corrected mobile fact order.

Physical iPhone/Android, Safari/Firefox, lower-power GPU/thermal behaviour and final-host field Core Web Vitals remain release checks. Browser emulation is not physical-device certification. No new listening check applies to the silent homepage. No publication or paid generation was performed.
