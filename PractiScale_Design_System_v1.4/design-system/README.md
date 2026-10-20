# PractiScale design system / Edition 1.4

**Read [00-read-first.md](00-read-first.md) first. Website designs and layouts are not final.** Apply fixed brand rules to the design later selected by the user. The examples and component fixture do not approve composition.

## Brand at a glance

| Element | Current rule |
| --- | --- |
| Essence | Earned growth. |
| Brand line | Built for your growth. |
| Voice | Direct, empowering, transparent, precise |
| Primary environment | Deep Teal #134143 |
| Visual balance | Overall 60/30/10 emphasis; no section or pixel quota |
| Primary CTA | Same #0F8272 to #0B6B98 gradient and White label on every theme |
| Font roles | Sora headings; Manrope reading/controls; JetBrains Mono data/overlines; Noto Nastaliq Urdu for Urdu |
| Logo | Original artwork unchanged; correct variant, size, and clear space |
| Layout status | Pending user selection |

## Files

- [Brand essence](01-brand-essence.md), [Brand story](02-brand-story.md), [Voice and tone](03-voice-and-tone.md).
- [Logo](04-logo.md), [Color](05-color.md), [Typography](06-typography.md), [Imagery and icons](07-imagery-and-iconography.md).
- [Retired experience notice](08-3d-experience.md), [Layout and interface](09-layout-and-interface.md), [Retired applications notice](10-applications.md).
- [Sources](11-sources.md), [Changelog](12-changelog.md), [Migration](MIGRATION.md).
- [Button](components/Button.md), [Logo component](components/Logo.md).
- [Canonical tokens](tokens.json), [generated token CSS](tokens.css), [component CSS](components.css), [local fonts](fonts.css), [optional CSS bundle](components/bundle.css).

## Use and validate

1. Select a layout or label a new concept as a proposal.
2. Read the fixed rules and use the exact semantic tokens.
3. Load components/bundle.css, or fonts.css, tokens.css, and components.css in order.
4. Use data-theme="deep-teal" or data-theme="fog". See migration notes before replacing older consumers.
5. After changing tokens.json, run `python tools/build_tokens.py`.
6. Run `python tools/verify_sources.py` before rendering the handbook. It checks all supplied paths, token/CSS parity, links, variable references, source artwork, fonts, prohibited obsolete rules, and numerical contrast.
7. Run the browser component fixture checks using tools/browser_check.cjs with Playwright and local Chrome. The fixture is an illustration, not a website layout.
8. Generate the handbook only after source and browser checks pass. Render every PDF page and inspect it before delivery.

## Scope and dependencies

The updated copies preserve the 18 requested filenames. Two obsolete chapter paths now contain retirement notices. The ZIP includes original approved raster logos, local fonts and licenses, generator/verification tools, current evidence, and a consolidated handbook containing all requested file contents.

Original vector logo master, consented photography, verified company facts/destinations, final layout selection, and native-speaker Urdu approval remain separate production inputs. This is an RGB screen system; print needs an ICC-managed proof. Verification of these files does not validate a future live website.
