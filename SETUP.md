# PractiScale hero

Only the navbar, adapted preloader and animated CEO hero are active in this iteration. Other sections and pages will be built when requested.

Use Node.js 22.12 or newer (Node 24 recommended). On Windows use npm.cmd if PowerShell blocks npm.

- npm install: restore locked dependencies.
- npm run dev: start local development.
- npm run typecheck: verify TypeScript.
- npm run build, then npm start: production build and local preview.
- npm run test:browser and npm run test:motion: browser checks against localhost:3000 using installed Chrome. Override CHROME_PATH if needed.

PRD and TRD in docs describe current scope and implementation. Update them before adding new scope. Media prompts and provenance are in docs/hero-generation.json and docs/MEDIA.md. Former page drafts are retained as text outside active routes. SITE_URL is configurable; this site has not been deployed.
