# Migration from the supplied files

This package is a replacement copy for review and installation. It does not modify the original directory automatically. Keep the fixed identity while adapting later-selected layouts.

## Theme names

Canonical names are `deep-teal` and `fog`. For existing markup, `night` and `day` are temporary deprecated aliases to those new values. They no longer represent the prior palette. New work must use the canonical names. No automatic theme detection chooses a layout or changes the primary CTA identity.

## Token changes

| Old use | New use |
| --- | --- |
| Flat primary button using accent / on-accent / accent-hover | primary-start, primary-end, on-primary, primary-hover-start/end, primary-pressed-start/end |
| danger hue | error: high-contrast theme text plus explicit error label, icon, and correction |
| glow-accent | Removed; no replacement glow |
| link on a raised light surface | link-raised |
| on-proof | Deep Teal #134143 on Proof Amber |
| Scene heights, camera or renderer tokens | Removed; layout and media decisions remain open |

The old flat-button variables are deliberately not provided as aliases. Search consumers and migrate their markup/CSS to the new component rules. Merely replacing the JSON cannot update old application logic.

## CSS entry point

`components/bundle.css` loads ../fonts.css, ../tokens.css, and ../components.css in that order. It is optional convenience; alternatively load those three files directly once. No remote font import or external runtime is required for the component styles.

## JSON and generation

`tokens.json` is the canonical value source, using the Edition 1.4 structure: official colors, theme roles, CTA, typography, governance, and adaptable defaults. The older color.tokens/type.groups shape is not retained as a second conflicting source. Update code that consumes the old JSON shape.

Run `python tools/build_tokens.py` to regenerate tokens.css. Then run `python tools/verify_sources.py`. Do not hand-edit generated CSS. Re-run browser fixture checks after component changes. Fixture checks cannot certify an old site that still has its own button or theme rules.

## Chapter retirement

08-3d-experience.md and 10-applications.md are short notices. They preserve paths, not the old specifications. Do not restore their former content as requirements. The original PDF has not been copied into this package, so it cannot be mistaken for the current consolidated handbook.
