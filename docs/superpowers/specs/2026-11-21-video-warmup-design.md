# Warm video players on intent (YouTube + Vimeo)

Status: awaiting approval. Size: small-to-medium feature. Builds on `2026-11-21-portrait-landscape-work-grid-design.md` (orientation-aware modal, server-side mapping).

## Intent
Clicking a work card should start playback with no visible wait. Today the click creates a cold iframe (`autoplay=1`), so the browser loads the player and then the video after the click. Instead, load the player when the visitor shows interest in a card, so the click only reveals it and presses play. Applies to YouTube and Vimeo (15 and 16 of the current 31 projects).

## Goals
- On desktop, hovering or focusing a card for a short time warms that card's player so a following click starts almost immediately.
- On touch, a card dwelling near the centre of the screen warms its player.
- Playback never gets worse than today: if the warm player isn't ready or anything fails, fall back to the current cold `autoplay=1` iframe.
- Bounded cost: at most one warm player at any time; no player loads on page load.
- No new npm dependencies.

## Non-goals / anti-goals
- No preloading of every card, and no idle-time preloading of players (rejected: it costs every visitor about 1MB+ per provider on load).
- No shared/swappable "generic" player (rejected approach C).
- No change to the grid, thumbnails, or modal look.
- Must not degrade the page's load speed or Lighthouse score; must not break the first-tap-on-a-phone case (it stays a normal cold start).
- Warming must never play audio or move focus, and must not be exposed to screen readers while hidden.

## Approaches considered
A. Connection warming only: cheap but not instant. Included as part of B.
B. Warm on intent (chosen).
C. Shared pre-warmed players: heavier on every visit, more iOS edge cases, more code.
D. Preload every card: rejected for load cost.

## Design
**Server-side data.** `mapProject` also emits `warmEmbedUrl` next to `embedUrl`: same player URL with autoplay off, the provider's player API enabled and `playsinline` on (YouTube: `enablejsapi=1`; Vimeo: API enabled). Computed in `src/video.js` so the browser does no URL building.

**Preconnect.** `<link rel="preconnect">` for the embed hosts (`www.youtube-nocookie.com`, `player.vimeo.com`) in the page head.

**Intent triggers** (a small hook, e.g. `useVideoWarmup`, in `src/portfolio/`):
- Desktop (hover-capable pointer): pointer rests on a card about 150ms, or the card's button receives keyboard focus. Cancel if the pointer leaves before the delay.
- Touch (coarse pointer): an IntersectionObserver marks a card warm-worthy when it has been near the viewport centre for about 1s.
- Skip all warming when `navigator.connection.saveData` is true or `effectiveType` is `2g`/`slow-2g`.
- Only one warm project at a time; a new trigger replaces the previous warm player.

**Warm player lives in the modal shell.** The modal shell is mounted whenever there is a warm or active project and is visually hidden (not `display:none`, so the iframe actually loads; marked `aria-hidden` and inert) while only warm. Because the iframe is never re-parented, revealing it doesn't reload it. The shell already sizes itself by orientation, so the warm player gets the right frame size.

**Click behaviour.**
- Warm player for this project is ready: reveal the modal and send the provider's "play" command synchronously inside the click handler (so the user gesture still counts). "Ready" means the provider's player has reported ready over postMessage, not just that the iframe's `load` fired.
- Not ready, not the same project, or warming not supported: use the existing cold iframe with `embedUrl` (`autoplay=1`).
- Raw postMessage protocols, no libraries: YouTube `{event:"command", func:"playVideo"}` after the listening handshake; Vimeo `{method:"play"}`.

**Muted prebuffer (added during build, after measuring).** Loading the player alone did not help: in testing, a warm click still took about 2.1s to start playing versus about 1.95s cold, because the wait is the video stream starting, not the player. So once the hidden player reports ready, it plays muted until the first "playing" event, then pauses and rewinds to 0. The click then un-mutes and plays: measured click-to-playing about 12ms (YouTube). Cost: the first few seconds of video are downloaded for the one card the visitor dwelled on (bounded, one at a time, skipped on Save-Data/2g). Still silent: it is muted/volume 0 and hidden. YouTube uses `mute`/`playVideo`/`pauseVideo`/`seekTo`/`unMute`; Vimeo uses `setVolume`/`play`/`pause`/`setCurrentTime`.

**Close.** Pause and unmount the player (no audio left running, no memory held). Hover/dwell can warm it again.

**Known risk to verify, not assume.** iOS Safari (and possibly Firefox/Brave) may block play commands sent via postMessage. In that case the reveal shows the player with its native controls and the visitor taps play once, which matches today's behaviour on those browsers.

## Left to the builder
Exact delays and thresholds, the YouTube ready/handshake details and Vimeo ready event (verify against real embeds), file split (e.g. extracting the modal into `src/components/VideoModal.js`), hidden-shell CSS, how to measure the improvement (network panel shows the player requests before the click; compare click-to-first-frame cold vs warm in Chrome DevTools), and checking that the preview/draft mode still works. Work on a new branch off `portrait-landscape-grid`.
