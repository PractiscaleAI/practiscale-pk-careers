# Founder media recovery, revision 0.69

The reported error was reproduced by aborting founder-video requests. Both local source files exist, return video/mp4 with correct HTTP 206 byte ranges, and play normally. Before this fix, restoring the network and clicking Watch his story left MEDIA_ERR_SRC_NOT_SUPPORTED (code 4), readyState 0 and a permanently paused player. The screenshot alone cannot establish which original request failed.

## Repair

- Select the responsive source before requesting metadata; use preload to start normal loading without a redundant load() that cancels the fresh request.
- Reload the same approved source at most twice after media failure, with 650ms and 1500ms delays. Cancel pending timers on disposal/source changes and avoid offscreen retry work.
- Explicit retry and restored connectivity can recover an exhausted player. Restore the media position and reapply the existing full-screen playback gate.
- Preview errors replace the watch label and hint instead of covering the controls. Expanded/static error panels provide a retry button and the actual desktop/portrait direct URL.
- Preserve source videos, thumbnails, animation timing and caption-free playback. Earlier sections and the hiring compass are unchanged.

## Evidence

- Production webpack build and TypeScript pass.
- recovery.json: 23/23 checks, with actual aborted requests. Each unavailable source produces one initial request and two retries. Covers desktop, phone, reduced-motion fallback, automatic recovery, manual retry, correct direct link, error clearing and pause-on-reverse.
- playback-gate.json: existing full-screen playback regression suite; see final report for results across desktop, short desktop, tablet, phone, landscape and delayed loading.
- Inspected actual preview-error, expanded-error and recovered-playback screenshots on desktop and phone.

Testing uses local Chrome and emulated viewport sizes; physical Safari/iOS and the originally reported browser's network history remain unverified.
