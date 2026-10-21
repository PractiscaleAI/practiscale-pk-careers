# PractiScale website: Product requirements

Version 0.40 | 22 October 2026 | Status: Shared homepage typography and spacing refined, with a clearer live cortical brain.

## Authority and current scope

Current user instructions take precedence. Build three homepage sections in order: the approved CEO hero, the three-card career-problem section and one continuous training and hiring section. Navigation belongs to the hero. Preserve the original supplied preloader. The career section's three specified destination URLs resolve to focused program and hiring pages using supplied content and the existing enquiry flow. Other sections, pages, footer, backend and deployment remain deferred. Edition 1.4 supplies the brand identity; the website PDF supplies content only. Use the original logos and local Sora, Manrope and JetBrains Mono fonts.

This document describes the current implementation requirements. Earlier revision history is archived in docs/history/ and does not override this version.

## Typography and spacing

Use one responsive scale across the three homepage sections. Preserve the hero's approved two-line headline. The problem and career section headings share a 28-44px scale, 1.18 line height and -0.045em tracking. Card titles share a 24-28px scale and 1.2 line height. Main descriptive copy uses Manrope 16px with 1.6 line height; keep paragraphs readable and avoid a single final orphaned word.

Section eyebrows use JetBrains Mono 11px with consistent tracking. Leave 12px between the eyebrow and heading, then 24px before the card stage. Use the same responsive outer gutter for the two light sections. Primary actions use 15px labels, a 52px minimum height and 12px corners. Compact career buttons may reduce horizontal inset to keep labels on one line. Preserve natural flow when enlarged content cannot fit a pinned scene.

## Hero

Retain the Deep Teal environment, approved localized teal/blue lighting and CEO frame sequence. Keep the existing headline, supporting copy and genuine enquiry destinations. The primary CTA remains Explore training. Preserve exactly 100+ / Team members and 46,000 / Candidates in our hiring portal.

Keep the Your next chapter / Starts with a skill link. Its text block and 44px outlined arrow circle form two columns with a 16px gap; the 18px diagonal arrow is centered against the complete eyebrow/label group. Keep real text bounds at least 15px clear of the circle, and the complete hit target inside the link. On phones, the circle sits at the right reading gutter.

Do not restore the decorative GROWTH word, the header divider, the standalone desktop Built for growth caption, Explore careers, Scroll to move forward, founder-name caption or visible skip-intro control. The original logo tagline remains part of supplied artwork.

Normal desktop windows show supporting hero content before scrolling. Short screens and enlarged text may expand naturally. Preserve full head clearance. Desktop/tablet trust cards must stay at least 16px clear of the visible portrait silhouette, including shoulders, throughout all 120 frames. Phone statistics sit below the portrait and never cover the face or reading/actions. Phone text uses the available reading column without orphaned final words.

## Navigation: latest clarification

Render the logo and navigation inside the hero stage at their original visual coordinates. On desktop they stay with the pinned hero during its character animation, then leave naturally with that section. On phones they travel with the hero content. Once the visitor moves upward beyond the original header position, bring one floating navigation header into view. On continued downward scrolling, retain its document position and let it scroll away naturally. Return it to the hero when its original position is reached.

Do not automatically hide, fade or slide the navigation out. Upward reveal is allowed; downward movement releases it into document flow. Do not keep it fixed while scrolling down the entire page. Keep desktop logo/navigation as separate visual pieces, with a transparent space between them. Their Deep Teal hero provides logo contrast.

Keep the mobile rounded Fog card, original primary logo and dark teal two-line menu button. Use a 240px wordmark and 44px menu target; below 348px use the original 32px mark with protected clear space. Menus support keyboard, Escape, outside click and link-close behavior. Skip to content must bypass navigation and focus the reading content.

## Problem cards and scroll sequence

Eyebrow: The problem

Heading: Why careers in Pakistan get stuck.

Place exactly one Explore training CTA below the cards. Retain the training enquiry URL: https://wa.me/923334000600?text=Hi%20PractiScale%2C%20please%20share%20the%20current%20training%20program%20details.

Use exactly these three stories:

1. A degree without a marketable skill
   You have the qualification. Employers also need practical skills and experience you can bring to the job.
2. More effort, little financial progress
   You take on more responsibility and deliver better results, but your income does not reflect the value you create.
3. Income with no real stability
   Freelancing brings opportunity. Inconsistent projects and demand make it hard to rely on a steady income.

No fourth/transition card, added explanation or extra CTA. Do not use em dash punctuation in website copy or related responses.

