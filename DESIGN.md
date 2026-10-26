# PractiScale design context

Marketing website. Current authority is the user's accepted work, Edition 1.4, and docs/PRD.md + docs/TRD.md revision 0.53. Keep existing hero, navigation, original introduction, problem-card choreography and career-card exchange intact.

## Visual roles

- Deep Teal #134143 for identity and strong surfaces; #1C5052 / #265F61 for depth.
- Fog #F3F6F6 and White #FFFFFF for reading surfaces and model contrast.
- Mint #9BE3D6 for restrained detail; #20BFA8 and #0D77A9 retain the existing CTA gradient.
- Proof Amber #F5B041 for verified milestones and earnings, not general decoration.
- 60/30/10 is a page-level emphasis principle, not a pixel quota for every section.
- Sora 600 for headings and figures, Manrope for body copy, JetBrains Mono for metadata. Reuse the established responsive type, gutter and control variables. Post-hero H2 tracking is -0.03em and card/metric tracking is -0.025em. Keep the approved hero type unchanged.

## Current composition

Hero, The Problem, the desktop Who we are film, Two Ways In and laptop earnings are the five active homepage sections. The user removed the separate illustrative campus section. Preserve its sources and exports as historical work without mounting its renderer. The four company facts now appear once, at the bottom of the laptop opening. Labels stay at least 16px and order stays healthcare, team, candidates, publications.

The accepted front-facing laptop follows. Copy and the closed device start side by side on desktop, stacked on portrait devices. The four facts sit below the opening copy and closed device, in four desktop columns or a two-column portrait grid. A synchronized whole-group departure moves the intro upward and facts downward, clearing the device before overlap as scrolling expands the scene, opens the lid, presents ten qualified earnings records and the total, then closes it. Preserve the laptop's geometry and fixed front-facing orientation. The homepage is silent. Do not restore sound controls, sound synthesis, the outside earnings caption or the outside record counter. No visible detail table, added progress bar or prototype navigation.

## Behaviour and verification

Use existing GSAP/Three.js, native page input and deterministic reversible motion. Server-render facts and copy. Posters remain available during loading, reduced motion, Save-Data, no JavaScript or renderer failure. Release pins for content that cannot fit. Only explicit keyboard skip links move focus. Clean up scoped observers, listeners and GPU resources.

Inspect real desktop/tablet/phone renders and the transition states as well as functional results. Chromium emulation does not certify Safari, physical-device speed or physical-device performance. See docs/proof-band/README.md and QA.md for source, exports, evidence and remaining checks.

## Desktop company film

The diagonal backdrop keeps shared side gutters and 24px corners, with equal height-aware vertical insets from 16px on short windows to 96px on tall ones. The heading stays upper-left with at least 112px navigation clearance. The paragraph remains lower-right, 32px inside the backdrop. Keep 16px body text, shared heading sizes and a 24-32px measured clearance from both blocks to the opening video. Keep its exact horizontal and vertical center, proportional scaling and full 100vh expansion. Use content fit rather than a fixed 620px height cutoff: a 240px source-aspect opening must fit, otherwise release to native flow. This keeps 1536x550, 1920x686, 1366x600 and 1024x600 desktop windows in the intended scroll experience. Static players have a 72svh height bound. Below 1024px the section remains omitted. Preserve the approved Deep Teal / #E6ECEC diagonal. Both halves open with the centered film before it advances, and close on reverse scroll. Keep opposite-corner supplied copy, silent playback and the keyboard skip.

## Loading and source preservation

The hero retains all 120 original frame URLs, the accepted blink, the Three.js shader and exact scroll-to-frame mapping. Two requests prioritize the current frame, then a directional window of twelve ahead and four behind. Cancel stale speculative requests on distant jumps, outside the hero or in hidden tabs. Keep at most 24 compressed frames and an eight-bitmap directional lookahead with two concurrent decodes. Prepare decoded neighbours ahead of demand. A completed frame may display if it moves the shown index toward the latest target; a late completion must never move away from that target or overwrite a closer frame. Reuse one GPU texture with linear sampling and no mipmap rebuilding. Close evicted bitmaps and all pending results on disposal. Versioned media paths receive immutable browser caching; mutable manifests do not. New media revisions require new filenames. The original introduction and all other section motion remain intact.

A new delivery encode, office-scroll-v2.mp4, is made directly from the unchanged Downloads source: 1920x1080, 30fps, all 950 frames, 31.666667 seconds, H.264 High/yuv420p, CRF24, eight-frame keyframes, no B-frames, fast-start metadata and no audio. It is 22,092,382 bytes versus the previous 30,585,604 bytes, a 27.8% reduction. Full source-aligned SSIM is 0.989214; all 950 decoded presentation timestamps remain continuous at 1/30 seconds with zero decode errors. Original source checksum is unchanged. The former encode is retained. No content, frame order, cuts, faces or signage are regenerated or edited. See public/media/who-we-are/manifest.json and docs/qa/performance/v052.

Resize restoration uses the last stable scene owner recorded before viewport reflow. It must not capture a temporarily visible company film created by upstream pin changes. Record native scroll position without per-frame DOM geometry reads; cancel the temporary correction when navigation leaves the company scene. This prevents the company film from pulling the career section out of view after short-to-tall or phone-to-desktop resizing.
