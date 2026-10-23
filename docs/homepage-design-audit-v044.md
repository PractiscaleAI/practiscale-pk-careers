# Homepage design-system audit, revision 0.44

23 October 2026. Scope: the complete five-section homepage, stats hardening and removal of the earnings footer/sound. Authority: the current request, Edition 1.4 and the accepted existing experience.

## 60/30/10

The established palette is appropriate; a wholesale recolour is unnecessary. Deep Teal is the principal environment in the hero and both proof sections. Fog and White provide reading relief in the problem/career sections and their panels. CTAs, mint detail, restrained teal/blue particle colours and achievement amber supply the accents.

This is a qualitative page-level assessment, not a claim that exactly 60%, 30% and 10% of pixels match three colours. Different media and repeated sticky backgrounds make a whole-document pixel count misleading. Entry, transition and reading states were reviewed across desktop, tablet and phone.

The laptop now uses the exact flat `--deep` background instead of `#103B3E` plus a radial wash. Its existing cursor-responsive contours remain. The approved hero gradient, supplied landscape, photography and particle sculptures remain intentional existing media. The exact primary CTA gradient is unchanged.

## Findings and fixes

| Priority | Finding                                                                 | Resolution                                                                                                                                                     |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | The hero link's accessible name omitted part of its visible text.       | Removed the partial naming override. Complete visible text now supplies its name, without changing composition.                                                |
| Medium   | Mobile/tablet fact order differed from HTML order.                      | Every layout now reads healthcare, team, candidates, publications. The export generator uses the same order.                                                   |
| Medium   | The stats lacked a visible section title.                               | Added “PractiScale in numbers” using the shared H2 style. Pin-fit measurement and resize observation include the title, scene, metrics, padding and both gaps. |
| Medium   | Phone stat descriptions were 14px.                                      | Increased to 16px / 1.5, fully opaque and naturally wrapping.                                                                                                  |
| Medium   | Post-hero headings used tight -0.045em tracking.                        | Shared H2 tracking is -0.03em; cards and fact figures use -0.025em. Approved hero lettering stays unchanged.                                                   |
| Medium   | Removing buttons alone would leave active sound code.                   | Removed outside caption/counter, sound/test controls, audio engine, sample generator and sound cue trackers. Kept pure visual-number functions.                |
| Medium   | Short landscape framing made the campus taller than the visible screen. | Capped scene height by viewport height while retaining normal-flow facts.                                                                                      |
| Low      | Laptop used a separate colour wash/shade.                               | Replaced with the exact flat brand environment while preserving contour interaction.                                                                           |

The deep-theme component rules also preserve pale CTA boundaries and mint focus outlines. The original hero CTA already had its pale boundary; no hero-border defect is claimed. No table, outside progress bar, card arrows, extra claims or new palette were added.

## Type, contrast and spacing

Local Sora, Manrope and JetBrains Mono retain their assigned roles. All four post-hero H2s share 28–44px / 1.18. Paragraphs retain 16px / 1.6; stat descriptions use 16px / 1.5. Existing gutters, 12px eyebrow spacing, 24px grouping and 52px primary controls with 12px corners remain. Stats use four columns on desktop and two on smaller screens, with tabular figures.

Calculated sRGB token contrast: White / Deep Teal 11.26:1; muted dark copy / Deep Teal 7.20:1; light body / Fog 7.05:1; mint / Deep Teal 7.70:1. White CTA labels are 4.71:1 at the green endpoint and 5.88:1 at the blue endpoint. Rendered inspection and automated contrast checks supplement these token calculations.

## Verification

TypeScript and the optimized production build passed. Current evidence is in `docs/qa/proof-band/v044/`:

- 131 responsive/integration assertions at six sizes.
- 29 edge assertions, including exact record order, no audio context/sound starts, keyboard, resize, history, context loss and failed assets.
- 109 typography assertions across 12 layouts.
- 22 whole-page navigation/accessibility/fallback assertions.
- 32 direct-link and additional narrow/short assertions in `final-links.json`.
- 33 final visual states at 1440×900, 768×1024 and 390×844. Full-page Axe scans reported zero violations at all three sizes, with no page runtime errors.

Reduced motion, Save-Data, no JavaScript, unavailable WebGL, context loss and delayed/failed scene assets retain readable HTML and posters. Enlarged content releases pins. The first edge-test attempt used a development variable name and did not intercept the minified production chunk; its selector was corrected to the stable dataset marker and the affected suite passed on rerun.

Reproduce with `npm.cmd run typecheck`, `npm.cmd run build`, `npm.cmd run test:proof-band`, `npm.cmd run test:proof-edges`, `npm.cmd run test:typography`, `npm.cmd run test:browser` and `npm.cmd run test:proof-links`. `node scripts/qa-homepage-audit.cjs` reproduces the visual captures with the server running.

## Release scope

The stats are hardened for this tested production preview. Browser emulation does not certify physical iPhone/Android performance, Safari/Firefox, low-power GPUs or final-host field LCP/INP/CLS. Those remain release checks. The accepted introduction, hero media and card choreography were preserved. No publication or paid generation was performed.

Geometry and final posters were not regenerated. Historical revision 0.43 MP4 examples remain unchanged and are not fetched by the homepage. The current export generator applies canonical mobile order; no media was regenerated for this UI audit.
