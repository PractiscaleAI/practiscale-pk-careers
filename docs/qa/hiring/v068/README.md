# Hiring compass, revision 0.68

Added the supplied four-step hiring process after the founder film. Inspired by the user's circular instrument image: a centered ring, clockwise pointer, accumulated mint arc and four surrounding stations. Desktop displays all descriptions; tablet and phone show active copy below labeled stations. Native scrolling is reversible with reading holds. Keyboard and direct station selection remain available. Reduced motion, short screens and no JavaScript retain all four descriptions in natural flow.

## Verification

- Production webpack build and TypeScript passed.
- `node scripts/qa-hiring.cjs`: 107/107 checks passed across 1440x900, 1366x600, 1920x686, 1024x768, 768x1024, 390x844, 360x740, 320x568, 844x390 and reduced-motion phone.
- Actual screenshots inspected on desktop, short desktop, narrow desktop, tablet, phone and short-phone fallback. Fixed inherited paragraph centering, crowded short-desktop annotations, accessibility name separators, and static fallback navigation clearance.
- Forward/reverse scroll, rapid reversal, direct selection, keyboard activation, heading clearance, description collisions and horizontal overflow checked. Scoped axe scans have no violations.
- `qa-hiring-edges.cjs` checks continuous presented pointer motion, resize across layouts, live reduced-motion changes, founder playback paused offscreen, original section order, server-rendered no-JavaScript copy and static phone navigation clearance. See edges.json for measurements and final results.
- Original page component changes are limited to importing and appending HiringSection. No earlier component or global stylesheet was edited. No new package, network media, audio or WebGL scene.

These are local desktop Chrome and Chromium emulation checks, not physical iPhone/Safari certification. The whole site's earlier performance and visual quality are not recertified by these scoped checks. Final static-only padding correction was verified with the edge suite after the full responsive suite passed.

Preview: http://127.0.0.1:3000/?review=v068-hiring#how-hiring-works
