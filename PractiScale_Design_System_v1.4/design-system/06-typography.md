# Typography

**Fixed:** font families and assigned roles. **Adaptable defaults:** display sizes, line heights, and tracking, while preserving hierarchy and readability. The below-768px switch is a default, not a required responsive layout.

## Families

| Role | Family | Approved weights |
| --- | --- | --- |
| Headings and display | Sora | 600, 700 |
| Body, buttons, interface | Manrope | 400, 500, 700 |
| Data, overlines, technical labels | JetBrains Mono | 400, 500 |
| Urdu script | Noto Nastaliq Urdu | 400, 700 |

The supplied local fonts and SIL Open Font License texts are included. `fonts.css` declares the real files. Load it before the token and component styles. Fallbacks support loading; they are not permanent brand substitutions.

## Default scale (CSS pixels)

| Style | Family | Desktop size / line | Mobile size / line | Weight | Tracking | Role |
| --- | --- | --- | --- | --- | --- | --- |
| display-xxl | Sora | 96 / 96 | 48 / 52 | 600 | -3.5% | Hero / once per page |
| display-xl | Sora | 72 / 76 | 40 / 44 | 600 | -3% | Major section titles |
| h1 | Sora | 56 / 60 | 36 / 40 | 600 | -2.5% | Page titles |
| h2 | Sora | 40 / 48 | 28 / 34 | 600 | -2% | Section titles |
| h3 | Sora | 28 / 36 | 22 / 28 | 600 | -1% | Subsections |
| h4 | Sora | 20 / 28 | 18 / 26 | 600 | 0 | Small headings |
| body-lg | Manrope | 20 / 32 | 18 / 28 | 400 | 0 | Ledes |
| body | Manrope | 17 / 28 | 16 / 26 | 400 | 0 | Reading text |
| body-sm | Manrope | 15 / 24 | 15 / 24 | 400 | 0 | Dense desktop info |
| label | Manrope | 15 / 20 | 15 / 20 | 700 | +1% | Buttons and labels |
| caption | Manrope | 13 / 18 | 13 / 18 | 500 | 0 | Credits and legal |
| overline | JetBrains Mono | 12 / 16 | 12 / 16 | 500 | +16% | Uppercase markers |
| data | JetBrains Mono | 15 / 22 | 15 / 22 | 500 | 0 | Tabular figures |
| spec | JetBrains Mono | 12 / 18 | 12 / 18 | 400 | 0 | Guideline notes |
| urdu-display | Noto Nastaliq Urdu | 40 / 84 | 32 / 68 | 700 | 0 | Urdu headlines |
| urdu-body | Noto Nastaliq Urdu | 20 / 44 | 18 / 40 | 400 | 0 | Urdu body |

## Readability constraints

- Mobile paragraph text stays at least 16px. Labels/captions are separate roles; never use them as a paragraph loophole.
- Use no weight below 400 for text under 32px. Aim for 60-75 characters per line where the viewport allows; narrower mobile lines are natural.
- Use sentence case and a clear heading hierarchy. A display headline is optional; use at most one dominant display headline per page.
- Prefer balanced headings and natural paragraph wrapping. Do not shrink copy to force a composition.
- Use live text over imagery. Check the actual crop and brightest relevant video frame: 4.5:1 ordinary text, 3:1 qualifying large text.
- Use tabular JetBrains Mono for aligned figures. Currency, time zones, dates, and factual details follow Voice and tone.
- Urdu uses `lang="ur" dir="rtl"`, generous line height, and native-speaker review. Do not mix Urdu and Latin in one headline.

## Illustrative hierarchy

```text
REAL WORK / REAL GROWTH              JetBrains Mono overline
Built for your growth.               Sora heading
Learn a skill the market pays for.   Manrope supporting text
Apply on WhatsApp                    Manrope 700 button label
```

This example demonstrates roles, not a required hero design, copy sequence, or position.

## Loading and fallback

Use font-display: swap. Request only needed weights; load Urdu only on relevant pages. Preload Sora 600 and Manrope 400 when used above the fold. Match fallback metrics to reduce layout shift. For office documents where brand fonts cannot be installed: Sora if available, otherwise Arial Bold for headings and Arial for body. No near-lookalike substitution as the permanent identity.
