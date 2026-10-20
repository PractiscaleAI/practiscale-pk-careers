# Color

**Status: fixed palette and semantic roles.** Color balance guides emphasis; it does not approve a layout.

## Official palette

| Name        | Exact sRGB | Role                                                      |
| ----------- | ---------- | --------------------------------------------------------- |
| Deep Teal   | #134143    | Primary environment                                       |
| Growth Teal | #20BFA8    | Controlled brand accent                                   |
| Bridge Blue | #0D77A9    | Secondary brand accent; accessible links on light grounds |
| Harbor      | #2C526E    | Supporting dark band                                      |
| Fog         | #F3F6F6    | Light reading ground                                      |
| White       | #FFFFFF    | Reading surfaces and reversed text                        |
| Proof Amber | #F5B041    | Verified numerical achievements only                      |

Use exact sRGB for screen output. CMYK and spot-color conversions require an ICC-managed proof on the actual stock; no unverified conversion is a print standard.

## 60 / 30 / 10

Deep Teal and its tonal surfaces provide about 60% of overall visual emphasis; Fog and White support about 30%; accents share about 10%. Approximate accent guidance is Growth Teal 7, Bridge Blue 2, Proof Amber up to 1. The CTA gradient is included in the accent allocation. Omit amber when there is no verified achievement. These are not exact pixel quotas, a per-screen split, or a mandatory section order.

## Theme tokens

| Role        | Deep Teal theme | Fog theme |
| ----------- | --------------- | --------- |
| bg          | #134143         | #F3F6F6   |
| surface     | #1C5052         | #FFFFFF   |
| surface-2   | #265F61         | #E6ECEC   |
| line        | #3D7375         | #CFD8DA   |
| line-strong | #8BB6B6         | #6F8287   |
| text        | #FFFFFF         | #134143   |
| text-muted  | #BDD3D3         | #46565B   |
| accent-text | #9BE3D6         | #0B6559   |
| link        | #A9D4EC         | #0D77A9   |
| link-raised | #A9D4EC         | #0A6390   |
| error       | #FFFFFF         | #134143   |
| focus       | #9BE3D6         | #0D77A9   |

Necessary input/button boundaries use `line-strong`, not faint decorative `line`. On a raised Fog surface use `link-raised` #0A6390. Errors use high-contrast theme text, an explicit label, icon, and correction. Proof Amber is never a warning or error color.

## Approved text contrast

| Theme / role            | Foreground | Background | Ratio    |
| ----------------------- | ---------- | ---------- | -------- |
| Deep Teal / Text        | #FFFFFF    | #134143    | 11.261:1 |
| Deep Teal / Text        | #FFFFFF    | #1C5052    | 9.057:1  |
| Deep Teal / Text        | #FFFFFF    | #265F61    | 7.262:1  |
| Deep Teal / Muted       | #BDD3D3    | #134143    | 7.197:1  |
| Deep Teal / Muted       | #BDD3D3    | #1C5052    | 5.789:1  |
| Deep Teal / Muted       | #BDD3D3    | #265F61    | 4.641:1  |
| Deep Teal / Accent text | #9BE3D6    | #134143    | 7.696:1  |
| Deep Teal / Accent text | #9BE3D6    | #1C5052    | 6.190:1  |
| Deep Teal / Accent text | #9BE3D6    | #265F61    | 4.963:1  |
| Deep Teal / Link        | #A9D4EC    | #134143    | 7.140:1  |
| Deep Teal / Link        | #A9D4EC    | #1C5052    | 5.743:1  |
| Deep Teal / Link        | #A9D4EC    | #265F61    | 4.604:1  |
| Fog / Text              | #134143    | #F3F6F6    | 10.362:1 |
| Fog / Text              | #134143    | #FFFFFF    | 11.261:1 |
| Fog / Text              | #134143    | #E6ECEC    | 9.424:1  |
| Fog / Muted             | #46565B    | #F3F6F6    | 7.046:1  |
| Fog / Muted             | #46565B    | #FFFFFF    | 7.657:1  |
| Fog / Muted             | #46565B    | #E6ECEC    | 6.408:1  |
| Fog / Accent text       | #0B6559    | #F3F6F6    | 6.399:1  |
| Fog / Accent text       | #0B6559    | #FFFFFF    | 6.954:1  |
| Fog / Accent text       | #0B6559    | #E6ECEC    | 5.819:1  |
| Fog / Link              | #0D77A9    | #F3F6F6    | 4.570:1  |
| Fog / Link              | #0D77A9    | #FFFFFF    | 4.966:1  |
| Fog / Link              | #0A6390    | #E6ECEC    | 5.491:1  |

