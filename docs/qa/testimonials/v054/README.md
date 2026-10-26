# Testimonials, revision 0.54

## Page review and placement

Reviewed the five existing homepage sections, their live desktop compositions, design tokens, content authorities and motion architecture before implementation. The page already includes a pinned CEO sequence, problem-card choreography, a centered office film, a career exchange and the earnings laptop. Testimonials now follow the laptop in normal flow: the earnings evidence leads into the people describing it. No earlier motion component or global style was changed.

The new light surface balances the existing deep-teal scenes under the page-level 60/30/10 emphasis principle. It reuses the established heading scale, Sora/Manrope/Mono family roles and gutters. The supplied reference informs the centered horizontal cards, neighboring previews, drag-to-settle behavior and cursor follower. The four decorative SVG motifs suggest growth, an open ceiling, career milestones and support. No portraits, source links, ratings or extra financial claims were invented. All four quotes retain the user's wording.

## Verification

- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed on the final implementation; production preview running at port 3000.
- `npm.cmd run test:testimonials`: 59 checks passed, zero runtime errors. Responsive geometry across nine desktop/tablet/phone sizes, all four quotes, forward/reverse drag, interrupted transitions, keyboard, selectors, resizing, reduced motion, native touch swiping, vertical touch scrolling and no-JavaScript access.
- `npm.cmd run test:browser`: 22 checks passed, zero runtime errors or automated accessibility violations. Saved as `homepage-regression.json`.
- `npm.cmd run test:earnings`: 134 checks passed, zero errors. Saved as `earnings-regression.json`; historical QA snapshots were restored after preserving this run's evidence.
- `node scripts/qa-testimonials-production.cjs`: 7 additional production checks passed. Cancelled gestures settle, endpoints resist overscroll, no animation writes occur while idle, and production pages render at desktop/tablet/phone widths.
- Independently inspected desktop, short desktop, tablet, 390px and 320px phone renders, plus dragging, final-card, touch and production states. Short screens retain native page scrolling rather than clipping the quote to a fixed viewport.
- Contrast QC initially caught an overly faded neighbor. Increased minimum preview opacity and removed the redundant per-card index. Current scoped and homepage accessibility scans pass.
- `git diff --check` and no-em-dash check on the new copy: passed.

## Scope and limits

The generic premium static auditor reports one existing ownership-documentation issue in `src/components/job-board.tsx:33`, concerning its native select. The testimonial implementation adds no select control; that unrelated jobs workflow remains unchanged. See `static-audit.json`. This is not a claim that the complete website has passed every production audit.

Browser evidence uses local Chromium and touch emulation. Physical iOS/Safari/Android testing has not been performed. No new images, videos, network dependencies or GPU scene were added for this section. Initials identify speakers until approved portraits are available.

Preview: http://127.0.0.1:3000/?review=v054-testimonials#testimonials
