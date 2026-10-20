# PractiScale hero — Technical requirements

Version 0.29 | 20 October 2026 | Status: Compact CTA columns and desktop clearance verified

## Stack and routing

Next.js 16 App Router, React, TypeScript, Tailwind v4, GSAP and Three.js. Dependencies pinned to the installed lockfile; Node >=22.12. Read applicable bundled Next.js guides before changes. Homepage is the only active content route. Root layout renders global navigation, the introduction host, main content and Organization JSON-LD. No footer. Earlier page drafts remain outside active routes in docs/deferred-pages/.

## Components and responsive layout

HeroLayout also publishes --hero-copy-bottom for the 768-1199px card group. Run npm.cmd run test:composition to validate all-frame silhouette clearance and mobile copy outcomes whenever hero layout/media changes.

Page copy/links are server rendered. Navigation, Preloader, HeroLayout and HeroSequence are client leaves. The desktop header is fixed but transparent and pointer transparent, with interactive logo/navigation children. IntersectionObserver watches the document-top marker at 24px to toggle the logo's backing. The mobile reference card uses the original primary PNG through a picture source, a 44px two-line toggle and a scrollable disclosure menu. Navigation collapses at 1200px; the phone card applies below 768px.

The ordinary hero stage uses the dynamic viewport height minus its outer gutters. Short-height desktop typography is compact enough to keep the trust cards and bottom-right link visible. A ResizeObserver watches reading content/trust dimensions and selects content flow when the available space cannot hold them. Short phones/landscape and text enlargement grow instead of clipping content. Keep the original full logo at 240px and preserve all exact trust values. No decorative GROWTH element is rendered.

## Original introduction integration

public/preloader/original.html preserves the complete supplied HTML recovered from its earlier file-read record, with normalized line endings. SHA-256 and integration notes are in preloader-source.json. public/preloader/embedded.html retains the original visual CSS, SVG/template, embedded logo data and animation script verbatim.

Host-only changes hide the demonstration .site and #ctl, make the iframe document transparent, omit font requests used only by hidden demo copy, and add a same-origin event bridge. Validate message origin, source window and payload source. Ready/progress/landed/completion events drive the parent host; they do not replace original animation timing. The original 3s fill is animation progress, not download progress. The original colors, gradients and white wordmark are permitted by the user's explicit as-is instruction.

The parent overlay is server rendered opaque before hydration. It locks scroll, preserves prior inert/focus states and traps Tab while active. Escape dismissal fades out through a native timeout so recovery does not depend on an animation ticker. Normal completion unmounts after the original window reveal. A 9s host guard escapes failed iframe/bridge loading. noscript hides the overlay and leaves the hero readable. Reduced motion retains the source's own shorter timing; the host hero landing transform is disabled.

## Media pipeline

Current source: Wan 3.0 Prime job 5a9cf3ed-7741-427b-a175-55f4c55eb210, generated from the user-approved revised neutral poses based on authentic footage references. Four seconds, actual 1440 x 1440 pixels, 30fps, no audio; all 120 native frames are active at 960px desktop and 540px mobile with local U2NETP alpha segmentation. Prompts, source checksum, accepted blink and exact parameters are recorded in wan-prime-prompts.md, wan-prime-video-plan.json and wan-prime-video-qc.json. Assets use /media/ceo-prime-v1/ and the current hero-manifest.json. Original input footage and superseded media are preserved. Processing stays local.

Three.js uses a transparent orthographic plane, four compressed-frame fetch workers, at most eight decoded bitmaps, one GPU texture and DPR capped at 1.5. Render on demand and clean up on unmount. GSAP ScrollTrigger scrubs the actual hero scroll range with 0.65s smoothing; reduced motion, missing WebGL and context loss restore the static portrait. The current approved Prime clip contains a natural blink explicitly accepted by the user. Use its 120 ordered native frames and holdFraction=0.15; no blink removal or paid replacement is authorized. Do not report a prompt or functional scroll test as proof of visual quality.

## Repeatable verification

- npm.cmd run build: production compile and TypeScript validation.
- npm.cmd run test:browser: hero-only scope, real links, menus, focus, responsive overflow, no JavaScript, reduced motion and automated WCAG A/AA checks.
- npm.cmd run test:motion: forward/reverse frames, mobile scroll, missing WebGL/context loss, failed image and stalled-font skip.
- node scripts/qa-preloader.cjs: original script/template/CSS preservation, visible phases, native completion, refresh, keyboard, orientation, no JavaScript, reduced motion and failed bridge guard.
- node scripts/qa-layout.cjs: thirteen viewport sizes, phone reference card, ordinary desktop footer visibility and enlarged text spacing.

