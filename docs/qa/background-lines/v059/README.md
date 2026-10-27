# Background Lines, revision 0.59

The supplied Aceternity Background Lines component is appended after testimonials at #background-lines. The section contains only its decorative animated background. Business content and further art direction are explicitly pending the user. Existing section animation sources were not changed in this revision.

## Retained from the supplied source

- All 21 SVG path strings, in their exact order, rendered in two sets of 42 paths total.
- The 1440x900 viewBox, 2.3 stroke width, round line caps, dash-offset and dash-array targets, opacity keyframes, ten-second linear loops and one-second SVG entrance.
- Tailwind styling, including 20rem phone height, viewport-height desktop treatment, white light-mode and black dark-mode surfaces. No component CSS file was introduced.
- Named BackgroundLines export, svgOptions.duration, children and className props; the cn helper uses clsx and tailwind-merge so caller utilities can override defaults.
- Original default multicolour palette remains in the reusable component.

## Every source adaptation

| Location                                 | Change and reason                                                                                                                                                                                                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| src/components/background-lines-demo.tsx | Replaced the unrelated airline/textile heading and paragraph with an empty children slot, because the user will provide content later. Added a section wrapper after testimonials rather than a separate demo page.                                                                |
| Same file and BackgroundLines options    | Added optional svgOptions.colors and supplied existing PractiScale blue, mint and teal CSS tokens on the homepage, following the established brand-colour requirement. No global palette tokens changed.                                                                           |
| Same file                                | Added the client directive, section ref and shared scene-anchor helper so #background-lines settles after preceding scroll sections measure; user input cancels alignment.                                                                                                         |
| src/components/ui/background-lines.tsx   | Added relative positioning, isolation and overflow clipping to the original container utilities. The supplied SVG is absolutely positioned and otherwise could use an ancestor outside this section as its containing block.                                                       |
| Same file                                | Added aria-hidden, focusable=false and pointer-events-none to the decorative SVG so it neither becomes content nor intercepts future controls.                                                                                                                                     |
| Same file                                | Replaced render-time random start/repeat delays with deterministic stagger schedules within the same original ranges (0-9s and 2-11s). This avoids changing schedules on React rerenders and makes QC reproducible.                                                                |
| Same file                                | Added opacity:0 to the initial path state to avoid a flash before a delayed path begins.                                                                                                                                                                                           |
| Same file                                | Added in-view and document-visibility gates. The SVG unmounts when not needed and restarts its sequence when re-entered, avoiding continuous offscreen work.                                                                                                                       |
| Same file                                | Added stationary dashes for reduced motion. Although the supplied instructions mention reduced-motion handling, the pasted implementation contained none. A hydration guard keeps server markup and the first client render identical before applying the preference.              |
| src/lib/utils.ts and package files       | No existing cn helper or components.json was present, so the two files were added manually, the helper was created, and the explicitly requested dependencies were pinned: motion 14.7.0, clsx 2.1.1 and tailwind-merge 3.7.0. Existing GSAP and Three.js usage remains unchanged. |

Implementation follows Motion's [in-view hook](https://motion.dev/docs/react-use-in-view) and [reduced-motion hook](https://motion.dev/docs/react-use-reduced-motion) guidance. The first-party supplied code is the visual reference; these docs inform lifecycle and accessibility handling only.

## Verification

- npm.cmd run build -- --webpack: passed. The default Turbopack build failed while starting its CSS worker, both restricted and unrestricted. No package script or project compiler setting was changed; the supported Webpack path produced the tested production preview.
- npm.cmd run typecheck and scoped Prettier check: passed.
- node scripts/qa-background-lines.cjs: 43 checks passed, zero browser errors. Covers source path equality, both path sets, section order, responsive heights, overflow, empty content, theme, actual changing dash offsets, offscreen teardown, re-entry, hidden-tab simulation and static reduced motion.
- Inspected rendered captures at 1440x900, 768x1024 and 390x844, plus dark mode and reduced motion. Phone testing is Chromium viewport emulation, not physical-device certification.
- Runtime evidence: report.json and five PNGs in this folder. The intentionally empty centre is reserved for later supplied content; there is no placeholder headline or false action.

The preview is a section foundation, not a completed content section or a deployment. No server-side form, intake flow or booking integration was added.
