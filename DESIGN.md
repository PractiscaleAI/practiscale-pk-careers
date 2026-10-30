# PractiScale design context

## Footer hierarchy and browser zoom, revision 1.06

The footer keeps its approved PractiScale mascot and three-column desktop composition. The mascot is slightly smaller so the actions retain visual priority. Apply on WhatsApp is the primary footer action; email, phone and company links stay legible without a second competing accent. Tablet content uses two columns where each column can hold the action without wrapping, then stacks at narrower widths. On phones the mascot appears before the office and legal details so it belongs to the composition instead of following the copyright. Preserve the existing bounded gaze interaction and its touch and reduced-motion stills.

Browser zoom stays enabled for accessibility. When zoom or a comparable desktop viewport change reflows the long scroll scenes, retain the section at the center of the reader's view. Only correct a jump into another section, and relinquish that correction immediately on real scroll, touch, keyboard navigation or a new hash. The founder fast-scroll checkpoint must ignore zoom gestures and resize-induced exits. Keep all existing scroll choreography and the first fast-scroll checkpoint for normal navigation.

## FAQ sculpture alignment, revision 1.05

The FAQ diamond floor and circular tray share one visual center. On desktop, adjust the floor position and its shadow together; keep the sculpture's clearance below the heading. On phone widths, scale the complete Three.js stage so the question mark, dot and tray keep their proportions within the diamond. Match the non-WebGL fallback scale. Preserve the scroll-driven turn, descent, floor closure and immediate question handoff, with no changes to other sections.

## FAQ question handoff, revision 1.04

As the FAQ sculpture and circular tray sink into the diamond floor, the floor closes and the first real question row enters the same viewport. Overlap the natural-flow answer list with the final portion of the sticky introduction and tie its reveal directly to the floor closure, so the two crossfade without an empty beat. Center the list in a restrained reading column so its first row visually replaces the centered sculpture. Do not duplicate the first answer as an overlay. Preserve the seven-row reading order and the reduced-motion and no-JavaScript fallbacks.

## FAQ floor closure, revision 1.03

The FAQ question mark completes its vertical-axis turn while the circular tray remains underneath it. The entire mark and tray then descend into the pale diamond-shaped floor as one object. Once both are inside, the diamond floor and its small central shadow close smoothly to the middle. These movements are driven by the same native scroll progress and reverse when scrolling up. This refines the plinth motion in revision 1.02; the question list, copy, palette, and other homepage sections remain as specified there.

## Reference-led FAQ scene, revision 1.02

Use the supplied desktop and phone recording as the FAQ's sequence reference. Replace the earlier split heading/list and white answer cards with one pale brand-mint surface. Its first viewport centers the candidate heading over a solid bevelled deep-teal question mark and a restrained circular plinth on a subtle diamond floor. Native scroll gives the complete mark and dot one full turn around their vertical axis while the floor stays still, then lowers the mark through the circular plinth and diamond-floor scene. The intro uses enough native scroll distance for this turn and descent to read smoothly on desktop and phone, and the full-width question list enters after it. The list consists of seven fine-rule rows with a number, question, and one expanded answer. As a row reaches the reading line, its answer opens and the previous one closes, including when scrolling back or jumping quickly. Do not add decorative intro footers, list summaries, or diamond markers. Use the approved FAQ content and real contact links. Do not reintroduce the earlier pinned list, answer cards, progress bar, category sidebar, or vertical timeline. Keep the existing no-JavaScript and reduced-motion reading fallbacks, and load the 3D code only near this section.

## Sculptural FAQ introduction, revision 0.99

The FAQ remains a light neutral section after the CTA and before the footer. A full-viewport introduction centers the approved candidate heading above a genuine 3D deep-teal question mark on a circular plinth. Mint is reserved for the thin edge and seven small station details. Scroll turns the sculpture in place and carries the visitor into the answers, without a separate button, an auto-playing film, or a permanently running render loop. The seven supplied answers then advance from native scroll in the existing measured phone, tablet, and desktop layouts. Show one answer at a time with up to two upcoming titles where space permits; preserve the reverse journey and the no-JavaScript, reduced-motion, and short-window reading fallbacks. A static sculptural fallback appears immediately while the 3D code loads. This adapts the supplied desktop and phone reference's spatial transition and sequence to PractiScale's 60/30/10 palette and typography; it changes only the FAQ.

