# Logo component

**Fixed artwork and protection rules; placement is open.** The demonstration tiles are not final header designs.

Use existing primary artwork on light surfaces and reversed artwork on dark surfaces. Use a mark alone only in a suitable context. Never alter the internal proportions or remove the descriptor to make a header fit.

## Markup

```html
<a class="ps-logo-space" href="/" aria-label="PractiScale home">
  <img class="ps-logo ps-logo--full"
       src="assets/logos/practiscale-logo-reversed.png"
       width="363" height="67" alt="PractiScale - Built for growth">
</a>
```

The asset path above is relative to a page in the design-system root. From another folder, resolve the real URL. Select the variant for the actual local background. Do not use CSS filters to simulate a variant.

## Size and space

- Full logo with descriptor: at least 240 CSS px wide / 50mm print.
- Mark alone: at least 24 CSS px / 8mm print.
- Full-logo clear space is 1X, X being the wordmark cap height (approximately 7% of full width).
- Mark-only clear space is half its height. The mark-space helper uses the full symbol size conservatively.
- Helpers default to a 240px full logo and a 32px mark. Custom dimensions may increase them, not violate the minima.
- If the full logo will not fit, redesign the arrangement or use the approved mark alone in a suitable context. Do not shrink the descriptor.

The darker blue symbol has less separation on dark teal and Harbor. Inspect it at actual size; Fog/White offers clearer separation. Never use the logo on Growth Teal, Amber, the CTA gradient, or a busy photograph. Use a protected calm area for imagery.

## Source and dependencies

The supplied full logos are 363 x 67px rasters and the mark is 64 x 60px. Obtain the designer's original vector master and approved derivatives for sharper production use. No official artwork has been traced, recolored, or reconstructed. See ../04-logo.md for the complete protections.
