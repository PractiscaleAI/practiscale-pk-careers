# Founder film timing and edge audit, v064

The expanding thumbnail exposed the dark teal backing as container and artwork proportions diverged. This is removed: preview backing is pale neutral, full video letterboxing is black, and the underlying video layer is hidden until full-view handoff. Source artwork and film exports are unchanged.

The previous guard relied on smoothed progress and permitted playback during the poster fade; reverse scroll could leave playback active until smoothing caught up. Eligibility now checks both actual and presented progress, viewport fit and visibility. A ready first frame and completed poster fade precede the playback clock. Native reverse scroll cancels pending starts and pauses immediately. Delayed play/playing events are guarded too.

Scope: desktop, short desktop, tablet, phone portrait and short landscape, including display scale 1, 1.25 and 2. Existing founder tests also cover 1920x686, 390x600, reduced motion, no JavaScript and Save Data. Results are recorded in playback-gate.json, report.json and edges.json. Screenshots include the first few pixels of expansion, restored previews and fullscreen playback.

The build initially encountered a Windows output-directory permission/file-lock error while the old preview was active. Stopping only that identified preview and rebuilding resolved it.

This is Chrome viewport emulation and visual inspection, not certification on physical iOS/Android devices or Safari. Other page sections are outside this repair and retain their existing code.
