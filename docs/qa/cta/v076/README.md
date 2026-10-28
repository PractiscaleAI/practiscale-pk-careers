# Final CTA v076 QA

- Production build: passed (`npm.cmd run build -- --webpack`).
- Responsive, links, overflow, image load and scoped accessibility: 45/45 checks passed across desktop, tablet and phone viewports, plus reduced motion and no JavaScript.
- Scroll photo motion: 3/3 checks passed at 1440×900, 768×1024 and 390×844. The image reached 1.11 scale at the end of the section and returned to 1.0 on reverse scroll.
- Screenshots and machine-readable results are in this folder.
- Verified in automated browsers and screenshots; physical device review remains separate.