## Light FAQ scroll sequence, revision 0.98

The FAQ uses the established neutral #E6ECEC, Deep Teal, mint and blue palette. Its light neutral surface must read distinctly from the Fog final CTA immediately above; the active answer stays white. Keep the seven approved questions and answers, the candidate heading, and the section's position before the footer. The supplied FAQ image informs a clear vertical list, while its crossed-out category sidebar is excluded. PractiScale's section typography, fine rules and one active answer create the visual language. Do not use a vertical timeline, connecting line or marker dots beside the questions. The compact horizontal progress indicator and 01/07 reading status follow native scroll with a short catch-up; a quick scroll goes directly to the latest question, and reverse scroll restores earlier answers. Questions are informational rows, not click targets. On phones the active answer is followed by one or two upcoming question titles according to the measured available height, so 100% zoom has a balanced scroll scene; advancing reveals the next title at the end of that queue. Tablets use the full seven-row list when it fits and a three-row queue when it does not. Short desktop windows show one active answer. Genuinely short screens, reduced motion and no JavaScript show every answer in reading order. In guided mode a single low-opacity question mark is clipped inside the active white answer surface, balancing its text; the heading stays clear. Normal-flow fallbacks retain a pale heading motif. The mark must not reduce answer contrast or intercept interaction. This supersedes earlier dark split and orbit FAQ treatments without changing any other section.

## Reference footer gaze and Who we are split, revision 0.93

The homepage ends with a PractiScale footer after the FAQ. Keep the supplied company, opportunities, application, US healthcare, office, locations and copyright copy as real links where destinations exist. The user's studio-footer reference is defined by one full-screen, character-led video and cursor-driven eye direction. Use the supplied reference clip and its calibrated frame table; desktop pointer direction selects recorded eye frames while the clip stays paused, and tablet or phone plays the clip only when visible. Preserve the approved PractiScale logo, site typography, and real destinations. Mobile content stacks above the full-bleed film; allow clearance for the floating navigation at narrow widths. No new film generation is needed. The Who we are diagonal remains one smooth line at rest: its heading and description have transparent backgrounds so they cannot create rectangular notches across the opening split. Preserve the accepted zoom and panel motion.

## FAQ answer motif, revision 0.91

The FAQ's question mark belongs in the white answer panel at desktop, tablet and phone widths. Scale it as a pale mint background motif, following the testimonial cards' visual balance. Keep the answer text and links above it at full contrast; the motif must not intercept interaction. The dark teal heading area stays clear. Preserve the scroll-driven seven-step sequence and normal-flow fallbacks.

## FAQ scroll-only route, revision 0.90

The enhanced FAQ advances only from native page scrolling. Remove desktop topic buttons, the mobile question picker, Previous/Next controls, the skip link, hint and View all action. Center the now-unlabelled desktop ring; keep the mobile arc and use a taller teal panel to balance the answer without the controls. One question and answer is visible at each scroll position. Short-screen, reduced-motion and no-JavaScript fallbacks expose all seven answers in normal flow.

## FAQ control reduction, revision 0.89

Remove the FAQ skip link, scroll hint and View all questions action. Desktop keeps direct ring topic selection; guided mobile keeps its concise question picker and Previous/Next controls. Reduced-motion and short-screen layouts still expose every answer in normal reading flow. Do not leave an empty desktop control row or a blank gap where removed controls appeared.

## Desktop route clarity, revision 0.88

Keep the desktop FAQ marker visibly separate from its selected topic pill; the labels follow the ring without touching the marker. The final CTA's solid arc must reach the entire visible guide on every desktop width. Measure the rendered SVG route after its responsive stretch, and recalculate that length on resize so the reveal reflects actual pixels rather than unscaled viewBox units. Preserve native scroll progress and reverse behavior.

## FAQ phone alignment, revision 0.87

The guided phone layout uses the exact 27/73 viewport split, without the normal-flow visual panel's 280px minimum height. Anchor every answer at the same position beneath the white panel edge so the question counter never crosses into the teal panel. Keep enough room for the longest answer before the controls and use concise topic names in the native question picker so its open menu fits a narrow phone. Preserve the seven full questions and answers, scroll progression, and normal-flow fallbacks.

