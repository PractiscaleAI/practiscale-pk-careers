# Mobile Who we are repair, revision 0.72

## Defects and changes

- The portrait endpoint used a contained scale, exposing the backing on non-9:16 viewports. Uniform scaling now covers the viewport; the aperture follows the image until an edge reaches the viewport boundary.
- Mobile split panels moved only 78% of screen width, leaving diagonal fragments in the uncovered bands. They now travel 105% of screen width; desktop panel travel is unchanged.
- Orientation QC found a stale scroll origin. A sticky viewport reports top zero mid-scene, so refreshing its top-based trigger moved the animation start to the current scroll position. The trigger now measures the natural-flow rail plus the mobile introduction, with explicit progress synchronization on refresh.

The source video, burned-in vision wording, scroll scrub, reading hold, desktop composition and earlier sections are preserved. No new assets, dependencies or persistent animation loops.

## Verification

- Production webpack build and TypeScript pass.
- resize.json: six orientation/height scenarios preserve the half-way film pose and match native scroll progress, including returning from desktop to portrait.
- report.json: 144/144 checks passed with zero runtime errors. Covers nine viewport sizes, rendition loading, expansion coverage, complete panel departure, forward/reverse presented-frame continuity, and reduced-motion/Save-Data/network-failure fallbacks.
- Actual renders inspected at 390x844, 360x800, 550x694 and 768x1024, including the entire ending message. Before screenshots record the exposed background.

Tests use local Chrome and emulated viewport sizes, not physical Safari/iOS devices.

Preview: http://127.0.0.1:3000/?review=v072-mobile-office-fit#who-we-are
