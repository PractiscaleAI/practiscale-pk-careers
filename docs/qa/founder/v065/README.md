# Founder preview depth and playback verification, v065

The supplied thumbnail has a soft two-layer charcoal shadow and a thin neutral outline, measured to its exact preview bounds. This separates its pale artwork from the white section without cropping the source or adding another colored frame. Depth fades with expansion and is zero at viewport playback. The native fallback receives the same treatment.

The preceding green-edge repair remains: pale preview backing, black fullscreen letterboxing and a hidden underlying film layer before handoff. No video, thumbnail source or captions were added or regenerated.

Playback now requires actual scroll position and presented progress to be fully expanded, a stage that fits the viewport, a ready first frame, and an actually invisible poster. Under load, a fixed delay could expire while the opacity transition was still running. The final implementation waits for computed opacity zero and cancels on reverse scrolling, hidden tabs or departure. A delayed download cannot trigger playback after the visitor reverses.

Production Webpack build and TypeScript passed. The focused gate/depth suite passed 72/72 checks. It covers 1440x900, 1366x600 at display scale 1.25, 768x1024 and 390x844 at display scale 2, 360x640, and short 844x390 landscape. Checks include no clock advance before expansion, poster invisibility before playing, immediate reverse pause, rejection of premature play, delayed download cancellation, underlying film visibility and depth removal. Desktop, tablet and phone renders were visually inspected.

Existing founder and edge regression results are recorded in report.json and edges.json. These additionally cover large desktop, short phones, sound controls, manual pause, resize, hidden-tab return, reduced motion, Save Data and no JavaScript. The tab-resume test now waits for actual playback before hiding the tab, rather than assuming a fixed wait includes media readiness.

Limit: Chrome viewport and display-scale emulation is not physical iOS/Android or Safari certification. No global production-readiness claim is made.

Final results: 72/72 focused depth/playback checks, 10/10 edge checks and 91/91 founder layout/playback checks passed (173 total). Build including TypeScript passed. Final desktop, tablet, portrait phone and short-phone screenshots were visually inspected.
