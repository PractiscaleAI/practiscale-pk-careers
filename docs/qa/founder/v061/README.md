# Founder lines v061

Removed the delayed entrance and repeat gaps from the founder straight-line variant. Its 42 paths are present in server HTML, with deterministic negative animation phases and constant opacity. CSS dash travel repeats continuously. Offscreen or hidden paths pause in place, then resume without unmounting. Reduced motion retains stationary visible strokes. Existing video expansion and other sections remain unchanged.

Verification: production Webpack build including TypeScript passed; 25/25 targeted browser checks passed across 1440x900, 768x1024 and 390x844. Checks cover initial HTML, immediate entry visibility, motion without startup delay, offscreen pause, persistent paths on return, immediate re-entry, reduced motion, and browser errors. Arrival screenshots inspected on desktop, tablet and phone.
