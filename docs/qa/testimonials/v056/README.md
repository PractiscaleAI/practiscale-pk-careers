# Scroll testimonials and large motifs, revision 0.56

The user requested vertical-scroll advancement and large background visual elements matching the supplied reference scale. This replaces the earlier corner-motif treatment and manual-only interaction contract.

## Result

- A native sticky reading stage advances the four supplied quotes on downward scroll and reverses on upward scroll. Each quote has a reading hold; fast input replaces the destination without queuing transitions or trapping the wheel.
- Drag/swipe, four named selectors and Left/Right/Home/End remain available and synchronize the page's reading position. No previous/next arrows, floating cursor, autoplay or sound.
- Large centered mint and soft-blue motifs sit behind fully opaque deep-teal quotes. Pale tinted card surfaces balance the larger shapes. Original words, names and roles are unchanged.
- Short screens allow the heading to leave before the complete carousel pins. Reduced motion or insufficient space releases the rail. No-JavaScript retains native horizontal scrolling and all four complete quotes.
- Resize handling preserves the reading state and ignores browser scroll anchoring during viewport reflow. Existing hero, film, career and earnings component source files were not changed.

## Verification

- Production build and TypeScript checks passed; formatter and whitespace checks passed.
- `node scripts/qa-testimonials.cjs`: 59 checks passed, zero errors. Nine layout sizes, all quotes, full text/attribution fit, large motif dimensions, keyboard, drag/swipe, rapid input, resize, reduced motion, no-JavaScript and scoped accessibility.
- `node scripts/qa-testimonials-scroll.cjs`: 76 checks passed, zero errors. Real wheel input at six viewport sizes from 320x568 through 1536x686 and 1440x900; forward/reverse progression, rapid reversal, centered endpoints, full card/control visibility during holds, native document-end access, four repeated phone/desktop resizes and reduced-motion release.
- `node scripts/qa-testimonials-production.cjs`: seven checks passed, including cancellation, bounded resistance and zero animation writes at rest.
- `npm.cmd run test:browser`: 22 homepage checks passed with zero runtime errors or automated accessibility violations. Report preserved as `homepage-regression.json`.
- Inspected actual desktop, short-desktop, tablet and phone screenshots, including all four motif variants and short-phone pinned reading poses. Local Chromium and emulated touch evidence does not certify physical Safari/Android behavior.

The original test requiring a 12px gap between the small ornament and the quote was replaced because the new user reference explicitly places large art behind the text. Tests now check motif coverage, decorative semantics, full text fit and accessibility rather than enforcing the superseded design.

Preview: http://127.0.0.1:3000/?review=v056-scroll#testimonials
