# PractiScale design context

Marketing website. Current authority is the user's accepted work, Edition 1.4, and docs/PRD.md + docs/TRD.md revision 0.62. Keep existing hero, navigation, original introduction, problem-card choreography and career-card exchange intact.

## Visual roles

- Deep Teal #134143 for identity and strong surfaces; #1C5052 / #265F61 for depth.
- Fog #F3F6F6 and White #FFFFFF for reading surfaces and model contrast.
- Mint #9BE3D6 for restrained detail; #20BFA8 and #0D77A9 retain the existing CTA gradient.
- Proof Amber #F5B041 for verified milestones and earnings, not general decoration.
- 60/30/10 is a page-level emphasis principle, not a pixel quota for every section.
- Sora 600 for headings and figures, Manrope for body copy, JetBrains Mono for metadata. Reuse the established responsive type, gutter and control variables. Post-hero H2 tracking is -0.03em and card/metric tracking is -0.025em. Keep the approved hero type unchanged.

## Current composition

Revision 0.60 turns the seventh section into the user-supplied Founder Teaser. Center the eyebrow, headline, supporting story and film preview. Preserve white reading space, Sora/Manrope typography and restrained teal, blue and mint accents. Straight radial paths replace the zigzag variant only here, with a clear area around the copy. Scroll fades the story and expands one centered film into a viewport-sized player; preserve the entire 16:9 composition using contain rather than cropping the face or embedded nameplate. Start muted playback only after expansion; native playback controls and a sound toggle remain available. Pause when leaving, reversing or hiding the page. Reduced motion, Save-Data and insufficient-height windows use a normal controlled video. Do not change any earlier scene.

Hero, The Problem, the desktop Who we are film, Two Ways In, laptop earnings and team testimonials are the six completed content sections. The user removed the separate illustrative campus section. Preserve its sources and exports as historical work without mounting its renderer. The four company facts now appear once, at the bottom of the laptop opening. Labels stay at least 16px and order stays healthcare, team, candidates, publications.

The accepted front-facing laptop follows. Copy and the closed device start side by side on desktop, stacked on portrait devices. The four facts sit below the opening copy and closed device, in four desktop columns or a two-column portrait grid. A synchronized whole-group departure moves the intro upward and facts downward, clearing the device before overlap as scrolling expands the scene, opens the lid, presents ten qualified earnings records and the total, then closes it. Preserve the laptop's geometry and fixed front-facing orientation. The earnings scene remains silent. Do not restore its sound controls, sound synthesis, outside earnings caption or outside record counter. The founder interview is a separate muted-first film with explicit user-controlled sound. No visible detail table, added progress bar or prototype navigation.

## Behaviour and verification

The 0.58 smoothness audit preserves the six-section choreography. Laptop scroll steps ease toward the latest native position, with no queued playback. Reuse unchanged screen pixels and shadows, and use appropriately sized screen textures while retaining the same model, type layout and ten records. Introductory text clears the expanding panel before it crosses the text column. Testimonial deep links wait for preceding scene measurements and yield immediately to real user input. See docs/qa/smoothness/v058/README.md for measured results and device limits.

Use existing GSAP/Three.js, native page input and deterministic reversible motion. Server-render facts and copy. Posters remain available during loading, reduced motion, Save-Data, no JavaScript or renderer failure. Release pins for content that cannot fit. Only explicit keyboard skip links move focus. Clean up scoped observers, listeners and GPU resources.

Inspect real desktop/tablet/phone renders and the transition states as well as functional results. Chromium emulation does not certify Safari, physical-device speed or physical-device performance. See docs/proof-band/README.md and QA.md for source, exports, evidence and remaining checks.

## Desktop company film

The diagonal backdrop keeps shared side gutters and 24px corners, with equal height-aware vertical insets from 16px on short windows to 96px on tall ones. The heading stays upper-left with at least 112px navigation clearance. The paragraph remains lower-right, 32px inside the backdrop. Keep the supporting paragraph at 15-16px with the shared 1.6 line height, muted text color and a 500px maximum measure. This local supporting-copy treatment is intentionally quieter than the heading. Retain shared heading sizes and a 24-32px measured clearance from both blocks to the opening video. Keep its exact horizontal and vertical center, proportional scaling and full 100vh expansion. Use content fit rather than a fixed 620px height cutoff: a 240px source-aspect opening must fit, otherwise release to native flow. This keeps 1536x550, 1920x686, 1366x600 and 1024x600 desktop windows in the intended scroll experience. Static players have a 72svh height bound. Below 1024px use the user-supplied portrait edit and the mobile reading-then-scroll layout described in revision 0.66. Preserve the approved Deep Teal / #E6ECEC diagonal. Both halves open with the centered film before it advances, and close on reverse scroll. Keep opposite-corner supplied copy, silent playback and the keyboard skip.

