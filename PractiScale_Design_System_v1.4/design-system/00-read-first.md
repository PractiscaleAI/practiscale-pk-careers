# Read first: fixed identity, open layouts

Edition 1.4 / 19 October 2026. This is the implementation companion to the revised PractiScale brand book.

**Website designs and layouts are not final.** Apply this identity to the design later selected by the user. Every composition, component arrangement, and code specimen is illustrative unless the user explicitly selects it.

## Decision authority

| Status | Meaning | How to act |
| --- | --- | --- |
| Fixed brand rule | Original logo, exact palette, semantic colors, font roles, primary CTA identity, strategy and voice | Carry into every selected design. A current explicit user change can override an older guideline. |
| Adaptable default | Type-scale sizes, grid, gutters, spacing, non-CTA radii, breakpoints, timings | Adapt to actual content and the selected design while preserving readability and fixed component rules. |
| Illustration | Sample hero, cards, diagrams, component arrangement, test fixture | Demonstrates a rule; does not approve a page layout. |
| Pending design | Final structure, section order, navigation arrangement, crops, application flow and motion | Use the user's selected design. If no selection exists, label concepts as proposals. |
| Facts pending | Story placeholders, pay, roles, shifts, response times, proof and photographs | Publish only verified company information and consented real assets. |

## Workflow for an AI agent

1. Read the current brief and selected visual reference.
2. Use that reference for composition. Apply this system for PractiScale identity.
3. Map Sora to headings, Manrope to reading and controls, JetBrains Mono to data and overlines, and Noto Nastaliq Urdu to Urdu.
4. Use exact semantic colors from `tokens.json`. Generate CSS with `python tools/build_tokens.py`.
5. Adapt layout defaults; retain mobile paragraphs at least 16px, readable line spacing, and the fixed CTA specifications.
6. Check the actual foreground/background pairs, every button state, logo at actual size, mobile wrapping, zoom, keyboard focus, imagery overlays, and reduced motion.
7. Report which choices are fixed, adapted, proposed, or awaiting evidence. A brand-compliant concept is not an approved layout.

A selected layout does not silently replace the logo, palette, fonts, or CTA. Document material departures requested by the user; clarify only ambiguous conflicts. Book cover geometry and stepped lines are editorial examples, not required website graphics.

## Scope of evidence

Source validation and fixture tests establish consistency of these files and reusable components. They do not certify a later-selected website, assistive-technology behavior, print proof, or company claim. See [verification/preflight.json](verification/preflight.json) and [verification/component-checks.json](verification/component-checks.json).
