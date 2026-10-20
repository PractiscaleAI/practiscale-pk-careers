# Button

**Fixed component identity; placement is adaptable.** This specification does not approve a page layout, application flow, sticky bar, or external destination.

## Variants and states

| Variant / state | Treatment |
| --- | --- |
| Primary default | Horizontal #0F8272 to #0B6B98; White label |
| Hover | #0D7668 to #095F87; White label |
| Pressed | #0B695D to #085477; White label |
| Focus | Default fill; visible 2px theme ring, 2px offset |
| Disabled | Neutral fill and readable muted label; nearby reason; native disabled behavior |
| Secondary | Transparent, theme text, 1.5px line-strong outline |
| Tertiary / ghost | Transparent, accent-text, underlined link |

Use Manrope 700 at the default 15/20 label size; at least 48px height; 10-12px radius. Default radius is 11px. Gradient identity is identical on dark and light grounds. Dark boundary is #D6E6E6. No glow, pill shape, decorative shadow, or flat-teal replacement. White on raw Growth Teal is only 2.31:1 and fails ordinary-text contrast.

White-label minimum contrast across 1,001 samples: default 4.708:1, hover 5.508:1, pressed 6.570:1. This applies to the exact opaque sRGB gradient. Do not reduce label opacity or introduce overlays without rechecking.

## Markup

Load `components/bundle.css` once. Use a button for an action and an anchor for navigation. Do not make a button-looking div.

```html
<div class="ps" data-theme="deep-teal">
  <button class="ps-btn ps-btn--primary" type="button">Apply on WhatsApp</button>
  <a class="ps-btn ps-btn--secondary" href="#open-seats">See open seats</a>
  <a class="ps-btn ps-btn--ghost" href="#email-route">Email your CV</a>
</div>
```

The selectors, destinations, and arrangement are illustrative. A real navigation action requires a verified target. An action button needs the behavior appropriate to the selected flow; this CSS does not connect WhatsApp or transmit applications.

```html
<button class="ps-btn ps-btn--primary" type="button"
        disabled aria-describedby="apply-reason">Apply on WhatsApp</button>
<p id="apply-reason">Complete the required fields to apply.</p>
```

Native disabled buttons cannot activate. `aria-disabled="true"` alone does not disable an anchor or button: the implementation must prevent mouse and keyboard activation, preserve a clear reason, and choose appropriate focus behavior. Avoid a disabled anchor when a native disabled button fits the action.

## Width, icons, and accessibility

`ps-btn--block` fills the available width when the selected layout calls for it. Labels wrap; never truncate essential words. Keep button text visible and unobscured at zoom and narrow widths. An optional leading icon is 20px, decorative with aria-hidden when its label already states the action. WhatsApp uses the official platform glyph, not a substitute Lucide speech bubble. Text-only buttons are allowed; no unprovided platform artwork is fabricated.

Keyboard focus must remain visible. Reduced motion removes transitions and press scaling. Forced-color mode uses system colors for visibility. Do not style the focused state solely as a fill-color change. The fixture tests reusable styles, not the future application behavior.