Reports live in docs/*-qa.json. Rendered evidence lives in docs/qa/. Review screenshots after passing checks. A light-section fixture was previously used only inside browser QA to verify global floating navigation; no additional site section was added.

Previous v0.6 verification: production build passed; 83 checks passed across 13 viewport cases, including active-preloader accessibility and hash entry. No automated WCAG A/AA violations were found. Original script, visual CSS and SVG/template equality passed. Final desktop, short-window and mobile renders were inspected after testing. Known media limitation remains as documented above.

## Independent visual QC and shared alignment — 20 October 2026

Treat visual QC as part of completion: inspect real desktop/tablet/mobile renders and scroll states, identify and fix spacing/alignment/typography issues without waiting for the user to report them. Functional tests alone do not certify visual quality. Preserve scope and original artwork.

Use shared responsive gutters for desktop logo, navigation edge, divider, reading content, trust cards and hero footer. Keep 24px between header bottom and divider; align the supporting text block with the main editorial block. Strengthen navigation readability while retaining prescribed CTA type. Inset the phone card 8px inside the hero instead of touching its outer edges, with balanced internal padding. At widths below 348px use the approved original mark alone with proper clear space rather than shrinking the full logo below 240px.

Visual QC refinement: responsive shared gutters are 44px desktop, 70px at 1600px+, 30px at 1200px and below, and 20px for phone content. Desktop artwork and navigation edges align to the hero divider/content. The header is vertically centered in 64px, with an initial 24px divider gap. The supporting block shares the editorial anchor, and wider headline measures prevent a stranded final word. Phone card has an 8px inset inside the hero; its primary logo/menu edges align to the reading gutters. Navigation labels are 13px, with the unchanged 15px primary CTA standard. The scrolled logo backing reserves 17px around the full artwork. A temporary light surface is only a browser QC fixture. Run node scripts/qa-alignment.cjs and visually inspect docs/qa/alignment/ before completion.

Version 0.7 visual verification: production build passed. 76 alignment checks, 27 responsive/reflow checks and 22 interaction/accessibility checks passed. Desktop, short desktop, tablet, narrow phone, normal phone, open menu, scrolled and temporary light-surface renders were independently inspected. The visual pass found and corrected insufficient backing behind the full logo. A concurrent software-rendering motion timing race was reproduced as timing-dependent; isolated rendering reached frame 112 at scroll 620 within 1.8s, then returned to frame 16 at scroll 100. Regression checks now wait for bounded actual rendered progress rather than a fixed sleep. Original preloader source/artwork and current video are unchanged. The no-blink media revision remains pending.

Final v0.7 result: all 136 alignment, layout, interaction/accessibility and motion checks passed. Actual render/scroll states were visually inspected independently. Project AGENTS.md now requires this visual QC before UI delivery.

## Whole-hero QC � 20 October 2026

The secondary �Starts with a skill� action opens the same approved training enquiry as the primary CTA, rather than a self-anchor. Closed navigation must leave Escape focus unchanged; leaving the disclosure with the keyboard closes it. Motion preference changes apply immediately without a reload. Switching the phone/desktop breakpoint selects the appropriate frame resolution and cancels the previous renderer/requests. Layout-driven hero height changes refresh scroll geometry. Context loss releases frame resources and stops downloads while restoring the original static portrait.

Existing video pixels and preloader artwork/timing remain unchanged. The current video's blinks and post-frontal drift remain pending the separately cost-reviewed media revision. No generation credits are used for local QC.

Phone refinement: hide the divider stroke below the header at widths below 768px. Preserve its spacing and the introductory tagline; the desktop divider remains visible.

Reduced-motion layouts omit the extra animation scroll range, including tall content and short landscape windows. Retain ordinary scrolling needed to read content. The scroll hint has since been removed at all viewport sizes. This setting also responds to changes without refreshing.

Version 0.8 verification: production build passed; 108 checks passed across responsive layout (13 viewports), whole-hero interaction/lifecycle, accessibility, forward/reverse motion and original-preloader suites. No automated WCAG A/AA violations or runtime errors were found. Actual desktop, tablet, phone, short phone, open menu, enlarged-text and scroll-end renders were inspected. Original fill/open/zoom phases were reviewed after an isolated timing run; the original source is unchanged. The existing no-blink/single-turn media requirement remains pending. No credits spent.

## Consistent first visit and reload introduction � 20 October 2026

Use the same complete original animation and reveal on both the first visit and subsequent reloads. Mount the original iframe only after the host has installed its message listener, focus containment and scroll lock. The opaque server-rendered host remains visible before startup. This prevents a fast iframe from losing its initial ready event during delayed hydration, which previously left an opaque backing behind the logo-window reveal. Preserve the original SVG, script, artwork, colors and timings. Verify delayed page scripts, uncached visits, repeat reloads, skip and the original phases.

Remove the �Scroll to move forward� link and arrow from the hero on every screen size, per the latest user request. Retain the existing scroll-driven portrait behavior and hash compatibility.

Version 0.9 verification: production build and 52 focused preloader/reload checks passed. A deliberately delayed first visit and two subsequent reloads were tested at 1440�900 and 375�812. The host consistently received readiness with scroll locked, showed a transparent backing during the logo-window reveal and unlocked on original completion. First-visit/reload renders were visually reviewed. Original source preservation, skip/Escape, focus containment, orientation, reduced motion, no JavaScript and failed-bridge recovery passed. The removed scroll hint was absent on all six visits. No media generated or credits spent.

Repeat this consistency check with `node scripts/qa-preloader-reload.cjs`; preserve the separate `test:preloader` source/phase/recovery suite.

## Intro control removal and stat alignment � 20 October 2026

Remove the visible Skip introduction button entirely. Retain Escape dismissal, focus containment on the introduction dialog, automatic completion and failure recovery. Preserve the original animation and consistent first-visit/reload startup.

On desktop/tablet, align the lower edges of both trust cards with the bottom-right hero link using the existing 36px inset. The deleted scroll hint no longer needs a reserved row under the cards. Keep equal card heights, consistent numeric/label baselines and a two-line minimum label slot; preserve exactly 100+ and 46,000. Phone cards retain the existing stacked footer spacing and content-flow behavior.

Version 0.10 verification: production build and 73 focused checks passed. Responsive/stat geometry was tested at 14 viewport sizes, including 1858�874, with equal card heights/widths, shared number and label rows, common internal insets and desktop alignment to the bottom hero link. Actual large desktop, short desktop and phone renders were inspected. The preloader has no visible skip control; original source preservation, completion, cached refresh, Escape, dialog focus containment, reduced motion, no JavaScript and failure recovery passed. Existing QA setup now uses the retained Escape action. No media generation or credits used.

## Hero background gradient � explicit user exception, 20 October 2026

The latest user reference authorizes a professional gradient behind the hero portrait. This is an exception to Edition 1.4's background-gradient restriction for this hero only. Use Deep Teal and its existing surface tone, Growth Teal and Bridge Blue; keep Proof Amber reserved for verified numbers. Use a prominent soft halo around the portrait�s head and shoulders, dark reading areas at the edges and a phone-specific lower focal point with dark upper/lower protection for text. Keep the original preloader, logo and button gradients intact.

Implement as static CSS background layers, with a Deep Teal fallback and no extra image, media generation or animation loop. Verify rendered text contrast against the actual gradient, inspect desktop/tablet/phone renders and retain the established hero layout, stat alignment and scroll behavior.

Gradient refinement: the user explicitly requested a more prominent halo around the character. Increase the off-center teal and blue light sources; use smooth dark edge masks on desktop and separate tablet/phone focal points to protect reading contrast. Keep the effect static and preserve the portrait pixels.

Version 0.11 verification: production build passed. The final prominent halo was captured at nine viewport sizes in initial/end scroll states. All 151 conservative gradient-text checks passed; ordinary text over the gradient measured at least 5.7:1. This figure excludes buttons/cards, which retain their previously approved opaque surfaces and CTA gradient. All 22 browser interaction/accessibility checks passed with no automated WCAG A/AA violations or runtime errors. Desktop, tablet, phone and short-phone end renders were visually reviewed. Static CSS adds no animation loop or media generation; no credits spent. Original portrait/video and preloader assets remain unchanged.

## Hero CTA simplification - 20 October 2026

Remove the Explore careers link and its arrow beneath Explore training, as requested. The editorial action group contains only Explore training. Let the phone portrait follow the shorter content group naturally; verify its clearance, trust-card spacing and footer visibility.

CTA-removal QC: HeroLayout follows the existing phone content-flow rule at heights up to 860px, including when the shorter editorial group would otherwise fit. Verify matching copy/stat/footer gutters at 375x860.

Version 0.12 verification: production build and 61 responsive/layout checks passed across 15 viewport sizes. The removed hero careers action is absent. The 375x860 boundary now preserves the same copy, stat and footer gutters. Desktop, tablet and phone renders were inspected. The full PRD was restored from its saved copy after an interrupted encoding write; both requirements documents are intact and saved as UTF-8.

## CEO video replacement preflight - 20 October 2026

Higgsfield connection verified. Afra - CEO Master Identity is completed with 80 reference images; selected starting-image job ef274b1d-5243-437d-8e5e-32709567a7b3 is completed and accessible. Reuse this portrait and its existing teal suit; no new still generation is planned.

The user approved exactly one silent, square, four-second Kling 3.0 Pro attempt at 7 credits. Job f2a2311d-84d0-41af-9af3-5da3a24c9e47 completed on 20 October 2026, reusing the existing teal suit and black shirt. All 97 extracted frames were visually reviewed at 24fps. The candidate failed QC: visible eyelid closures around frames 34, 64 and 85 (one-based), plus chin lift and post-turn pose changes. It has not replaced production. Balance changed from 597.32 to 590.32 credits, confirming 7 credits used. Full parameters are in ceo-video-replacement-plan.json; review evidence is recorded in ceo-video-qc.json. No further paid attempt was submitted or authorized.

Require one monotonic head turn into direct frontal eye contact, then a stable hold, with eyes open throughout, mouth closed, no lip movement, upright head, fixed shoulders/body and fixed framing/exposure. Preserve the original face, full beard, hair and suit. The original prompt's permission for one blink is explicitly superseded.

Inspect every retained frame for blinks, expression changes, facial artifacts and likeness. Only a clean candidate may replace production. Freeze the last accepted frontal frame in the website to prevent post-turn drift; do not rely on generated idle movement. The prior optical-flow blink-removal experiment remains rejected. Any further paid attempt requires a new cost review.


## CEO video review outcome - 20 October 2026

Version 0.13 media review: the approved replacement attempt is rejected. Keep the existing production assets and renderer unchanged; the no-blink/single-turn replacement requirement remains outstanding. Freezing an endpoint cannot repair a blink occurring earlier in the turn, and simply removing those frames would introduce motion jumps. No optical-flow repair was used. Source and review evidence were saved for reference. No website source code or active media changed in this revision, so prior interface validation remains historical and no new build is claimed.


## Original-footage CEO reference library - 20 October 2026

The user rejected the generated charcoal portraits because the likeness did not match and stopped that video workflow. Those generated images are not approved identity references. No new Higgsfield attempt or portrait upload was completed.

The user supplied C6874.MP4 and C6876.MP4 and requested frame-by-frame review plus a few character shots for future use. Decode and review completed locally at the original 25 fps: 468 frames from C6874 and 156 from C6876, 624 total, with no review-index omissions. Every frame was inspected in consecutive face contact sheets; the six selected native-resolution crops were inspected separately.

Saved six authentic photographed reference shots under CEO Images/Reference Library 2026-10-20/. Include six unretouched native-pixel face crops, six corresponding 3840 x 2160 PNG frames, a labelled preview, source/frame/timestamp manifest and verification report. Pixel comparison confirms each crop exactly matches its rectangle in the decoded source frame. Original source-video hashes are unchanged. The ZIP passed its integrity check.

Use the near-frontal neutral shot as the primary reference, side/three-quarter views for facial geometry, and the smile shot only for an intended smiling expression. C6876 clips the hair crown in the original video; retain that honestly and use C6874 for the full hairstyle. No generative reconstruction, beauty retouching, upscaling, mirroring or background removal was applied. Future generated media still requires a likeness review against the real footage.

This revision adds a reusable local reference library only. Active website media and UI remain unchanged. No new website build or browser validation is claimed. No generation credits were used and no face data was uploaded to an external service for this reference-library task.


## Head-and-torso pose review - 20 October 2026

The user requests still poses for review before any video creation. Video generation and new portrait uploads are on hold until that review. Prepared a revised side-facing start with a target 35-40 degree head turn and 10-15 degree torso turn in the same direction (subject right / viewer left). Reused the matching frontal end portrait unchanged. Keep charcoal suit, black open-collar shirt, restrained teal rim light, full hair/shoulder clearance and fixed camera framing. These are approximate pose targets; no anatomical angle measurements are claimed.

Review files and the exact starting-image prompt are saved in CEO Images/Pose Review 2026-10-20/pose-review.json, with the two full-resolution 1254 x 1254 PNGs and a labelled comparison board. The ending PNG matches the previous end file byte for byte. Both stills were visually checked for open eyes, closed lips, framing, clothing and recognizable likeness against the original-footage references. Generated stills are not pixel-exact original photographs; user review is required. These drafts are not approved identity ground truth or approved video keyframes.

If the user approves this pair, the proposed subsequent motion changes from head-only rotation to one restrained coordinated head/torso turn into the frontal end, followed by a still hold. No new video was submitted, no additional Higgsfield credits were spent, and no active website assets changed in this revision. No new website build or browser validation is claimed.


## Reviewed pose video attempt - 20 October 2026

The user reviewed the revised side-facing head/torso start and frontal end and explicitly instructed that they be used for video creation, with face quality preserved. This approval fulfills the prior pose-review hold. Uploaded only the two approved full-resolution 1254 x 1254 PNG keyframes to Higgsfield; both uploads returned HTTP 200 and were confirmed.

Submitted exactly one MiniMax H3 four-second 2K attempt, job d101b7fc-91b1-4338-a086-514e6e241795. Exact cost preflight: 8 credits. The prompt requests a single restrained coordinated head/torso turn, steady open eyes, closed lips, fixed camera, stable identity, natural skin/beard detail and a motionless frontal finish. No automatic retries are authorized. Full parameters are in reviewed-pose-video-plan.json.

The result must be inspected frame by frame for blinks, softness, facial drift, flicker, warping, expression changes and unintended motion. A prompt or 2K output label does not establish preserved likeness or native facial detail. Keep active website media unchanged until a clean candidate is verified; freeze a clean final endpoint if integrated. Generation is currently pending.


## Provider failure and alternative quotes - 20 October 2026

MiniMax H3 job d101b7fc-91b1-4338-a086-514e6e241795 ended in failed status with no video or detailed failure reason returned. No frames exist to inspect. Higgsfield balance is still 590.32 credits, unchanged from before submission; net credit use for this failed attempt is zero. Keep the user-approved PNG poses and current website unchanged.

The user authorized researching other models while protecting credits and allowing approval requests. Read-only cost estimates using the confirmed approved starting/ending media returned: Veo 3.1 Lite four seconds, silent, auto ratio: 6 credits; Wan 2.7 four seconds at 1080p: 10; Wan 3.0 four seconds at 1080p with thinking enabled and audio off: 14; Wan 3.0 Prime with those settings: 24. None of these alternatives has been submitted.

Recommend one Veo 3.1 Lite attempt at 6 credits, awaiting user cost approval. It supports both approved keyframes. The connector does not expose a resolution control for this model, so record actual delivered dimensions and inspect face quality before using any result. Do not infer quality superiority or guaranteed blink suppression from the model name. Full ready parameters and quote comparison are in alternative-video-plan.json. Do not generate a batch, change models or submit an additional paid attempt without authorization.


## Veo two-keyframe duration restriction - 20 October 2026

The user approved one four-second Veo 3.1 Lite attempt for 6 credits. Submission was rejected before any job was created: the provider requires duration 8 when both start_image and end_image are present. The catalog and price-only preflight had not exposed this combined-input constraint. No video resulted and no credits were spent; balance remains 590.32. Do not drop an approved keyframe or increase duration/cost silently.

New read-only quotes with the same confirmed poses: Veo 3.1 Lite eight seconds, silent: 12 credits; Wan 2.7 two seconds at 1080p: 5 credits; Kling 3.0 Pro three seconds, silent: 5.25 exact credits. Quotes establish price, not successful provider validation or output quality.

Recommend one Wan 2.7 attempt at 5 credits as a different model within the user's desired small budget. Its catalog supports both starting/ending images, square output, 1080p and two-second duration. This model change awaits user approval. A shorter source sequence can still be scrubbed slowly with website scroll and end on a fixed clean pose. Full request is saved in wan-budget-video-plan.json. No alternative job submitted, no active website files changed, no new browser/build checks claimed. Keep face-detail and no-blink QC requirements intact.


## Approved Wan 2.7 attempt - 20 October 2026

The user explicitly approved one Wan 2.7 attempt for 5 credits. Submitted job 9b84ff14-a82f-4702-8efd-f960e9944d59, two seconds at 1080p, square, using the same two confirmed reviewed PNG keyframes. One output only. Preserve all face-detail, likeness, open-eye, closed-mouth and single coordinated-turn requirements. Actual output dimensions/frame cadence and every native frame must be reviewed before using the result. Website assets remain unchanged while generation is pending. No further paid attempt is authorized.

## Wan 2.7 result and quality decision - 20 October 2026

Job 9b84ff14-a82f-4702-8efd-f960e9944d59 completed. Exactly 5 credits were spent (590.32 to 585.32). The requested two-second 1080p tier delivered 60 native video frames at 30 fps, 1440 x 1440 pixels. Delivered dimensions do not establish additional original facial detail.

All 60 native frames were inspected in consecutive full-frame and face-crop sheets, with six enlarged crops checked for detail. One blink occurs during the turn at approximately frames 9-15 (one-based), 0.267-0.467 seconds; frame 11 at 0.333 seconds visibly shows eye closure. This fails the mandatory no-blink requirement. Facial identity is broadly recognizable, but motion introduces some texture softening/change; exact likeness and unchanged fine detail cannot be certified. The pose becomes mostly frontal by about one second and retains slight residual movement afterward. The mouth appears closed without obvious speaking.

The candidate is rejected for hero integration. Holding the final frame cannot repair a blink during the turn. Do not skip blink frames or use the previously rejected ghosting eye interpolation. The provider also included AAC audio despite the silent-shot prompt; the review MP4 removes audio by video stream copy without re-encoding the video.

The approved keyframes remain approved. Active website media and code are unchanged, and the existing hero video still has its previously documented blink issue. No website build or browser tests were rerun for this media-only review. No further paid attempt is authorized. See wan-video-qc.json and the saved review evidence. Earlier pending-generation and pre-approval entries above are historical; this result is the current status.

## Wan 3.0 Prime approval and expression correction - 20 October 2026

The user selected Wan 3.0 Prime at 24 credits and requested the exact prompts. This authorizes one four-second, 1080p, square video with thinking enabled and audio disabled, subject to the existing reviewed-pose workflow; no automatic paid retries. No Prime video has been submitted or additional Higgsfield credits spent.

The user correctly identified that the generated keyframes themselves contained a slight smiling expression. Correct both proposed starting and ending portraits toward a matching neutral resting expression before another video attempt. Two sibling neutral-expression candidates were created with the built-in image editor using the reviewed composition and genuine footage identity references. The original approved poses are preserved. Proposed images and exact image-edit/video prompts are saved in the local output folder PractiScale-CEO-Wan-Prime-Review. These revised poses await user review before upload/submission. Generative edits cannot be assumed pixel-identical or perfectly identity-preserving; compare full portraits and genuine footage references.

The planned four-second video holds the start for 0.3 seconds, makes one coordinated head/shoulder turn until 3.0 seconds, then holds frontal eye contact to 4.0 seconds. Neutral expression, closed relaxed lips, open eyes, stable facial detail and no extra motion remain mandatory QC criteria. Cost and prompt constraints do not guarantee those outcomes. Website code and media remain unchanged; no new UI tests are claimed for this image/prompt review.

## Approved neutral poses submitted to Wan 3.0 Prime - 20 October 2026

The user approved both revised neutral-expression portraits with "use them." Both full-resolution PNGs were uploaded and confirmed. Submitted exactly one job: 5a9cf3ed-7741-427b-a175-55f4c55eb210, Wan 3.0 Prime, four seconds, 1080p, square, thinking enabled, audio disabled, using the exact shared prompt. Final cost preflight confirmed 24 credits. Balance before submission: 585.32. No retry is authorized. Provider completion, actual output metadata and all-native-frame QC are pending; active website media/code remain unchanged. The preceding pose-review-pending entry is historical and is superseded by this approval.

## Current approved hero video - 20 October 2026

Wan 3.0 Prime job 5a9cf3ed-7741-427b-a175-55f4c55eb210 completed: four seconds, 1440 x 1440 actual pixels, 30 fps, 120 native frames, no audio. Exactly 24 credits were spent (585.32 to 561.32). All 120 source frames were visually inspected in consecutive face/full-frame contact sheets. There is one blink during the turn around 0.53-0.77 seconds. The user explicitly accepted it: "its still have a eye blink but use this video." This acceptance supersedes the no-blink requirement for this specific clip. Do not reject, regenerate, skip blink frames or synthesize replacement eyes. Approved neutral-expression keyframes and original source footage remain preserved.

Integrate every native frame in source order, locally segmented to RGBA WebP at 960px desktop / 540px mobile. Face RGB is not retouched; normal resizing and compression apply. Active assets use /media/ceo-prime-v1/ and the updated hero-manifest.json. The first-frame transparent poster supplies static/reduced-motion/WebGL-failure fallback; the matching composited social poster is used for metadata. Old /media/frames and root ceo-* assets are legacy preserved files and are no longer the active portrait.

The source turn reaches mostly frontal around one second, sooner than requested, and contains minor residual motion. The website scrubs the real source at 0.65-second smoothing, then clamps the last frame through the final 15 percent of scroll to stop continuing movement. Reverse scrolling remains supported. Exact facial likeness and perfect expression constancy are not certified by functional browser tests. Build, responsive actual-render, motion/fallback and existing preloader regressions must pass before reporting integration complete. No further paid generation is authorized.

## Prime video integration verified - 20 October 2026

The accepted Prime video is now the active hero sequence. All 120 native frames, including the user-accepted blink, remain in source order at both desktop and mobile resolutions. Matching poster fallback and social metadata are installed. The final frame is fixed during the last 15 percent of scroll; reverse scrolling works. No further generation occurred after the single 24-credit attempt.

Production build and TypeScript passed. Final regression results: 22 browser/accessibility checks, 13 motion/fallback checks, 61 responsive layout checks across 15 viewport cases, 27 whole-hero lifecycle checks and 22 original-preloader checks: 145 passed, no runtime errors or automated accessibility violations. Six additional actual-render checks passed for the approved source at desktop/tablet/mobile start and end. Independently inspected these renders plus mobile menu, short-phone endpoint, enlarged-text desktop and original-preloader fill evidence. The motion test wait now covers the existing nine-second intro recovery guard; lifecycle tests await the observable new-resolution request and visible fallback rather than racing React updates. These were test synchronization corrections; preloader artwork/timing is unchanged.

The current integration report is wan-prime-integration-qa.json. Historical pending, rejected and no-blink requirements above are superseded for this specifically accepted source. The original source MP4 and final screenshots are saved in the local output folder PractiScale-CEO-Wan-Prime-Review. Only the homepage hero, shared navigation and original introduction remain in scope; no deployment or new sections were added.

## Portrait/card separation and phone text QC - 20 October 2026

The user identified that the visible jacket was hidden behind desktop trust cards and phone copy left an unnecessarily empty right strip. Earlier visual QC missed these defects even though prior automated suites passed. Correct this through explicit composition checks rather than relying on test counts alone.

At 1200px and above, offset the portrait only as far right as needed to clear the trust cards. At 768-1199px, group the cards 24px below the CTA/copy and position the portrait beside them, preserving the full head and separation from supporting copy. HeroLayout publishes --hero-copy-bottom from the measured editorial position/copy height and cleans it up on unmount. Phone headings/paragraphs use the full content column, with responsive heading size and natural wrapping instead of inherited 11ch/29ch limits; avoid an orphaned last word. Keep normal content-sized CTA buttons and deliberate gutters.

Permanent requirements now appear in AGENTS.md and COMPOSITION-QC.md; a memory update note was saved at the user's explicit request. The npm test:composition regression projects the visible alpha envelope of all 120 source frames into real viewport layouts, requires at least 16px portrait/card separation for desktop/tablet, checks head/supporting-copy clearance and verifies mobile paragraph measure, final-word grouping, two-line heading and balanced width. It detected 13 failures on the old layout and passes all 54 assertions after the fix.

Production build and TypeScript passed. Final focused checks: composition 54, responsive layout 61 across 15 viewport cases, browser/accessibility 22 and motion/fallback 13, all 150 passed with no runtime errors or automated accessibility violations. Actual start/end renders were captured at nine viewport sizes and independently inspected, including 1192px narrow desktop, 768px tablet, 530px phone, 430/375px phone and 320px short phone. Current artifacts: composition-verification.json and composition-qa.json. No source video, blink, original preloader artwork/timing, brand identity or other sections were changed. No further generation credits were spent.


## Mobile editorial refinement - 20 October 2026 (current)

Remove the hero header divider stroke at every width while retaining its tagline, location and spacing. Hide the separate Built for growth label on desktop/tablet; preserve the supplied logo artwork and its embedded tagline. This supersedes earlier statements that the desktop divider remains visible.

Preserve every existing CTA label and destination: Explore training, Your next chapter / Starts with a skill and Apply on WhatsApp. Retain all approved copy, trust figures, local fonts and palette. The approved video, ordered 120-frame sequence, final hold and accepted blink are unchanged; no paid media generation is authorized.

Phone composition uses consistent responsive reading gutters, a two-line Sora heading, readable Manrope body copy and a content-sized primary action. Give the portrait a dedicated cinematic frame with static teal/blue atmospheric lighting, full-head clearance and a soft lower-body fade. Place aligned proof figures below the portrait instead of floating over it. Keep the next-chapter invitation below the proof row with an adjacent arrow and a generous touch target. The light floating mobile header retains the original logo/mark and dark menu control; refine padding, press feedback, disclosure rotation and a restrained menu entrance. Respect reduced motion and safe areas.

Mobile content grows naturally on short screens and with enlarged text; do not force the whole hero into one viewport. Use .hero-visual as the mobile scroll region and .hero-frame as its sticky, clipped portrait viewport. Its explicit height reserves the scrub range; center the frame vertically with at least 24px below the fixed mobile header. GSAP maps the approved 120 frames to this region and clamps the endpoint to the available page scroll. Desktop keeps its existing whole-hero scroll geometry. Refresh the mobile trigger after the original introduction unlocks main, because the landing transform temporarily changes child geometry. Clean up the introduction MutationObserver with the renderer. Reduced motion collapses the scrub region to the portrait height. No additional page sections. Future sections remain out of scope. Verify 320-430px widths, 530px and tablet/desktop regression cases, source-frame silhouette clearance, live forward/reverse/hold motion, menu/focus, text reflow, actual renders and the original preloader before sign-off.


## Version 0.26 verification - 20 October 2026

The final default npm.cmd run build passed with Turbopack and TypeScript. All 318 checks passed: mobile-editorial 118, composition 54, layout 61, hero 22, motion 13, whole-hero 28, preloader 22. The mobile suite sweeps every CSS width from 320 through 430, checks exact CTA wording and statistics, normal/enlarged reading flow, header fit, menu/Escape behavior, and actual start/turn/end states on short and tall phones. The composition suite projects all 120 source-frame alpha silhouettes across phone/tablet/desktop layouts. Motion and lifecycle checks cover forward/reverse/hold, resize-at-bottom, reverse after resize, reduced motion, context loss and cleanup. No runtime errors or automated accessibility violations were found.

Mobile uses a dedicated sticky portrait frame rather than pinning the entire hero. The explicit region height creates real scroll travel; its trigger is refreshed after the original introduction unlocks main. An explicit GSAP from/to range and refresh synchronization preserve correct initial/end poses during breakpoint changes. The 15% final-frame hold, approved source and accepted blink remain intact. The original-preloader source, phases, refresh, Escape, no-JavaScript visibility and failure recovery passed. No generation credits spent. Actual desktop, tablet, phone, menu, enlarged-text and live-turn renders were independently inspected. Verification is local Chrome; physical-device testing has not been performed. See mobile-editorial-verification.json and docs/qa/mobile-editorial/.


## Mobile gradient continuity and circular CTA - 20 October 2026 (current)

The user identified a hard rectangular edge at the top of the mobile portrait lighting and unused space beside the next-chapter invitation. Keep the existing portrait sequence, brand colors, exact CTA copy and enquiry links. Apply a transparent-to-opaque-to-transparent mask only to the atmospheric light layer, so it starts and ends without a clipped rectangle. Never fade, blur or recolor the face to conceal this seam.

Use the supplied thin circular-arrow reference for the secondary invitation: a 56px outlined circle with a restrained diagonal arrow, hover/focus/press feedback and the existing link semantics. On phones the existing CTA label stays left-aligned and the circle aligns to the opposite reading gutter, making the whole row a usable link. This supersedes the earlier instruction to keep a bare arrow immediately beside the text. Retain the existing label and heading exactly. Verify actual screenshot pixels at the light boundary in static and pinned scroll states, circle/label clearance at 320-430px, enlarged text, desktop/tablet composition and the existing motion behavior before sign-off.


## Version 0.27 verification - 20 October 2026

Production build and TypeScript passed. All 283 focused checks passed: hero-finish 15, mobile-editorial 118, composition 54, layout 61, hero 22, motion 13. Screenshot-pixel regression reproduces the former clipped glow (maximum channel step 6) and verifies a maximum step of 1 at the corrected top boundary at 320, 375, 430 and 530px, including the live pinned portrait state. The 56px circle, centered diagonal arrow, right-gutter alignment, exact copy/link destinations, visible keyboard focus and text enlargement passed. The existing all-frame silhouette, responsive layout, browser/accessibility and forward/reverse/hold/fallback checks passed, with no runtime errors or automated accessibility violations.

Actual full mobile layouts, live pinned lighting, enlarged text and desktop CTA/card alignment were visually reviewed. The original preloader, source video, native frame assets and accepted blink were not changed. No generation credits spent. These are local Chrome checks; physical-device testing has not been performed. See hero-finish-verification.json and docs/qa/hero-finish/.


## CTA vertical centering - 20 October 2026 (current)

Center the complete 56px circular arrow against the full next-chapter block, including its eyebrow and link label. Keep the circle at the right reading gutter and reserve space in the link so enlarged text stays clear. Preserve the exact wording, destination, existing lighting, portrait and scroll sequence. Add a regression that compares the circle center with the complete CTA block center.


## Version 0.28 verification - 20 October 2026

Production build and TypeScript passed. All 287 focused regression checks passed. At 320, 375, 430 and 530px, the circle center matches the complete CTA block center within 1 CSS pixel. The existing mobile suite also covers every width from 320 to 430 and enlarged text; responsive, composition, browser/accessibility and motion checks passed. Actual mobile CTA and enlarged-text renders were visually inspected. Copy, destinations, lighting and source media are preserved. No generation credits used. Validation is in local Chrome.


## Compact CTA columns - 20 October 2026 (current)

The user reported the desktop caption overlapping the absolutely positioned circle and excessive empty space inside that circle. Replace the overlay arrangement with a real two-column link: the existing eyebrow/label form one text group, and a 44px outlined circle with an 18px diagonal arrow forms the other. Use a 16px gap and vertical center alignment. The whole group remains one accessible enquiry link named by the unchanged Starts with a skill label. Phones retain the right-gutter circle; desktop text remains right-aligned. This supersedes the 56px circle and absolute positioning described in older entries.

Verify the real caption and label rectangles stay at least 15px clear of the circle on phone, tablet and desktop, including 1192px and enlarged-text cases. Check complete-link hit containment as well as geometric centering. Preserve all copy, brand colors, lighting, source video and original preloader.


## Version 0.29 verification - 20 October 2026

Production build and TypeScript passed. All 309 focused checks passed: {'hero-finish': 41, 'mobile-editorial': 118, 'composition': 54, 'layout': 61, 'hero': 22, 'motion': 13}. Actual caption and label bounds remain at least 15px clear of the compact circle at ten widths from 320 through 1920, including 768/1024/1192px and enlarged phone text. The icon remains vertically centered and fully inside the single link. Desktop/tablet full-hero and CTA renders, mobile CTA and enlarged text were visually inspected. Exact CTA wording and enquiry destination remain intact. No runtime errors or automated accessibility violations were found. Portrait assets, lighting and the original preloader are unchanged; no generation credits spent. Validation uses local Chrome. See compact-cta-verification.json.