## Loading and source preservation

The hero retains all 120 original frame URLs, the accepted blink, the Three.js shader and exact scroll-to-frame mapping. Two requests prioritize the current frame, then a directional window of twelve ahead and four behind. Cancel stale speculative requests on distant jumps, outside the hero or in hidden tabs. Keep at most 24 compressed frames and an eight-bitmap directional lookahead with two concurrent decodes. Prepare decoded neighbours ahead of demand. A completed frame may display if it moves the shown index toward the latest target; a late completion must never move away from that target or overwrite a closer frame. Reuse one GPU texture with linear sampling and no mipmap rebuilding. Close evicted bitmaps and all pending results on disposal. Versioned media paths receive immutable browser caching; mutable manifests do not. New media revisions require new filenames. The original introduction and all other section motion remain intact.

A new delivery encode, office-scroll-v2.mp4, is made directly from the unchanged Downloads source: 1920x1080, 30fps, all 950 frames, 31.666667 seconds, H.264 High/yuv420p, CRF24, eight-frame keyframes, no B-frames, fast-start metadata and no audio. It is 22,092,382 bytes versus the previous 30,585,604 bytes, a 27.8% reduction. Full source-aligned SSIM is 0.989214; all 950 decoded presentation timestamps remain continuous at 1/30 seconds with zero decode errors. Original source checksum is unchanged. The former encode is retained. No content, frame order, cuts, faces or signage are regenerated or edited. See public/media/who-we-are/manifest.json and docs/qa/performance/v052.

Resize restoration uses the last stable scene owner recorded before viewport reflow. It must not capture a temporarily visible company film created by upstream pin changes. Record native scroll position without per-frame DOM geometry reads; cancel the temporary correction when navigation leaves the company scene. This prevents the company film from pulling the career section out of view after short-to-tall or phone-to-desktop resizing.

## Team testimonials

Follow the supplied Mojo carousel recording: one centered wide card, faded neighboring previews, direct horizontal dragging and a smooth settle. Place it after laptop earnings on Fog to move from numbers into the team's first-person stories. Keep all four supplied quotes verbatim and in order: Kashaf Abbasi, Jason Brown, James Ephrim, Hassan Ali. Initials identify people until approved portraits are supplied; do not invent photographs, social links, verification marks or endorsement ratings.

Reuse Sora headings, Manrope quotations and attribution, JetBrains Mono metadata, the shared H2 scale, outer gutters and 24px card corners. Muted mint and blue SVG motifs suggest growth, an open ceiling, milestones and support. These are decorative, not earnings charts. Fog is dominant, deep teal carries the type and controls, and accents stay subordinate. The isolated CSS module derives colors from globals.css variables with color-mix; it adds no global palette tokens.

Keep vertical page scrolling native. A CSS sticky reading stage advances one testimonial per scroll interval and reverses with upward scrolling; do not intercept the wheel or lock the page. Fast input replaces the current destination rather than queuing transitions. Keep each quote fully visible during its reading hold. Release the rail for reduced motion or when the carousel cannot fit the viewport. Four centered selectors and Left/Right/Home/End keys provide alternatives to dragging. The user removed the previous/next arrow buttons. Use the native grab/grabbing cursor, without a floating cursor overlay. Reduced motion selects immediately without motif parallax. No autoplay, sound, new media downloads or WebGL. Server-render all quotes; without JavaScript the same cards remain a native horizontal scroll-snap list. Do not change existing scene choreography.

The centered card uses a lightly tinted reading surface and restrained shadow; neighboring cards recede into Fog while retaining legible text. Large centered mint/soft-blue growth motifs span the card height behind the quote, following the supplied scale reference. Deep-teal text stays fully opaque over every fill; motifs are decorative and ignore pointer input. A fine divider separates the attribution, with a deep-teal initials badge. Position selectors remain centered at every width with a scroll hint in the sticky scene and a drag/swipe hint in the natural-flow fallback. No navigation arrows or duplicate numeric indicators.

## Company film composition refinement 0.57

