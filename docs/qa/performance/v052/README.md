# Desktop fit and media loading, revision 0.52

The Who we are film remains desktop-only at widths of 1024px and above. Height-aware panel spacing replaces the fixed 620px veto and the fixed text offsets that also caused 686px-high windows to fall back. The opening is measured against both text blocks without reducing body text. Heading, opposite-corner paragraph and the centered video fit short desktop windows, and the same video expands into an exactly clipped 100vh window before scrubbing.

## Controlled loading comparison

These are single before/after runs against the local production server in isolated Chrome contexts. Both runs use a cold browser cache, 5 Mbps download, 80 ms latency and a 2x CPU slowdown. The initial observation window is twelve seconds after navigation, with no visitor scrolling. Values do not represent field Core Web Vitals, a physical phone benchmark or a live-host performance score.

| Measurement | Before | After |
| --- | ---: | ---: |
| Desktop initial hero-frame transfer | 4,863,546 bytes | 1,281,400 bytes |
| Desktop completed initial frame requests | 50 | 13 |
| Desktop jump from opening to final pose | 10,970 ms | 624 ms |
| Phone initial hero-frame transfer | 4,044,088 bytes | 439,406 bytes |
| Phone completed initial frame requests | 120 | 13 |
| Phone jump to final pose | 506 ms | 606 ms |
| Desktop total completed resource transfer in window | 5,860,999 bytes | 2,279,170 bytes |
| Phone total completed resource transfer in window | 4,809,050 bytes | 1,204,685 bytes |

Initial hero-frame transfer drops 73.7% on desktop and 89.1% on phone. The phone's final-frame latency was already low; this sample does not show a latency improvement there. See before.json and after.json for all recorded values and the fixed profile.

## What changed

The hero now fetches the requested frame first, then a small directional neighbour window, rather than immediately fetching the entire sequence through four workers. Two concurrent requests, stale-request cancellation, a 24-blob cap and eight decoded bitmaps bound network and memory work. Distant jumps prioritize the destination. Leaving the hero or hiding the document stops speculative requests. A stale decode cannot overwrite a newer target. All 120 frame URLs, original pixels, alpha, the accepted blink, final-pose hold and the Three.js renderer remain intact.

Versioned hero, brain and new film media have a one-year immutable browser cache policy. Mutable manifests retain revalidation. Future media changes must receive a new revision path rather than overwriting these URLs. Byte-range requests remain supported for film seeks.

## Office film preservation

office-scroll-v2.mp4 is 22,092,382 bytes, 27.8% smaller than the previous 30,585,604-byte delivery file. It is encoded directly from the unchanged Downloads original, with 1920x1080 resolution, 30 fps, all 950 frames, the original 31.666667-second duration, eight-frame keyframes, no B-frames and no audio. The previous delivery file is retained.

Full source-aligned SSIM is 0.989214. This is a lossy delivery encode, not pixel-identical output. Full decoding found 950 frames with continuous presentation timestamps at 1/30 seconds, no duplicated or dropped timestamps and no decoding errors. Original source SHA-256 is unchanged. Source-versus-delivery stills were inspected at frames 0, 240, 426, 645, 810 and 949, including reception signage, people and the embedded ending. No new imagery, facial regeneration, cuts or frame interpolation is used.

## Remaining costs

The original introduction timing, initial Three.js library cost, continuous visible career sculpture and laptop lighting/shadows are preserved. The office film still has a substantial 22.09 MB total delivery cost but loads near its desktop section and is omitted on phone/tablet. This iteration improves media delivery and bounded loading; it is not a claim that every performance cost has been eliminated. Browser viewport checks do not certify Safari, Firefox or physical hardware performance.

Functional regression evidence is saved alongside this file and in the homepage and section QA reports.

## Resize regression

Resize restoration uses the last stable scene owner recorded before viewport reflow. It must not capture a temporarily visible company film created by upstream pin changes. Record native scroll position without per-frame DOM geometry reads; cancel the temporary correction when navigation leaves the company scene. This prevents the company film from pulling the career section out of view after short-to-tall or phone-to-desktop resizing.
The initial full career suite exposed the defect while restoring 1440x900 after 320x480 and 1366x540 fallback layouts. Before/after traces are retained as resize-before-fix.json and resize-after-fix.json. The existing career resize assertion is retained unchanged.

## Fast scrolling and sudden reversals

The scroll position remains authoritative. Keep catch-up short, replace superseded targets immediately, and leave every section in the correct state when a visitor passes it quickly. Each section has one progress driver rather than an accumulating queue of entrance animations. Numeric scrub supplies a brief catch-up; blanket forced completion would change the authored reversible sequence. See [GSAP ScrollTrigger guidance](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

The film seeks toward the latest requested timestamp and holds a valid image while decoding. Rapid input can skip intermediate displayed views; all original source frames and their chronological mapping remain available. Forcing all frames to play after a quick flick would lag behind the visitor. See [MDN on video seeking](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime).

Favor layer movement and scaling, batch animation writes, measure layout during setup/resize, and pause offscreen work. More easing does not reduce the cost of a slow render. The remaining masks, scene shaders and video decoding still need real-device profiling. See [Google's animation performance guidance](https://web.dev/articles/animations-guide).

The new qa-fast-scroll.cjs checks rapid jumps and immediate reversals on desktop 1440x900 and phone 390x844. All sixteen checks pass: original hero endpoints, current film timestamp, active career card, current earnings record and no horizontal overflow. Burst-plus-settlement times in the local run were 124-642ms. These are destination-correctness and catch-up observations, not a 60fps guarantee or a physical-device benchmark. Raw results are in fast-scroll/report.json.
