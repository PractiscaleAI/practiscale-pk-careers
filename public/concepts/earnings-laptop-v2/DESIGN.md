# PractiScale earnings laptop preview

This isolated concept replaces the rejected folder metaphor with a procedural Three.js laptop. Preview route: `/concepts/earnings-laptop-v2/index.html`. The homepage and its 1,200 supplied V7 frames remain separate.

## Accepted direction

- Keep the laptop symmetrical, with the screen facing the visitor. Camera X and model yaw remain zero. The cursor moves only the background field.
- Native vertical scroll expands the scene, opens the physical lid, reveals the ten earnings records on its screen, holds the qualified combined total, then closes the lid. Reverse scroll reverses the same deterministic sequence.
- Preserve the exact original names, roles, amounts, periods and order from `src/lib/earnings-content.ts`. The combined Rs 9,596,865 covers different reporting periods.
- Deep Teal #134143 is the primary surface; Fog #F3F6F6 supplies the reading section; mint #9BE3D6 and restrained growth/blue tones support the existing page palette. Amber #F5B041 appears only in the confirmed combined total. Respect the site's overall 60/30/10 emphasis.
- Use local Sora, Manrope and JetBrains Mono. Hardware has a cool metal chassis, dark keycaps, actual hinge, keyboard, trackpad, bezel and camera. Figures belong to a dynamic texture on the actual 3D screen.
- Use one quiet cursor-responsive contour field. No decorative floating objects, fake banking evidence, extra progress bars, or autonomous number changes.

## Interaction and fallback

Sound is opt-in. Enabling sound plays an immediate confirmation; Test sound is an explicit repeatable preview. Sound pauses when hidden or outside the scene. All records are present in static HTML. Reduced motion, Save-Data or unavailable WebGL release the long scroll rail. Rendering is invalidated by input rather than running continuously.

The user removed the visible details table and its heading. Keep the ten factual records in a visually hidden semantic list for assistive technology. The animation now releases straight into the preview footer. The skip link targets that visible footer.

Use the user's requested sound language: soft airy whoosh for lid opening/closing and a soft whoosh or airy swish for text movement. Opening is a 580 ms rising noise sweep; closing is a 500 ms falling noise sweep. Text entrances use a lighter 230 ms airy swish, with a 300 ms variation for the total. No pitched oscillator, mechanical tick or impact layer remains active.

The canvas and cue controller share the exact movement calculations. Swishes start during the text entrance, after the actual Three.js frame commits. Lid whooshes derive from physical hinge-angle changes, including reverse scrolling. Small jitter and stationary pointer frames cannot replay them. Resizing or returning to the tab establishes a silent baseline. Rapid changes replace the preceding voice rather than queue skipped transitions. Audio scheduling correlates the output clock with the frame timestamp where supported. Device and wireless-output latency still require real-device validation.

## Previous laptop framing verification, 22 October 2026

The confirming local Chromium round passed 75 checks at 1440x900, 390x844, 320x568, 768x1024 and 844x390, including all ten records, reverse scroll, complete device framing, zero yaw, closing, pointer response, accessibility, no-JS, no-WebGL and reduced-motion fallbacks. Screenshots were visually inspected. Audio peak/RMS measurements after the master showed real signal; the confirmation peak was 0.224 and muted output was zero. These measurements establish generated output, not the user's speaker volume or hardware mute state. Physical-device and Safari verification remain outstanding.

Evidence is in the staging folder's `qc/report.json` and screenshots. `qc.cjs` runs against the local server; `?qc=1` exposes only local diagnostic helpers.

## Previous details removal and tick verification, 22 October 2026

`check-update.mjs` passed 12 focused source, deterministic motion and offline audio checks. It verified table removal, all ten accessible records, one cue per forward/reverse number presentation, fast jumps without intermediate cues, duplicate suppression, silent resize/resume baselines, mute/pause behaviour and actual generated samples at 44.1/48 kHz. The replacement tick peaks at 0.196/0.192 after master gain and fades to silence. These are offline signal and scheduling checks, not a fresh browser or speaker-output pass. Browser control was blocked by the URL security policy in the preceding preview turn, so no alternate browser path was used. Evidence: `qc/update-report.json` and `qc/number-switch.wav`.

## Airy sound revision, 23 October 2026

The latest `check-update.mjs` run passed 25 source, deterministic motion and offline audio checks. Lid opening/closing, reversal, jitter suppression, text-entrance timing, mute/pause and table absence are covered. All four exact generated buffers were checked at 44.1 and 48 kHz for safe levels, zero endpoints and absence of periodic tones. Peak signal after master gain is 0.176 for opening, 0.160 for closing, 0.134 for text and 0.143 for the total. This is offline verification; live browser and speaker checks remain unverified. `qc/update-report.json` now records this latest run.

The standalone laptop preview HTML contains no visible details section or table. Keep version 4 asset URLs in the preview to avoid reusing older loaded scripts. The source homepage and archived folder prototype remain separate from this laptop preview.