Keep the centered video and opposite-corner text arrangement. The complementary diagonal endpoints are calc(50% + 25vh) at the top and calc(50% - 25vh) at the bottom, so the boundary runs through the viewport center with a constant slope across desktop ratios. At the opening video's 16:9 aspect it intersects the top and bottom edges at approximately 64% and 36%, giving deliberate clearance from both rounded corners. Preserve the existing split-opening translations, film zoom, time mapping and reverse restoration. The paragraph is limited to 500px, uses muted #46565B on #E6ECEC, and scales from 15px to 16px; static fallback copy keeps the shared 16px body style. Evidence: docs/qa/who-we-are/v057.

## Founder line continuity, revision 0.61

The founder's straight-line variant is rendered in the initial HTML at deterministic, distributed phases. It uses constant visible opacity, negative animation delays, and continuous linear dash travel with no repeat gap. Offscreen and hidden-tab changes pause the existing paths instead of unmounting and replaying an entrance. Reduced-motion and no-JavaScript views retain visible static lines. The default zigzag variant and founder video choreography are unchanged.

## Founder refinement, revision 0.62

The user explicitly declined captions. Do not mount subtitle tracks, add caption controls, or burn subtitles into either video. Keep the source audio and muted-first playback with a sound toggle.

Use the full-duration 1600x900 desktop rendition and a dedicated 540x960 portrait composition for portrait windows up to 1023px. The portrait edit enlarges a protected central crop inside a soft, pre-rendered background from the same footage, preserving close-up faces and avoiding a clipped edge of the original nameplate. It does not generate or replace any facial imagery. Full-screen playback retains proportional contain fitting.

Fit the preview to the actual space left by the copy instead of a fixed viewport-height cap. At 1366x600 the preview grows from approximately 342px to 524px wide. Preserve natural-flow fallbacks on very short screens. Hold the story for the first 8% of scroll progress, ease its departure through 28%, and expand the video from 18% through 74%. The watch button advances to the playback hold. Preserve the immediate, continuous straight lines from revision 0.61.

## Founder thumbnail, revision 0.63

Use the supplied 5,000 Careers, One Founder's Dream artwork unchanged. A landscape preview preserves all embedded lettering and the founder portrait on every screen. Keep the watch action beneath the artwork, with a 12px minimum gap; never cover the image headline. During expansion the artwork stays visible until native playback begins. Reverse scrolling restores the supplied thumbnail. The portrait film rendition and desktop film remain unchanged. Serve the original 58 KB AVIF with WebP fallback; use the WebP for native video posters. No captions are added.

## Founder playback and edge repair 0.64

The thumbnail and expanding picture use a pale neutral backing (#F3F8F7), so different aspect ratios do not expose dark teal strips. The fully expanded player uses black for unavoidable video letterboxing. Preserve the complete thumbnail and contained video composition. Autoplay requires both the presented animation and actual scroll position to reach full expansion, with the stage filling the viewport. Reveal the ready first frame and allow the 180ms poster fade to finish before advancing playback. Native reverse scrolling pauses immediately rather than waiting for scrub smoothing. No other section choreography changes.

## Founder preview depth, revision 0.65

Separate the pale thumbnail from the section with a restrained two-layer charcoal shadow and a 1px neutral outline, following its exact 24px rounded bounds. Place the shadow on a separate, non-interactive layer below the preview so the video's clipping cannot cut it off. Fade depth with expansion progress and remove it fully at viewport playback. Native fallback players retain the same understated depth. Preserve all supplied artwork and the play button below it.


## Who we are on mobile, revision 0.66

The supplied portrait office film enables this section below 1024px. Keep one semantic heading and the full supplied paragraph in normal reading flow above the sticky viewport, so short phones do not squeeze text around a miniature film. The portrait preview is exactly centered within the inset rounded teal/soft-neutral diagonal stage, expands with the panels opening, and only then advances through the film. Keep the complete 9:16 film visible at full size; use neutral black letterboxing on mismatched device ratios rather than cropping the office or final vision text. Native page scrolling reverses the sequence. The desktop composition and timeline remain unchanged. Reduced motion, Save Data and failure release to normal video controls.

## Motion handoff polish 0.67

Use Deep Teal behind the complete portrait office film instead of black bands. Preserve the image aspect ratio and original final-frame wording. The proof loading pose must match the closed laptop shown at the start of the accepted scroll sequence. Keep the existing summary image for natural-flow fallbacks only. Preparation should not change the visual layout or introduce a visible loader, sound, extra controls or a new progress bar.
