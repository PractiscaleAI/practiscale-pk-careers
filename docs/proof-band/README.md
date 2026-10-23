# Historical proof campus

Revision 0.49: this scene is removed from the homepage at the user's request. Its component, media and export route remain archived. The four company facts now appear in the laptop opening. Current verification is under docs/qa/earnings/v049; earlier campus QA below is historical.

# Connected proof campus and laptop earnings

The homepage now runs Hero → The Problem → Two Ways In → Proof Band → Laptop Earnings. The accepted standalone laptop preview and the original earnings frame archive remain intact. This work does not deploy the website.

## One editable scene

`src/lib/proof-world/scene.js` creates the connected foundation, clinic architecture, furnished office, candidate portal and publication archive. There are no externally licensed model assets or generated textures. Repeated parts share instanced geometry/material batches. The scene is silent, uses a fixed orthographic camera and redraws only when progress or geometry changes.

`src/lib/proof-content.ts` is the single source for the four figures and labels. Update it, then regenerate posters and video exports. The website uses these facts as semantic HTML. Standalone videos bake the same facts into their frames.

| Progress  | Motion                                                |
| --------- | ----------------------------------------------------- |
| 0-0.12    | Foundation settles                                    |
| 0.12-0.30 | Healthcare buildings rise; selected glazing activates |
| 0.30-0.48 | Office furniture and screens assemble                 |
| 0.48-0.66 | Profile tiles align inside the portal                 |
| 0.66-0.84 | Bound publications align; the folio opens             |
| 0.84-1    | Completed scene holds with no idle movement           |

Revision 0.48 keeps the campus assembly, with the heading "The work behind the numbers". The four company facts now render once at the bottom of the laptop opening rather than under the campus. Desktop uses four columns and portrait devices a 2x2 grid, with canonical healthcare/team/candidates/publications order and 16px labels. The copy and facts share the same full-contrast exit mask as the laptop expands. The measured device slot reserves the facts footer; insufficient height exposes normal flow. Campus geometry, amber assembly and archived exports are unchanged.

## Brand mapping

| Visual role                     | Existing token / value                  |
| ------------------------------- | --------------------------------------- |
| Background and ink              | `--deep` #134143                        |
| Foundation and depth            | `--surface` #1C5052, `--raised` #265F61 |
| Architecture / reading contrast | `--fog` #F3F6F6, White #FFFFFF          |
| Path / secondary detail         | `--accent` #9BE3D6                      |
| Active verified milestone       | Proof Amber #F5B041                     |
| Supporting facts                | `--dark-muted` #BDD3D3                  |
| Numbers / labels                | local Sora 600 / Manrope 400            |
| Export metadata                 | local JetBrains Mono                    |

The 60/30/10 rule describes the overall page balance. The scene does not assign 10% of every frame to amber. Do not change the established CTA gradient.

## Rendering

Run the existing development server on port 3000. The unlinked `/proof-render` route exposes a local deterministic export helper and has noindex metadata. No paid service or image generation is used.

```powershell
npm.cmd run dev -- --port 3000

# In another terminal. Use an installed ffmpeg executable.
$env:FFMPEG_PATH = 'C:\path\to\ffmpeg.exe'
npm.cmd run render:proof -- styles
# Inspect the representative renders before a complete export.
npm.cmd run render:proof -- video
```

`CHROME_PATH` can override the Chrome executable. `PROOF_RENDER_DIR` can override the temporary PNG output directory (default `.next/proof-render`). Both variants are eight seconds, 24fps, 192 frames, H.264/yuv420p, with no audio. Desktop is 1920x1080; mobile is 1080x1920. Current MP4s and posters are in `public/media/proof-band/`. Laptop fallback images are in `public/media/earnings-laptop/` and are rendered from the integrated laptop itself.

## Laptop integration

`earnings-section.tsx` supplies the exact user copy and the semantic ten-record list. `src/lib/earnings-laptop/` contains the migrated front-facing geometry, scroll controller and pure number-presentation functions. It keeps the opening panel expansion, ten records in order, qualified combined total and final lid close. The homepage is silent; its sound engine and samples, controls, external earnings caption and external record counter are removed. The visible details table and duplicate progress indicator are absent.

The original source frames under `public/earnings-v7` are preserved and no longer fetched by the homepage. Canonical earnings are also retained in `earnings-content.ts`; if updating them, keep the laptop data module synchronized. The combined Rs 9,596,865 covers different reporting periods.

## Fallbacks and cleanup

Reduced motion, Save-Data, no JavaScript and renderer failure use final posters with ordinary document flow. Enlarged text releases the pin and keeps the poster visible. Initial HTML has a usable static mode before hydration. The players own and release their listeners, timers, observers and render resources. Offscreen/backgrounded/settled scenes pause. Direct earnings links wait for fonts, the original introduction and preceding scene geometry; real input cancels alignment.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run test:proof-band
npm.cmd run test:proof-edges
npm.cmd run test:typography
npm.cmd run test:browser
npm.cmd run build
```

Run browser suites sequentially. Screenshots and JSON reports belong in `docs/qa/proof-band/v044/`. See QA.md for checks actually performed and release limitations. The Behance reference returned HTTP 403 and was not visually inspected. No Remotion skill is installed, so the existing Three.js scene and local render/export workflow supply the deliverables.

Revision 0.44 adds the visible stats heading, shared H2 tracking, 16px fact labels and canonical reading order. Existing MP4 previews are retained from revision 0.43; the live website and export generator now use canonical mobile fact order. Geometry and final scene posters are unchanged. See ../homepage-design-audit-v044.md for the current full-page audit.