Follow the user's 21 October desktop and mobile screen recordings. At desktop widths of 1024px and above, a mountain landscape settles into the section, separates into three panels, flips horizontally in 3D and opens into three readable fanned cards. The user rejected the large opening portrait and subsequent ripple texture. Their supplied red landscape defines the artwork direction, but their latest correction requires PractiScale's Deep Teal, surface teal and restrained mint colours. The red original is archived and inactive. Retain the landscape's broad forms and grain, the three accepted front photos, exact story copy, Fog surrounding canvas, fonts and gradient CTA. Scroll position drives and reverses the sequence; the last part holds the readable fan. Do not introduce reference-site wording or another palette.

Keep the artwork continuous across joined panels, with square internal joins and rounded outer corners. Round each panel only as it separates. Preserve aspect ratio with a shared cover crop. The built-in image-editing tool supplies the brand-colour variant; its prompt, source checksum and edited master are recorded in problem-art-selection.json. Inspiration research is recorded in problem-design-reference-notes.md.

Use no previous/next arrows, pagination dots, carousel roles, horizontal swipe navigation or custom arrow-key shortcuts. This latest user request supersedes the earlier request to retain mobile arrows. Below 1024px, follow the supplied mobile recording: cards rise vertically into a layered stack, with slight tilt only during transitions and upright reading holds. Incoming cards cover their predecessors, and reverse scrolling unwinds the stack. Reserve space for upward-revealed navigation without altering its existing behavior. On shorter phones pin only the card stage; the heading and bottom CTA remain in document flow. Use a normal list if the card alone cannot fit or enlarged text needs more space. Native touch scrolling, PageDown/PageUp and normal browser keys advance the sequence without interception. Expose all three stories to assistive technology in document order. Reduced motion shows the completed desktop fan or a phone list without scroll-driven animation. No JavaScript also shows every story as a vertical list.

Fit the desktop reading scene, including heading, cards and bottom CTA, within normal viewport height, including 1536x696 CSS pixels. Shorten the landscape opening so the fronts are fully revealed by 48% of desktop travel, leaving the final 52% for reading. Keep outer cards at 2.5 degrees and full scale in that hold. The extra document height is intentional scroll travel for the animation. Keep the section readable at 320-443px widths; normal 375x812 and 430x932 views should fit. At 320x568 and 443x646 keep the card stage within the viewport and release it naturally before the CTA. If enlarged desktop copy cannot fit, show the readable fan in natural flow and disable its pin. Keep faces complete and copy clear.

Retain the existing brand palette: Deep Teal for strong surfaces, Fog for reading space, muted teal for depth, mint for small highlights and the original teal-to-blue gradient for primary actions. Improve consistency through restrained colour use. Balance the three accepted photos with subtle CSS exposure/contrast/saturation and a short photo-to-reading fade, preserving the source files and natural skin tones.

## Current photography selection

The latest user accepts the two male photos currently displayed. Keep graduate-v1.webp and freelancer-v1.webp. Replace only the woman with professional-v2.webp, showing a more natural working pose, skin texture and ordinary office environment. The newly generated male v2 alternatives are not active.

These are generated editorial illustrations, not actual staff portraits or testimonials. Active selection is recorded in career-image-selection.json. Prompts/provenance are in career-image-prompts.json and career-image-prompts-v2.json. Assets are local responsive WebPs. No Higgsfield credits were used for these images.

## Continuous training and hiring section

Place one semantic section after the problem cards. Its eyebrow is Two ways in; H2 is Two ways to start your career at PractiScale. Keep the heading in normal document flow above the animated stage. The latest user removes the introductory sentence.

The latest user correction replaces the original four-chapter proposal with exactly two homepage cards. Remove the visible Start with training and I have experience buttons. Keyboard-only jump links become visible on focus so both cards remain reachable. Do not add program chapters, earnings, pagination dots or carousel arrows to this section.

1. Training Programs. Path 1 of 2 · Start with training. Label: No experience needed. Body: Start with training. Learn the skill, pass the role assessment and move into a paid role on our team or our clients' accounts. CTA View Training Programs goes to /training-programs/appointment-setter.
2. Jobs. Path 2 of 2 · Bring your experience. Label: For experienced professionals. Body: Bring your experience in sales, design, video, development, AI, recruitment or operations. Apply directly for an open role. CTA See Open Jobs goes to /jobs.

Focused program destinations keep the previously supplied program details separately, with after-hiring qualifiers adjacent to earning figures. Do not invent duration, fees, certifications, placement rates or guaranteed hiring. Existing career-area listings invite visitors to confirm current openings with hiring; they are not a live vacancy feed.

