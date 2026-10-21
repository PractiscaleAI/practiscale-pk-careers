# PractiScale website

The shared navbar, original preloader, approved animated CEO hero, three problem cards and one integrated Two Ways In section are active. The career section has exactly two cards: Training Programs and Jobs. Their URLs resolve to focused pages using the supplied content and existing enquiry flow. Other sections and pages remain deferred.

Use Node.js 22.12 or newer (Node 24 recommended). On Windows use npm.cmd if PowerShell blocks npm.

- npm install: restore locked dependencies.
- npm run dev: start local development.
- npm run typecheck: verify TypeScript.
- npm run build, then npm start: production build and local preview.
- npm run test:browser and npm run test:motion: browser checks against localhost:3000 using installed Chrome. Override CHROME_PATH if needed.
- npm run test:problem-scroll (legacy alias test:carousel): verify brand-coloured artwork, panel joins, desktop split/flip/fan, native mobile scroll stack, reverse motion, exact copy, absence of arrows, accessibility and fallbacks.
- npm run test:career-section: verify exactly two career cards, the viewport-height horizontal scroll exchange, staggered text, persistent particles, exact copy/links, keyboard navigation, route changes, responsive/reduced-motion/WebGL/no-JavaScript fallbacks and accessibility.
- npm run test:typography: verify matching heading and card-title roles, 12px/24px heading spacing, readable 16px body copy, paragraph endings and 52px primary actions across 12 desktop, tablet and phone sizes.
- node scripts/prepare-brain-poster.cjs: export the current live cortical brain to the Training WebP fallback using the local site. The capture hides navigation and uses the same live shader and geometry.
- node scripts/prepare-career-posters.cjs: rebuild the Jobs and destination SVG previews from the live scene's seeded target generator. Training uses the live export described above. No image-generation service is involved.
- node scripts/prepare-career-brain.cjs: rebuild the visible cortical samples and the shared depth/shading surface from the retained ICBM152 mesh. Licensing is in public/media/career-paths/THIRD-PARTY-NOTICES.txt; checksums are in docs/career-brain-provenance.json. Run the poster preparation afterwards.

If the local Turbopack CSS worker exits before connecting on Windows, `npm.cmd run build -- --webpack` uses the supported build fallback. The default build script remains unchanged.

PRD and TRD in docs describe current scope and implementation. Update them before adding new scope. Media prompts and provenance are in docs/hero-generation.json and docs/MEDIA.md. Former page drafts are retained as text outside active routes. SITE_URL is configurable; this site has not been deployed.

Career-card photography uses the built-in image generation tool. Prompts and provenance are recorded in docs/career-image-prompts.json. Responsive local WebP assets are in public/media/career-problems/. These generated career scenes illustrate the problems; they do not represent testimonials or identified employees. No Higgsfield credits were used for this section.

Current revision 0.39 adds Two Ways In after the existing problem cards. Suitable desktop screens show one viewport-height stage: a shared visual panel crosses from right to left, incoming Jobs text rises behind it, and particle states reveal vertically inside the moving panel. The same 6,800–10,000 fragments describe the actual ICBM152 cortical surface, disperse, then regroup into a connected team structure. Depth occlusion preserves recognizable brain folds; teal, blue, mint and ivory regions use the current palette. All unrelated floating triangles are removed. Suitable phones/tablets use 4,000 particles above horizontally exchanging text cards. Short phones retain that card exchange without artwork when only the copy fits. The visible path buttons and introductory sentence are removed; keyboard-only jump links remain available on focus. Reduced motion, copy that cannot fit and unavailable WebGL use both complete cards in normal flow. GPU initialization waits until the stage becomes visible after the original introduction. No extra dependencies, external media generation or paid credits were used. Motion references and fidelity choices are in docs/career-section-motion-review.md. Existing hero and problem-card media/motion remain unchanged; problem-card artwork provenance stays in docs/problem-art-selection.json.
