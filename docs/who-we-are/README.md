# Desktop Who we are film

Revision 0.52. The supplied film appears after The Problem and before Two Ways In. It uses one centered video window, without stacked images, a white card border or a caption footer. No new media was generated.

## Content and composition

Eyebrow: Who we are. Heading: Step inside PractiScale.

Body: PractiScale helps US healthcare businesses grow through professional referral relationships. We find the right referral partners in each client's area, reach out, qualify them and set up introductions. All of it is done here, by people we trained.

The diagonal split uses Deep Teal and approved light secondary surface #E6ECEC inside a 24px rounded backdrop. Shared side gutters and symmetric 16-96px height-aware vertical insets keep the preceding Fog boundary clean. The heading sits upper-left and the complete paragraph sits lower-right on the neutral half, with matching side offsets and height-aware corner spacing. The single 16:9 video is centered on both axes. Both diagonal halves open behind it, then close again on reverse scroll. The rejected 0.49 sideways expansion is removed.

The source-aspect surface uses uniform scale with its horizontal and vertical center fixed at the viewport center. Its opening clears the measured heading and paragraph by a measured 24-32px gap, and the surrounding backdrop is symmetric around the same center. A separate symmetric clip bounds the visible window to exactly 100vh at completion. The source image covers that window without side bars or stretching. Other viewport ratios crop source edges; rendered key people, signs and final vision must remain legible. The original media file and chronological mapping remain unchanged.

| Progress   | Behaviour                                               |
| ---------- | ------------------------------------------------------- |
| 0-0.045    | Heading and paragraph mask away at full contrast        |
| 0-0.19     | Single video window expands within the viewport         |
| 0.02-0.19  | Both diagonal halves move apart by 0.78 viewport widths |
| 0.19-0.205 | Expanded first frame holds                              |
| 0.205-0.94 | Full chronological film mapping                         |
| 0.94-1     | Existing 5,000-person future-vision ending holds        |

Native input remains browser-owned, smoothed with a 0.55-second GSAP scrub. The homepage stays silent. Reverse scrolling follows the same source mapping. Widths below 1024px omit the section and do not request the desktop MP4. Reduced motion, Save-Data, genuinely insufficient/enlarged layouts and failure release extended travel to a native video/poster layout. Keyboard skip reaches the following career heading. Focus colours match the light copy surface and dark controls separately.

## Media preservation

A new delivery encode, office-scroll-v2.mp4, is made directly from the unchanged Downloads source: 1920x1080, 30fps, all 950 frames, 31.666667 seconds, H.264 High/yuv420p, CRF24, eight-frame keyframes, no B-frames, fast-start metadata and no audio. It is 22,092,382 bytes versus the previous 30,585,604 bytes, a 27.8% reduction. Full source-aligned SSIM is 0.989214; all 950 decoded presentation timestamps remain continuous at 1/30 seconds with zero decode errors. Original source checksum is unchanged. The former encode is retained. No content, frame order, cuts, faces or signage are regenerated or edited. See public/media/who-we-are/manifest.json and docs/qa/performance/v052.

## Verification

Current evidence is under docs/qa/who-we-are/v052. The focused checks cover exact supplied copy, opposite-corner alignment, clearance to both text blocks, horizontal and vertical centering throughout zoom, entry-edge pixel colour, rounded inset diagonal and palette neutral, source order, forward/reverse seeking, background synchronization, bounded bar-free 100vh video, active resize, native input, keyboard skip, mobile omission and recovery. Screenshots cover ordinary and ultrawide desktops, entry, expansion, office and final vision, with fallback and phone/tablet regressions. Exact counts and failures come from the saved reports.

Run with the preview on port 3000:

```powershell
node scripts/qa-who-we-are.cjs
node scripts/qa-who-we-are.cjs native
```

Chromium viewport emulation does not certify physical devices, Safari/Firefox or hardware-specific speed. Mobile film adaptation and deployment remain outside this request.

## Short desktop fit

The diagonal backdrop keeps shared side gutters and 24px corners, with equal height-aware vertical insets from 16px on short windows to 96px on tall ones. The heading stays upper-left with at least 112px navigation clearance. The paragraph remains lower-right, 32px inside the backdrop. Keep 16px body text, shared heading sizes and a 24-32px measured clearance from both blocks to the opening video. Keep its exact horizontal and vertical center, proportional scaling and full 100vh expansion. Use content fit rather than a fixed 620px height cutoff: a 240px source-aspect opening must fit, otherwise release to native flow. This keeps 1536x550, 1920x686, 1366x600 and 1024x600 desktop windows in the intended scroll experience. Static players have a 72svh height bound. Below 1024px the section remains omitted.

Resize restoration uses the last stable scene owner recorded before viewport reflow. It must not capture a temporarily visible company film created by upstream pin changes. Record native scroll position without per-frame DOM geometry reads; cancel the temporary correction when navigation leaves the company scene. This prevents the company film from pulling the career section out of view after short-to-tall or phone-to-desktop resizing.
