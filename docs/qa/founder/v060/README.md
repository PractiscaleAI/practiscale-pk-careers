# Founder section v060

## Delivered

The former content-pending Background Lines section now contains the user's founder story, centered above the supplied interview. The final sentence was tightened to "His next goal: 5,000 careers, built in Pakistan." Existing figures and meaning are retained.

Only this section opts into straight paths. The original shared zigzag geometry remains available. The design uses existing typography, white reading space, deep teal text and restrained blue/mint details. Decorative lines are masked away from the copy.

The film preview expands into a 100svh player as the page scrolls. Text clears before expansion covers it. The image scales proportionally and remains fully visible, with a deep teal matte where the viewport differs from 16:9. After expansion, the full interview plays normally, muted initially. Native controls and an explicit sound toggle allow pause, seek, replay and sound. Manual pause is respected. Reversing or leaving the section pauses the film; revisiting resumes at the retained time. No forced scroll interception or forced wait for the 100-second interview.

## Asset delivery

See assets/source/founder/README.md for source hash and encoding details. Original copied unchanged into that private project folder. Web files are 37.36 MB (1080p) and 13.31 MB (720p phone), with a 62 KB poster, versus the 923.94 MB original. Only metadata is requested near the section; playback enables full media fetching. All frames remain in their original order, with no scene edits or audio replacement.

## Verification

- Production Webpack build and TypeScript pass. Webpack is the existing local workaround for the separate Turbopack worker startup problem.
- scripts/qa-founder.cjs: intro, midpoint, expansion, muted autoplay, native pause, sound toggles, reverse, watch button, rapid jumps, overflow, exact straight-path geometry, and runtime/media error messages.
- Viewports: 1440x900, 1920x686, 1366x600, 768x1024, 390x844, 390x600; plus 1440x900 reduced motion.
- scripts/qa-founder-edges.cjs: resize and reverse, monotonic fast-scroll progress, hidden-tab simulation, very short viewport fallback, reduced motion, Save-Data, no-JavaScript markup.
- Screenshots inspected for centered composition, legibility, control placement, full-image framing and fallback layout. The initial sound-button focus/scroll issue and false source-error message were found and corrected during QC. Content-fit sizing now measures natural content rather than relying on a flex-shrunk container.
- Historical v059 blank-section tests describe the previous brief and are not the acceptance criteria for this content-bearing section.

## Limits

Chromium viewport emulation does not certify physical mobile devices or Safari. The landscape source deliberately remains letterboxed in portrait rather than cropping the founder or embedded captions. No separate transcript or closed-caption file was supplied, so no speech transcript has been invented. This is a local preview; no deployment was performed. Earlier homepage scenes were not changed in this task.

Final run: 91/91 responsive and interaction assertions plus 10/10 edge assertions passed (101 total). Formatting and standalone typecheck also passed.
