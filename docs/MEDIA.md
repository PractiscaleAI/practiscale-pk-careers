# Hero media provenance

Current active source: Wan 3.0 Prime 5a9cf3ed-7741-427b-a175-55f4c55eb210, accepted by the user including its blink. Active files are /media/ceo-prime-v1/ and hero-manifest.json. Earlier generation entries below are historical; current integration and verification appear at the end.

20 October 2026. User authorized professional CEO imagery and head-turn animation, preserving likeness.

Identity: Afra - CEO Master Identity, b4b49ad4-c503-4227-9a83-1fb4b212b4c9 (completed, 80 references). Original CEO photographs remain unchanged in CEO Images/.

- Initial transparent concept generated with the built-in image tool from the three supplied photographs. Preserved as ceo-cutout.png; superseded in the active hero by the video-derived transparent WebP.
- Higgsfield still attempts: 3e6620a0-abfb-42b4-ab05-1f7918cf5dd6 and selected ef274b1d-5243-437d-8e5e-32709567a7b3. Requested Nano Banana Pro; completion metadata reports Nano Banana 2. Each cost preflight quoted 2 credits.
- Video: 386cc3d4-df54-48da-8640-af32d2eea847, completed Kling 3.0 Pro, five seconds, no audio. Preflight quoted 8.75 credits. Source public/media/ceo-head-turn.mp4.
- Exact prompts, identity token and model parameters: hero-generation.json.
- Extracted locally with FFmpeg at 24fps: 121 desktop and 121 mobile frames.
- Local U2NETP alpha segmentation removes only the backdrop; no face reshaping or RGB retouching in the frame-processing pipeline. Video generation itself is synthetic, so final likeness should still be reviewed by the user.
- Frame processing remained local. Automatic approval review rejected a proposed external archive upload; it was not performed. No archive was exported back to Higgsfield.

Current active media: public/media/ceo-prime-v1/{desktop,mobile}/frame-*.webp, poster.webp, social-poster.webp and source.mp4, selected through public/media/hero-manifest.json. The Kling files described above are preserved legacy media. See the current approved video section below.

## Local blink-removal experiment — 20 October 2026

No paid generation was submitted. A local 480px FFmpeg optical-flow experiment retained the initial turn through source frame 70, excluded blink ranges 19–23 and 40–50 (zero-based), and interpolated across the gaps at 24fps. Every output frame was inspected in an eye contact sheet. The longer gap introduced visible facial ghosting and eye distortion, so the candidate was rejected and has not replaced production media. The existing video still contains blinks and post-frontal movement. A controlled, blink-free replacement remains pending; disclose a current quoted cost before any further generation. Outfit changes are optional and would require new media.

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
