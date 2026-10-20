<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Visual quality before completion

Independently inspect rendered desktop, tablet and mobile layouts and relevant scroll/menu states before declaring UI changes complete. Fix visible alignment, spacing, typography, clipping and hierarchy issues within the authorized scope without asking the user to perform QC. Use functional checks as supporting evidence, then inspect actual renders. Preserve supplied artwork, explicit user references and the current PRD/TRD.

## Hero composition regression rules - user requested 20 October 2026

- For hero layout or portrait changes, run `npm.cmd run test:composition` as well as the relevant existing layout, browser and motion suites. The composition test projects the visible alpha envelope of every source frame into the actual layout; desktop/tablet trust cards require at least 16px separation from the visible portrait, including jacket/shoulders. DOM rectangle checks alone do not prove this.
- Preserve the full head, header clearance and separation from supporting copy when moving or scaling the portrait. Check starting, turning and frontal poses at desktop, narrow desktop, tablet and phone widths, including 1192px and 530px cases and short screens. The phone trust-card treatment may intentionally overlay the torso, but never the face or reading/action area.
- Phone paragraphs must use their available content column instead of inherited narrow character limits, and avoid a single orphaned final word. Keep the approved two-line heading and balanced responsive type; intentional gutters and content-sized buttons remain appropriate.
- Independently inspect actual rendered screenshots before reporting visual QC complete. Passing functional, accessibility or geometry tests is supporting evidence and is not proof of professional composition. Add a focused regression for a defect the user identifies before marking its fix complete.
- The user accepted the natural blink in the current Wan 3.0 Prime source. Preserve it and do not spend further generation credits without authorization.
