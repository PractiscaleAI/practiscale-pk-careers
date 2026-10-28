# Hiring section spacing and pacing, revision 0.70

The user reported rushed scroll motion and supplied a short desktop screenshot. The app notification covering the bottom of that screenshot is outside the website.

## Changes

- Native scroll travel increases from 210svh to 400svh. For each of the first three steps, the reading hold increases from 30.45svh to 55svh and the 90-degree turn from 22.05svh to 45svh. Offer retains a full final interval. Scrub catch-up changes from 0.32s to 0.55s; latest native input always replaces the target.
- Align both lower headings by their top edge instead of bottom-aligning differently sized paragraphs. Bring the side content inward with a 1200px composition bound.
- Quiet background contours, remove repeated small labels/tagline, and center the scroll hint. Active steps gain a short mint rule and brighter body copy without lowering the contrast of inactive text.
- Move the pointer inward to give numbered stations more space. Active center text has a short, reduced-motion-aware entrance.
- Keep the scalar animation synchronized during layout refresh. Reproduced an intermittent zero-state dial while native progress was 0.56; removed unnecessary tween invalidation and explicitly synchronized refresh progress.
- Preserve all supplied hiring descriptions and every other homepage section.

## Verification

- Production webpack build and TypeScript pass.
- report.json: 120/120 checks across eleven viewport/motion combinations, including 1505x692 from the user's screenshot, short desktop, tablet, phone, landscape and reduced motion. Includes heading alignment, footer clearance, no clipping/overflow, forward/reverse, rapid reversal, keyboard selection and scoped axe scans.
- edges.json: 16/16 checks for continuous pointer motion, 400px initial reading hold, increased scroll distance, responsive switching, reduced motion, founder pause, original section order and static/no-JavaScript behavior. Eight repeated motion-preference rebuilds retain native progress after the synchronization fix.
- Actual renders inspected at 1440x900, 1366x600, 1505x692 and 390x844, with tablet and short-phone views retained in the evidence folder.

Checks use local Chrome/emulated viewports; they are not physical Safari/iOS certification. No new media, dependencies or global animation behavior.

Preview: http://127.0.0.1:3000/?review=v070-hiring-refined#how-hiring-works
