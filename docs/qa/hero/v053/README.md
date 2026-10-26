# CEO hero continuity fix, revision 0.53

The 0.52 loader decoded only the requested frame and painted it only if its index still exactly matched the moving scroll target. On a continuous scroll, valid decoded frames could be discarded repeatedly. The portrait held an old pose, then jumped once scrolling slowed or stopped. It also allocated a new GPU texture and rebuilt mipmaps for each rendered image. The previous destination-only checks did not detect continuity starvation.

The fix prepares a directional window of up to eight decoded bitmaps with two concurrent decoders. It paints the closest ready frame between the displayed index and the latest target, so a useful intermediate image is not discarded solely because the target advanced. Late completions cannot reverse progress toward that target or overwrite a closer image. Asynchronous completions are batched to one animation-frame callback. One persistent texture uses linear sampling without generating mipmaps.

All 120 approved source URLs, the accepted blink, alpha shader, colour space, DPR limit, original 0.65 scrub, final hold, native input, responsive geometry and introduction are retained. No new media was generated. The compressed loading window still uses two requests and at most 24 retained blobs; the idle hero requests 13 files rather than all 120. Decoded bitmaps are closed on eviction and disposal, including any results that arrive after cleanup.

## Measured comparison

before-profile.json and after-profile.json use the same isolated local Chrome profiler, new browser contexts, a settled introduction and four-second native-scroll sweeps from progress 0 to 0.84 and back. Frames are counted after WebGL render calls through changes to the portrait's frame attribute. Hold measurements include the initial and terminal portions of that sweep. This measures render submissions and update continuity, not physical display presentation times or a guaranteed frame rate on other devices. The extra 40ms case deliberately delays asynchronous decoding; it is a robustness simulation.

| Viewport | Added decode latency | Direction | Rendered updates before -> after | Longest hold, ms before -> after |
| -------- | -------------------- | --------- | -------------------------------- | -------------------------------- |
| 1440x900 | 0ms                  | forward   | 49 -> 114                        | 946 -> 84                        |
| 1440x900 | 0ms                  | reverse   | 80 -> 115                        | 541 -> 123                       |
| 1440x900 | 40ms                 | forward   | 0 -> 77                          | 4010 -> 129                      |
| 1440x900 | 40ms                 | reverse   | 5 -> 67                          | 3611 -> 140                      |
| 390x844  | 0ms                  | forward   | 106 -> 114                       | 103 -> 90                        |
| 390x844  | 0ms                  | reverse   | 115 -> 115                       | 75 -> 75                         |

The separate continuity regression also passed with 115 forward and 115 reverse updates on desktop, and 114 / 116 on phone in that run. Each case held eight live bitmaps with at most two decoders, allocated no additional playback textures, generated no mipmaps, and closed all bitmaps on context loss. These are single local runs with normal timing variation.

## Verification

Production build and TypeScript check passed. 374 checks passed across 9 sequential Chrome suites with no failed checks or runtime errors: continuity, motion, mobile hero, layout, composition, browser/accessibility, media loading, rapid scrolling and hero finish. See regression-summary.json and the individual reports. The rapid-scroll suite also checks the following company, career and earnings scenes after fast jumps.

The 21 captures in visuals/ were individually inspected for start, turning and frontal poses at 1440x900, 1920x686, 1192x720, 768x1024, 530x900, 390x844 and 320x568. Full heads remain visible, alpha edges remain clean, and desktop/tablet trust cards retain clearance. Phone captures start at the portrait's scroll trigger, after the preceding reading content has begun leaving the viewport. Text passing a viewport boundary during native scrolling is not clipping of its content container.

Physical-device and Safari testing are not established by these Chrome checks. The unchanged source is 30fps; this change does not synthesize extra source frames.