At suitable desktop widths, use one viewport-height stage below the real returning-header footprint. Follow the first exchange in the user's recording: one shared visual panel slides from right to left across the outgoing text, the next text panel rises behind it on the right, and the next visual state reveals downward from the top of the moving footprint. The text groups have a restrained vertical stagger. Begin Training text left and visual right; finish Jobs visual left and text right. Panels retain 24px rounded clipping. Do not uniformly translate two complete text/visual pairs.

Preserve the same dense live triangular-fragment sculpture through dispersal and reassembly. The latest user rejects the gateway, S curve and procedural brain approximation. Training uses the actual ICBM152 cortical surface in a recognizable near-frontal bilateral view, with visible folds and depth occlusion. Jobs illustrates people joining one team through a clear hub and five spaced satellite nodes. Fine connections terminate at the surfaces instead of crossing through the centre or unrelated nodes. Give each node a consistent teal, blue, mint or ivory colour, with depth occlusion and restrained particle sizes. Remove all unrelated floating triangles and decorative visual captions. Frame complete main surfaces at every aspect ratio. Keep the reference's scroll-driven card exchange, including phones. When a short phone can fit the copy but not artwork, retain horizontally exchanging text cards. These are PractiScale interpretations, not recovered reference meshes or claims about the source implementation.

Reuse Deep Teal, Fog, mint, local Sora/Manrope/JetBrains Mono, established buttons and existing GSAP/Three.js. No replacement palette, bloom, stock imagery, prerecorded visual or second scroll engine. Small pointer parallax applies only on fine-pointer devices. Keep native scrolling, continuous reverse motion and useful reading holds. Finish by releasing the stage naturally, without a second exit effect.

Refine the brain through smaller, finer outlined particles, controlled teal/blue/mint/ivory regions and directional lighting with a gentle opposing fill. Use the existing real cortical surface for a quiet shaded foundation, so folds and the central fissure remain readable. Preserve its geometry, near-frontal angle, camera framing and the Jobs network. The static Training fallback must match the live treatment and contain only the sculpture, without captured navigation.

The latest user requires the mobile experience to remain scroll-driven. On suitable phones and tablets, use a compact pinned composition with live particles above a readable text panel. Native vertical touch scrolling drives a horizontal Training-to-Jobs exchange below, synchronized with the same particle morph and reversible reading holds. Use a reduced particle budget and capped pixel ratio. Keep both panels, complete copy and CTA inside the available viewport.

Reduced motion, unavailable WebGL, insufficient height, enlarged text that cannot fit and no JavaScript show both complete cards in normal document order with static previews and both route links. No long empty fallback scroll rail. Decorative canvas has no semantic content; inactive or unreadable overlapping cards cannot accept focus. Explicit keyboard-only jump links may focus the selected heading; scrolling alone never moves focus.

The supplied recordings, consecutive-frame observations and fidelity choices are documented in career-section-motion-review.md. Preserve the existing hero, accepted blink and problem card behavior.

## Approved CEO media and budget

Preserve Wan 3.0 Prime job 5a9cf3ed-7741-427b-a175-55f4c55eb210: charcoal suit, black open-collar shirt, teal rim light, one turn toward the visitor and a final-pose hold. Preserve all 120 native frames in order and the natural blink explicitly accepted by the user. Do not synthesize eyes, remove the blink or spend further generation credits without authorization.

## Original preloader

Use the supplied original HTML animation as-is: broad translucent ring, dotted boundaries, bottom-up logo fill, white wordmark and upper-wing zoom. Original colors/gradients are an explicit user exception to website tokens. Default timing is 3s fill, 450ms hold, 260ms opening and 1.6s zoom. Progress describes the intro animation, not network readiness.

Hide original demo/preview controls. Reveal the actual page and replay on every refresh. Preserve keyboard focus containment, Escape dismissal, scroll locking until completion, original reduced-motion behavior, no-JavaScript visibility and bounded failure recovery. Do not approximate or redesign the original artwork.

## QC and maintenance

Independently inspect actual desktop, tablet and phone renders, hero start/turn/end and menu states. Verify all three sections, hero-bound navigation, card reading-scene fit, exact copy/CTA/figures, contrast, clipping, enlarged text, native scroll behavior, fallbacks and original preloader. Automated results support visual QC; they do not certify photographic realism or facial likeness. Follow AGENTS.md and COMPOSITION-QC.md. Update this PRD and the TRD when scope changes.
