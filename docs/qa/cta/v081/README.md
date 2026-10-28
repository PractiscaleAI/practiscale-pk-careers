# Final CTA traveling waves, v081

- Production build and TypeScript: passed.
- Browser checks: 1440×900, 1366×600, 768×1024, 390×844, and 320×568 passed. The visible path shapes changed during a timed sample while their CSS transforms stayed `none`, confirming deformation rather than whole-line motion.
- The native-size mark remains above the message, with no horizontal overflow, browser errors, inaccessible actions, or scoped accessibility violations at those widths.
- Reduced-motion at 390×844 kept all four paths static.
- Inspected desktop, tablet, and narrow-phone screenshots after the final curve refinement. The lines retain clear space around the mark.
