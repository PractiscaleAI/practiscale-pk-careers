# Founder thumbnail v063

The user-supplied artwork is copied unchanged. SHA-256 equality with the supplied AVIF was verified. AVIF delivery is 58,421 bytes with an 87,062-byte WebP fallback. The thumbnail uses its original 1672:941 proportions on desktop, tablet and phones, retaining the entire headline and founder portrait. The watch button sits below the artwork. Existing video renditions and the no-caption requirement remain intact.

The picture overlay remains visible through metadata loading and scroll expansion, then releases on the video playing event. Reverse scrolling restores it. Native playback fallback uses the supplied thumbnail as its poster. No unrelated scene code was changed.

Production Webpack build including TypeScript passed. Desktop, short desktop, tablet and phone screenshots, intermediate expansion and playback states were visually inspected. The thumbnail suite passed 26/26 checks. Final existing founder/edge suite results are in report.json and edges.json.

The generic static audit reports two findings: an unrelated existing jobs native-select ownership warning and a false positive on the founder Watch button, whose click listener is mounted in founder-film.ts and exercised in browser tests. Neither represents a new thumbnail defect. This marketing-page update does not change the jobs selector.

Viewport emulation does not certify physical iOS/Android devices or Safari. No whole-site production certification is implied.

Final regression results: 91/91 founder checks and 10/10 edge checks passed, in addition to 26/26 thumbnail checks (127 total).
