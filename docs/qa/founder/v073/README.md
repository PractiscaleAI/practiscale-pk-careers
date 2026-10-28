# Founder portrait thumbnail validation

- Dedicated portrait recomposition: 941x1672; AVIF 76,473 bytes, WebP fallback 133,698 bytes.
- Production webpack build passed, including TypeScript and static page generation.
- Existing founder playback and aperture regression: 134/134 checks passed across seven desktop/tablet/phone sizes. Videos stay paused until the fully expanded handoff, pause on reversal, and cannot start late after the visitor leaves.
- Portrait safe-area regression: 28/28 checks passed at 320x568, 360x640, 360x800, 390x844, 430x932, 768x1024 and 1440x900. Checked initial, intermediate, near-expanded and expanded poses while video loading is held. Verified the visible artwork bounds for all lettering and the complete head/face. The existing very-short-screen natural-flow fallback retains a proportional portrait poster.
- Visually inspected the optimized source and rendered phone, tablet and desktop screenshots, including fully expanded portrait art, short-phone preview and static fallback.
- Desktop uses the original landscape thumbnail. Video sources and other page sections were not modified.

The tests use Chromium viewport emulation, not physical iOS/Android hardware. The portrait image was generated with the built-in image tool from the supplied landscape reference; the exact prompt is in image-prompt.md.
