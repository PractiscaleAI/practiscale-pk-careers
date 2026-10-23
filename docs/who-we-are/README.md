# Desktop Who we are film

Revision 0.51. The supplied film appears after The Problem and before Two Ways In. It uses one centered video window, without stacked images, a white card border or a caption footer. No new media was generated.

## Content and composition

Eyebrow: Who we are. Heading: Step inside PractiScale.

Body: PractiScale helps US healthcare businesses grow through professional referral relationships. We find the right referral partners in each client's area, reach out, qualify them and set up introductions. All of it is done here, by people we trained.

The diagonal split uses Deep Teal and approved light secondary surface #E6ECEC inside a 24px rounded backdrop. Shared side gutters and symmetric 96px vertical insets keep the preceding Fog boundary clean. The heading sits upper-left and the complete paragraph sits lower-right on the neutral half, with matching side offsets and 128px top/bottom offsets. The single 16:9 video is centered on both axes. Both diagonal halves open behind it, then close again on reverse scroll. The rejected 0.49 sideways expansion is removed.

The source-aspect surface uses uniform scale with its horizontal and vertical center fixed at the viewport center. Its opening clears the measured heading and paragraph by at least 32px, and the surrounding backdrop is symmetric around the same center. A separate symmetric clip bounds the visible window to exactly 100vh at completion. The source image covers that window without side bars or stretching. Other viewport ratios crop source edges; rendered key people, signs and final vision must remain legible. The original media file and chronological mapping remain unchanged.

| Progress   | Behaviour                                               |
| ---------- | ------------------------------------------------------- |
| 0-0.045    | Heading and paragraph mask away at full contrast        |
| 0-0.19     | Single video window expands within the viewport         |
| 0.02-0.19  | Both diagonal halves move apart by 0.78 viewport widths |
| 0.19-0.205 | Expanded first frame holds                              |
| 0.205-0.94 | Full chronological film mapping                         |
| 0.94-1     | Existing 5,000-person future-vision ending holds        |

Native input remains browser-owned, smoothed with a 0.55-second GSAP scrub. The homepage stays silent. Reverse scrolling follows the same source mapping. Widths below 1024px omit the section and do not request the desktop MP4. Reduced motion, Save-Data, short/enlarged layouts and failure release extended travel to a native video/poster layout. Keyboard skip reaches the following career heading. Focus colours match the light copy surface and dark controls separately.

## Media preservation

The original Downloads file is untouched. The existing lossy H.264 High/yuv420p web encode remains 1920x1080, 30fps, 950 frames and 31.666667 seconds, with eight-frame keyframes, no B-frames, fast-start metadata and no audio. Earlier full decode found no duplicate/dropped frames or decoding errors. This revision changes layout/player logic only and does not re-encode the file. Checksums and display treatment are in public/media/who-we-are/manifest.json.

## Verification

Current evidence is under docs/qa/who-we-are/v051. The focused checks cover exact supplied copy, opposite-corner alignment, clearance to both text blocks, horizontal and vertical centering throughout zoom, entry-edge pixel colour, rounded inset diagonal and palette neutral, source order, forward/reverse seeking, background synchronization, bounded bar-free 100vh video, active resize, native input, keyboard skip, mobile omission and recovery. Screenshots cover ordinary and ultrawide desktops, entry, expansion, office and final vision, with fallback and phone/tablet regressions. Exact counts and failures come from the saved reports.

Run with the preview on port 3000:

```powershell
node scripts/qa-who-we-are.cjs
node scripts/qa-who-we-are.cjs native
```

Chromium viewport emulation does not certify physical devices, Safari/Firefox or hardware-specific speed. Mobile film adaptation and deployment remain outside this request.