All 24 listed pairs pass 4.5:1 for ordinary text. Do not assume this approves another surface or reduced opacity. Qualifying large text requires 3:1; applicable UI boundaries require 3:1.

## Primary CTA identity

| State   | Start   | End     | White label minimum / 1,001 samples |
| ------- | ------- | ------- | ----------------------------------- |
| default | #0F8272 | #0B6B98 | 4.708:1                             |
| hover   | #0D7668 | #095F87 | 5.508:1                             |
| pressed | #0B695D | #085477 | 6.570:1                             |

Horizontal, left to right, encoded sRGB. Focus retains the default fill. Use the same primary gradient on all themes. White label, Manrope 700, at least 48px high, 10-12px corners. The 11px token is a default within that fixed range. Dark-theme boundary #D6E6E6.

## Boundaries and forbidden pairings

| Pairing                           | Ratio    | Decision                                              |
| --------------------------------- | -------- | ----------------------------------------------------- |
| Dark secondary border             | 3.273:1  | Pass for its tested role                              |
| Light secondary border            | 3.367:1  | Pass for its tested role                              |
| Dark focus                        | 4.963:1  | Pass for its tested role                              |
| Light focus                       | 4.156:1  | Pass for its tested role                              |
| CTA subtle border on raised dark  | 5.644:1  | Pass for its tested role                              |
| CTA default edge without boundary | 2.390:1  | Add visible CTA boundary                              |
| CTA edge on Fog                   | 4.336:1  | Pass for its tested role                              |
| White on Growth Teal              | 2.313:1  | Do not use for ordinary text; use semantic text token |
| Growth Teal text on raised dark   | 3.140:1  | Do not use for ordinary text; use semantic text token |
| Bridge Blue text on raised dark   | 1.462:1  | Do not use for ordinary text; use semantic text token |
| Dark disabled label               | 4.641:1  | Pass for its tested role                              |
| Light disabled label              | 6.408:1  | Pass for its tested role                              |
| White error text on raised dark   | 7.262:1  | Pass for its tested role                              |
| Deep Teal error text on Fog       | 10.362:1 | Pass for its tested role                              |
| White on Harbor                   | 8.270:1  | Pass for its tested role                              |
| Deep Teal on Proof Amber          | 5.989:1  | Pass for its tested role                              |

## Gradient restriction

By default, only the unchanged logo and approved primary CTA use gradients. No gradient headings, cards or decorative artwork.

**User-approved website exception � 20 October 2026:** the homepage hero may use a localized Deep Teal/Growth Teal/Bridge Blue background gradient inspired by the supplied portrait reference. Keep text areas dark, verify contrast on the rendered gradient and reserve Proof Amber for verified numerical achievements. This permission applies to the hero only; other backgrounds remain flat. It does not alter the original preloader or the approved logo/button gradients.

## Ramps and charts

Supporting teal/blue ramps do not approve every text pairing. Interfaces use semantic colors. Charts must identify series with labels and non-color cues; use visible boundaries where necessary. Amber in data remains limited to a verified achievement, not an arbitrary third series or warning.

### Teal ramp

| Token    | Value   |
| -------- | ------- |
| teal-50  | #E8F8F5 |
| teal-100 | #CBF0E9 |
| teal-200 | #9BE3D6 |
| teal-300 | #5ED2BF |
| teal-400 | #20BFA8 |
| teal-500 | #149C89 |
| teal-600 | #0E7F70 |
| teal-700 | #0B6559 |
| teal-800 | #0A4B43 |
| teal-900 | #08332E |

### Blue ramp

| Token    | Value   |
| -------- | ------- |
| blue-50  | #EAF4FA |
| blue-100 | #CFE6F3 |
| blue-200 | #A3CDE6 |
| blue-300 | #6FB0D6 |
| blue-400 | #3A93C4 |
| blue-500 | #0D77A9 |
| blue-600 | #0A6390 |
| blue-700 | #0A4F74 |
| blue-800 | #083B57 |
| blue-900 | #062A3F |