## Hiring section mobile dial, revision 0.86

On phone-size guided views, keep only the four-station circular timeline and place the active step's supplied description inside its center. The duplicate numbered description block below the dial is visually hidden but remains in semantic list order for assistive technology. Compact the heading, dial and spacing so the guided scene fits a 360x640 viewport. At genuinely short heights, reduced motion, or without JavaScript, release the pin and show all four descriptions as a simple vertical reading list. Preserve the desktop and tablet timeline choreography.

## FAQ responsive refinement, revision 0.85

The final FAQ section keeps seven approved candidate questions and the deep-teal/white ring vocabulary. In guided mode, native scrolling moves one marker and progress path; the answer, counter, topic state, mobile select, and Previous/Next controls share the same scroll position. The heading owns normal-flow space above desktop topic navigation, and phone screens use a shallow arc. View all questions returns the same seven answers to normal flow. Reduced motion, short windows, narrow reflow, and no JavaScript read in normal flow. Existing contact destinations are actionable links. Do not hide a focused answer link during passive scrolling.

## FAQ scroll orbit and founder audio, revision 0.84

The supplied seven candidate questions replace the previous homepage FAQ copy. FAQ follows the application CTA and is the final section. Adapt the user-supplied lifecycle reference as a clipped orbit on the left and one question with its answer on the right. Native scrolling advances seven reading stations; the orbit marker catches up to the latest position without queuing older states, and direct desktop topic selection jumps to a station. Short screens and reduced-motion devices show all answers in normal flow. Preserve keyboard access and a skip link. Remove the founder film's separate sound toggle; retain native video controls and attempt playback with audio. Browsers that block scroll-started sound may require native unmute, while a deliberate Watch action should request sound.

## FAQ question orbit, revision 0.83

The user-supplied LangChain lifecycle recording informs a clipped circular route and changing explanation, adapted into a readable FAQ before the final CTA. The orbit occupies only the deep-teal introduction; the five existing homepage questions stay visible as a white accordion list. Clicking or keyboard-activating a question updates a small marker along the orbit and reveals its answer. The FAQ does not pin, auto-advance or intercept page scrolling. Mobile keeps the question list in natural flow with the orbit as a quiet header detail. Preserve the existing FAQ copy and every earlier scene.

## Final CTA arrival arc, revision 0.82

The supplied Dawn CTA recording informs the final section's open field, centered message, broad curved guide and scroll-completed route. Keep the PractiScale mark, Fog reading surface, supplied Monday copy and the three application destinations. A dotted brand-color route remains visible before script hydration, while one solid teal-to-blue stroke fills according to native scroll position. This replaces the paired traveling waves only in the final CTA. Fast scroll and reverse scroll map directly to the current position, and reduced-motion visitors see the completed line. Preserve the prior page scenes and avoid added imagery.

## Final CTA traveling waves, revision 0.81

Replace the earlier whole-path vertical drift with a restrained traveling ripple through each path's shape. Keep both endpoints fixed and clear of the unmodified brand mark. The static SVG paths render before JavaScript, then the visible pair deforms smoothly while the CTA is on screen; pause offscreen or in a hidden tab. Reduced-motion visitors retain the static paths. Preserve the CTA layout, copy, destinations, and preceding section motion.

## Final CTA path motion, revision 0.79

Keep the supplied brand mark and its two surrounding routes above the final CTA message at every viewport, including phones. Animate only the code-native path strokes with two slow, unsynchronized vertical drifts; the protected mark remains completely static. Lines must stay visible immediately, maintain clear space around the native-size mark throughout motion, and stop animating for reduced-motion visitors. Preserve the final CTA copy, destinations and all earlier section choreography.

## Final CTA paths, revision 0.78

The CTA adapts the supplied healthcare reference's graphic structure without copying its hearts or colors. Two restrained brand-color routes approach the supplied PractiScale mark, representing the training and experienced entry paths converging into the next workday. Keep the protected mark unchanged with its required clear space. Center the heading, body and application actions on desktop; on phones, place the motif after the message and actions. The graphic is code-native and static so it remains visible on arrival. Preserve the supplied wording, destinations, no-image direction and prior page choreography.

## Final CTA image-free refinement, revision 0.77

