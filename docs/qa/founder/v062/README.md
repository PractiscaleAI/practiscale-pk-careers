# Founder section v062 verification

Scope: larger short-desktop preview, a portrait phone/tablet rendition, longer reading hold, gradual copy departure, full viewport expansion and lighter media delivery. Existing straight background lines are retained. No captions or subtitle tracks are added, as requested.

Production build: npm.cmd run build -- --webpack passed, including TypeScript.

Final Chrome verification: 84/84 founder checks, 10/10 edge checks and 16/16 refinement checks passed. Reports and screenshots are in this directory. Tested 1440x900, 1920x686, 1366x600, 768x1024, 390x844 and 390x600, plus reduced motion and orientation changes.

Coverage includes fast forward/reverse scrolling, centered fit, pause on departure, manual pause, sound controls, no early video fetch, no caption tracks, orientation continuity, short-screen fallback, Save Data and no-JavaScript fallback. Desktop and phone renders were visually inspected. The portrait rendition retains the face in the sampled source scenes; original video dissolves remain unchanged.

Desktop delivery is 16.5 MB (formerly 37.4 MB). Portrait delivery is 10.2 MB (formerly 13.3 MB landscape). The full 100.33-second film remains intact. Simulated 1.6 Mbps / 150 ms latency playback started in 1.62 seconds in this local run; this is not a guarantee for real hosting or every device.

Limits: viewport emulation is not physical-device testing. Safari and real iOS/Android playback remain unverified. These scoped checks do not certify the complete site for production.
