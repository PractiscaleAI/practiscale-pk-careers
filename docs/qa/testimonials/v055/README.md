# Testimonial refinement, revision 0.55

The user requested a more polished testimonial section and removal of the circular previous/next controls. The original supplied quotes, names, ordering and drag/swipe choreography remain intact.

## Changes

- Removed both navigation arrows and centered the four named selectors, retaining 44px targets, keyboard navigation and live selection announcements.
- Replaced the floating cursor with native grab/grabbing cursors. It no longer covers the reading area or needs per-pointer-move geometry reads.
- Gave the centered card a white surface and restrained shadow. Neighboring surfaces and ornaments recede without fading the text or initials below readable contrast.
- Reduced motifs to small corner accents, with at least 12px measured clearance from the quote paragraph across the tested widths and all four cards.
- Added a fine attribution divider and deep-teal initials badges. No portraits, financial claims or endorsements were invented.
- Preserved all preceding homepage sections and global styles.

## Verification

- Production build and TypeScript checks passed.
- `npm.cmd run test:testimonials`: 59 checks passed, zero errors. Covers exact content, layout at nine sizes from 320px to 1920px, all four slides, ornament clearance, removal of arrows/cursor, rapid input, forward/reverse drag, keyboard, selectors, resize, reduced motion, native touch swiping/vertical scrolling, no-JavaScript fallback and scoped accessibility.
- `npm.cmd run test:browser`: 22 homepage checks passed, zero runtime errors or automated accessibility violations. Evidence: `homepage-regression.json`.
- `node scripts/qa-testimonials-production.cjs`: 7 production checks passed, including cancellation, bounded edge resistance, no idle animation writes and desktop/tablet/phone rendering.
- Independently inspected desktop, short desktop, tablet, narrow phone, touch and selected-card screenshots. These are local Chromium and emulated-touch results, not physical-device Safari/Android certification.
- `git diff --check` and the no-em-dash check on testimonial copy passed.

Contrast review found that whole-card fading weakened the new dark initials badge. Surface/ornament emphasis now changes independently, with full-opacity text and badges. The 320px clearance check also caught an ornament entering the quote band; responsive ornament sizing now preserves at least 12px clearance.

Preview: http://127.0.0.1:3000/?review=v055-refined#testimonials
