# PractiScale hero composition QC

These rules were explicitly requested by the user after the portrait/card overlap and mobile text-width misses on 20 October 2026. They are saved in project AGENTS.md and a persistent memory update note.

- Run npm.cmd run test:composition for hero layout or media changes. It checks the visible alpha envelope across every source frame, not just portrait DOM rectangles. Desktop/tablet cards require at least 16px of clear space from the visible character, including jacket/shoulders.
- Keep the full head inside the hero and clear of supporting copy. Mobile cards may overlay the torso as part of the established phone composition, but must not cover the face or reading/action area.
- Phone paragraphs must use the available content column. Avoid a lone final word and retain the approved two-line headline with balanced responsive type. Content-sized buttons and deliberate gutters do not need to fill the width.
- Inspect actual starting/frontal/scroll renders on desktop, narrow desktop, tablet and phone. Include 1192px and 530px cases, short windows and enlarged text. Passing automated counts alone is insufficient evidence of professional composition.
- Keep the accepted video and its natural blink. These layout fixes require no regeneration credits.

The new regression failed on 13 concrete checks before the fix and now passes all 54 composition assertions, including every-frame silhouette coverage. The production build and all 150 focused composition, responsive, browser/accessibility and motion checks passed. Actual starting and ending renders were captured at nine viewport sizes and visually reviewed.

Current mobile acceptance: preserve every CTA label, pin only the portrait after the face fits inside the viewport, keep the full face clear of the fixed header and lower fade throughout the turn, then release into the proof row. Refresh geometry after the original preloader reveal. Run npm.cmd run test:mobile-hero; it sweeps every CSS width from 320 to 430, checks exact wording, short/tall phone motion, menu focus and text reflow.

Lighting/CTA regression: run npm.cmd run test:hero-finish after changing portrait backgrounds or the next-chapter control. The atmospheric light must fade to transparent at its clipped bounds without masking the face. Check actual screenshot pixels in initial and pinned states. The secondary CTA now uses a 56px outlined circle at the opposite phone gutter; preserve its exact copy and clear space under enlarged text.

Current CTA requirement supersedes the earlier 56px overlay: keep the caption/label and 44px icon in separate grid columns with 16px clearance. Check caption and label rectangles against the icon on desktop/tablet and mobile, plus enlarged text; checking only the SVG center is insufficient. The complete group remains one enquiry link.