The office still and the decorative “01” marker were rejected. Keep this final application section image-free: the supplied Monday headline provides the visual weight through a large, asymmetric type composition; a single brand-accent rule leads into the body and application actions. Preserve the exact copy and destinations, maintain clear spacing on short desktops and phones, and do not add a generated replacement image or an ornamental number. This supersedes the CTA image guidance in revision 0.76.

## Final CTA layout, revision 0.76

The user rejected the prior CTA's overall left-right composition. The calendar and inset dark panel are removed. After the dark hiring section, return to the dominant Fog reading surface. Center the supplied heading as editorial type with Monday as the typographic focal point. Follow it with one wide workplace image from the existing Who We Are media and a separate lower row for the supplied body, two application actions and phone number. The photograph is supporting context, not proof of a named employee. The image may scale subtly with native scrolling; keep it clipped within its frame, with reduced-motion visitors seeing a stable image. Maintain the supplied exact destinations and all preceding section choreography.

## Final CTA art-direction refinement, revision 0.75

The approved calendar concept now sits in a rounded Deep Teal inset scene, framed by Fog page gutters. Use white headline type with Monday in Mint, a Mint primary application button, an outlined secondary email button and muted light supporting copy. This supersedes the open Fog two-column treatment of 0.74. Preserve the exact application wording, destinations, action order and one-time unpinned page turn.

The calendar has a larger presence, a folded rear support, layered paper edge, subtle paper shading, metallic binding highlights and a directional contact shadow. Keep the visual constructed from CSS and the existing GSAP; do not add raster textures, videos or a new renderer. Cursor tilt belongs only to the decorative object. Mobile keeps copy and actions first, then the scene. Check paper-label fit at the smallest widths, focus contrast on the dark panel and the complete object inside the inset panel. All earlier page sections remain unchanged.

## Final application CTA, revision 0.74

Place the final CTA after How hiring works. Use the approved Monday desk-calendar concept: supplied headline and application copy on the left, a dimensional teal stand and white paper calendar on the right. Label the large numeral DAY 01 to represent a first working day, not an actual scheduled date or guaranteed offer. Keep the supplied conditional wording and WhatsApp, email and phone destinations exactly. On phones stack the action group before the calendar so the application choices are immediately available.

Reuse globals.css palette and typography tokens and the shared Action component. Fog is dominant, deep teal anchors the object and text, mint is a small detail and the brief turning page. Treat 60/30/10 as visual emphasis. No new raster assets, video, WebGL canvas or dependencies. A scoped GSAP sequence turns one decorative page when the calendar enters view; it does not pin the section, intercept scrolling or replay on reversal. Fine-pointer movement tilts only the calendar by a few degrees; buttons remain stable. Reduced-motion and no-JavaScript visitors see the final calendar face and working native links. Preserve all preceding sections and motion.

## Hiring compass, revision 0.70

Append How hiring works after the founder film. Follow the user's circular instrument reference: one centered SVG ring on Deep Teal, with Apply upper-left, Screen upper-right, Task lower-right and Offer lower-left. Use Mint for the active station, pointer and accumulated arc. Retain existing type and palette tokens; no marine theme, sound or additional WebGL renderer. All four supplied descriptions remain server-rendered in logical order. Four native buttons offer direct and keyboard selection.

Native scroll drives a reversible 270-degree sweep with reading holds and a 0.55-second catch-up, without wheel interception or queued transitions. The stage has 400svh of scroll travel plus its viewport: each station holds for 55svh, and each turn uses 45svh. This gives substantially more reading space than the original 210svh travel. Desktop shows four descriptions around the ring with paired heading baselines; portrait/tablet shows station labels around the ring and the active description below, retaining the others for assistive technology. Keep the background contours quiet, distinguish the active step with a short mint rule and bright copy, and omit redundant microcopy beneath each step and dial. Keep the pointer clear of numbered selectors. Reduced motion, no JavaScript and short viewports show all four descriptions in natural flow. Keep floating-navigation clearance and preserve every earlier section. Evidence: docs/qa/hiring/v070.

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

