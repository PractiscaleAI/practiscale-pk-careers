# Who we are composition refinement

User scope: reduce paragraph dominance and remove awkward diagonal tangencies at the video corners.

Runtime changes are confined to who-we-are.module.css. The motion-mode paragraph now uses muted text, a 500px maximum width and responsive 15-16px type. Static fallback body text remains unchanged. The two complementary diagonal polygons share endpoints based on viewport height, crossing the centered opening video's top/bottom edges at approximately 64%/36% instead of approaching its corners on wider screens. The single-video center, media, player and scroll timings are unchanged.

Verification:

- Production build, TypeScript, formatting and diff whitespace checks passed.
- `node scripts/qa-who-we-are.cjs`: 273 checks passed, zero failed checks or runtime errors. Includes ten desktop dimensions, corner-crossing clearance, supporting-copy measure, exact text, centered video, forward/reverse split and zoom, fullscreen bounds, responsive restoration, mobile omission, reduced motion, no JavaScript, Save-Data, failure recovery and accessibility.
- Inspected actual 1440x900, 1536x550 and 1024x600 opening screenshots and the expanding split at 10% progress. Reviewed tablet/phone captures to confirm the desktop-only film remains omitted.
- Automated geometry verifies both diagonal crossings remain at least 30% of the video width from the closest corner. Evidence and screenshots are in main/.

This is local Chromium evidence; physical-device/browser certification is outside this targeted change.

Preview: http://127.0.0.1:3000/?review=v057-who-balance#who-we-are
