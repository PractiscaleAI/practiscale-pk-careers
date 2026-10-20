# Layout and interface

**Website layouts are pending.** This chapter supplies adaptable defaults and fixed component/accessibility requirements. It does not specify a homepage, section sequence, hero composition, navigation arrangement, or application flow.

## Grid and spacing defaults

| Breakpoint (default) | Width | Columns | Gutter | Side margin |
| --- | --- | --- | --- | --- |
| Phone | 360-767px | 4 | 16px | 16px |
| Tablet | 768-1023px | 8 | 24px | 32px |
| Laptop | 1024-1439px | 12 | 24px | 48px |
| Desktop | 1440px+ | 12 | 32px | Auto / 1280px max content |

Adapt these breakpoints, columns, content width, gutters, and spacing to the selected layout and actual text. Verify narrow widths, including 360px and 375px, without unintended horizontal overflow. Do not force screen-height sections, a fixed number of light sections, or a prescribed transition after a video.

The default spacing steps are 4, 8, 12, 16, 24, 32, 48, 64, 96, and 128px. These support rhythm; they are not mandatory per-section dimensions.

## Themes

Use `data-theme="deep-teal"` or `data-theme="fog"`. Select each ground for the content while preserving overall 60/30/10 emphasis. Old theme names are temporary aliases only; see MIGRATION.md. Necessary control boundaries use `line-strong`. Faint decorative lines do not define fields.

## Buttons

| Variant | Fill | Label | Boundary |
| --- | --- | --- | --- |
| Primary | Approved horizontal green-to-blue gradient on every theme | White, Manrope 700 | Visible pale boundary on dark grounds |
| Secondary | Transparent | Theme text | line-strong |
| Tertiary / ghost | Transparent | Accessible accent-text | Underline to identify link |
| Disabled | Explicit neutral state | Readable muted text | Explicit boundary and nearby reason |

Primary height is at least 48px with 10-12px corners. Width, stacking, and placement adapt to the selected design. Preserve label wrapping. Do not require a sticky bar or full-width mobile button unless the design calls for one. See components/Button.md for markup, states, semantics, and contrast.

## Forms and status

Use visible labels, relevant helper text, high-contrast boundaries, explicit errors, and programmatic associations. Choose only necessary fields for the selected flow; the field set is not approved by a specimen. Never require age, marital status, religion, or a photograph. Errors use an icon, the word Error, and a useful correction in the theme text color. Status meaning never depends on color alone. Amber remains verified numerical achievement only.

## Behavior and defaults

## Shape, depth, and behavior

Restrained surfaces, visible focus, and content that works without motion.

### Default shape tokens

Default radii: 2px tiny details; 6px inputs and tags; 10px cards; 20px large panels. Adapt non-CTA panel radii to the selected design. The primary CTA remains a restrained rounded rectangle with 10 to 12px corners; no pill shape.

### Depth

Use approved tonal surfaces and restrained edges. White cards may sit on Fog. Select elevation and sticky behavior only when the chosen layout needs them. No neon glow, excessive shadows, or glass effects that reduce readability.

### Focus and interaction

Every interactive element gets a visible 2px focus ring with 2px offset. Preserve the gap so the ring contrasts with the surrounding surface. Never hide focus or indicate it only by a fill-color change. Keep keyboard order logical and focused controls unobscured.

### Motion and performance

Native scrolling; no scroll-jacking. Starting timings: 100ms for simple state changes and 200ms for menus. Adapt to the chosen interaction. Respect reduced motion. Performance targets: LCP at most 2.5s, INP at most 200ms, CLS at most 0.1 at the 75th percentile. Measure the future implementation.

## Applying the system / flexible layouts

Brand consistency comes from color, type, logo, and component rules across different compositions.

### When a design is selected

Preserve its intentional content structure and composition, then apply PractiScale colors, typography, logo placement rules, and approved CTA styling. A centered hero, split hero, editorial page, or card arrangement can all express the same identity.

### When no design is selected

Develop design options as proposals. Use the fixed brand rules from the start. Make clear that the layout, navigation, image treatment, and interactions are awaiting selection.

### 60 / 30 / 10 across the experience

Keep Deep Teal as the primary environment, with calm light reading surfaces and controlled accents. This guides overall visual emphasis, not exact pixel counts, equal section heights, or a mandatory dark-light-dark sequence.

### Keep component identity

The approved green-to-blue primary CTA and White label remain the same on all themes. Adapt button width and placement to the layout. Keep 48px minimum height, 10 to 12px corners, readable Manrope labels, and visible boundaries and focus.

### Keep typography roles

Use Sora, Manrope, JetBrains Mono, and Noto Nastaliq Urdu for their assigned roles. Adapt display size and column width rather than shrinking mobile body copy. Keep essential content as live text.

### Avoid accidental design commitments

Do not inherit the PDF cover geometry, stepped working line, sample page sequence, sample header, role cards, or application dialog as a required visual language. No full-page website mockup is approved here.

## Readability / check each chosen design

The tested color pairs are reusable. Visibility must still be checked in the actual implementation.

| Element | Required check | Avoid |
| --- | --- | --- |
| Logo | Correct original variant; 1X clear space; full logo at least 240 CSS px; inspect symbol and descriptor at actual size. | Shrinking the descriptor; using an unapproved derivative; recoloring the symbol. |
| Reading text | Approved theme foreground on its stated ground; ordinary text contrast at least 4.5:1; mobile body at least 16px. | Opacity reductions; a light text token on a light surface; type shrunk to force a composition. |
| Primary CTA | Default gradient #0F8272 to #0B6B98; White label; minimum sampled contrast 4.71:1; visible dark-theme boundary. | Flat Growth Teal with White text (2.31:1); replacing the CTA fill by section theme. |
| Links and status | Accessible theme tokens; labels and icons for meaning; raised-light links use #0A6390. | Ordinary Bridge Blue text on dark surfaces; communicating errors only through color. |
| Imagery and motion | Check text over the actual crop and brightest relevant video frames; keyboard focus, zoom, and reduced-motion behavior. | Assuming these PDF checks certify a future layout, device, photograph, or website. |

## Component maturity

Button styling and logo protection rules are established. Component placement and content structure remain open. Content-specific components can be designed when a layout is selected; they do not depend on approval of an obsolete rendered experience. Validate each implemented interaction separately.