Founder film recovery, revision 0.69: select the responsive source before requesting metadata; avoid a redundant load() after enabling preload. Failed media requests may reload the same source at most twice with bounded delays. After exhaustion, show a retry action without covering the preview controls; expanded and static players also offer the current device's direct video URL. User retry and restored connectivity may restart loading. Preserve the poster-to-film handoff, playback only after full expansion, reverse/offscreen pause, supplied thumbnail and caption-free source video.

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

## Founder edge-to-edge framing, revision 0.71

This supersedes the earlier contained expansion and letterbox behavior. Keep the complete supplied artwork in the initial preview. During expansion, uniformly scale the artwork to cover the current aperture, preserving proportions while progressively cropping its outer edges. The enhanced viewport player uses cover fitting for both responsive film sources, eliminating exposed pale or black side bands. Native natural-flow fallback players retain contain. Preserve preview depth, full-expansion playback gating, reverse pause, and the original source files. Native playback controls may still show their own temporary dark gradient.

## Founder preview depth, revision 0.65

Separate the pale thumbnail from the section with a restrained two-layer charcoal shadow and a 1px neutral outline, following its exact 24px rounded bounds. Place the shadow on a separate, non-interactive layer below the preview so the video's clipping cannot cut it off. Fade depth with expansion progress and remove it fully at viewport playback. Native fallback players retain the same understated depth. Preserve all supplied artwork and the play button below it.

## Who we are on mobile, revision 0.66

The supplied portrait office film enables this section below 1024px. Keep one semantic heading and the full supplied paragraph in normal reading flow above the sticky viewport, so short phones do not squeeze text around a miniature film. The portrait preview is exactly centered within the inset rounded teal/soft-neutral diagonal stage, expands with the panels opening, and only then advances through the film. Keep the complete 9:16 film visible at full size; use neutral black letterboxing on mismatched device ratios rather than cropping the office or final vision text. Native page scrolling reverses the sequence. The desktop composition and timeline remain unchanged. Reduced motion, Save Data and failure release to normal video controls.

## Motion handoff polish 0.67

Fit the expanding aperture to the actual portrait image, avoiding empty edge strips, and use Deep Teal behind the complete film instead of black. Preserve the image aspect ratio and original final-frame wording. The proof loading pose must match the closed laptop shown at the start of the accepted scroll sequence. Keep the existing summary image for natural-flow fallbacks only. Preparation should not change the visual layout or introduce a visible loader, sound, extra controls or a new progress bar.

## Mobile office-film viewport fit 0.72

Supersede the mobile contained endpoint: expand the portrait film proportionally until it covers both viewport dimensions. Clamp the aperture to the viewport once the image exceeds an edge, and move each mobile split panel beyond the full screen width. This removes exposed strips and diagonal fragments without stretching the film. Keep the burned-in vision message readable in phone/tablet crops; retain the source, final reading hold, centered opening and scroll sequence. Keep desktop framing unchanged. Recalibrating scroll geometry must synchronize the film progress instead of resetting its scalar tween to zero.

## Founder portrait thumbnail 0.73

For portrait viewports up to 1023px, use the dedicated 941x1672 founder artwork with the same wording and brand colours. This supersedes the landscape-only preview rule from 0.63. Serve the 76 KB AVIF with a 134 KB WebP fallback through responsive picture sources, and select the matching native video poster. Keep the landscape artwork on desktop and landscape phones. The preview slot and expansion calculations must use the selected artwork's aspect ratio. On wider portrait tablets, bias vertical cropping toward the upper headline; verify the full lettering and face remain inside the aperture throughout the zoom. Preserve playback gating, source footage, silent initial playback, watch action, reverse restoration and natural-flow short-screen/reduced-motion fallbacks. The portrait artwork is an AI-assisted recomposition of the supplied reference, generated with the built-in image tool; prompt and validation evidence are in docs/qa/founder/v073.

## Founder fast-scroll checkpoint 0.80

A first fast wheel or touch pass through the enhanced founder scene settles once on the fully expanded film, where muted playback can start. The next gesture leaves normally; do not require the visitor to watch the full film. A visitor who already dwelled at full view or used the Watch action is not pulled back. Direct hash navigation, reduced motion, and Save Data bypass this checkpoint. Settle direct #apply links after the earlier scroll scenes finish measuring so the final CTA is actually visible. Keep the accepted poster expansion, playback handoff, reverse pause, and all adjacent scenes unchanged.
