# Video Warm-up on Intent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make clicking a work card start playback almost instantly by loading that card's YouTube/Vimeo player when the visitor shows intent.

**Architecture:** The server adds a non-autoplay, API-enabled `warmEmbedUrl` to each project. A pure module holds the testable logic (connection gating, player commands, player-message parsing). A `useVideoWarmup` hook decides which single project is warm (hover/focus on desktop, centre-dwell on touch). A new `VideoModal` keeps the warm iframe hidden inside the modal shell; a click reveals it and sends "play" synchronously, falling back to today's cold iframe whenever the warm player isn't ready.

**Tech Stack:** Next.js 16.3.5 pages router, React 19, plain CSS in `styles/globals.css`, `node --test` for pure modules, raw `postMessage` (no new dependencies).

**Spec:** `docs/superpowers/specs/2026-11-21-video-warmup-design.md`

## Global Constraints

- At most one warm player at a time; no player loads on page load (only `preconnect` hints).
- No new npm dependencies.
- Skip warming when `navigator.connection.saveData` is true or `effectiveType` is `2g` or `slow-2g`.
- Desktop trigger: pointer rests about 150ms on a card, or keyboard focus; cancel if the pointer leaves first. Touch trigger: card near viewport centre for about 1s.
- "Ready" means the provider's player reported ready over postMessage, not iframe `load`.
- Play command is sent synchronously inside the click handler. If not ready, wrong project, or unsupported: today's cold iframe with `embedUrl` (`autoplay=1`).
- Warm shell is visually hidden but not `display:none`; `aria-hidden`/inert; no sound, no focus steal, no body scroll lock while only warm.
- Closing pauses and unmounts the player.
- Preconnect hosts: `https://www.youtube-nocookie.com`, `https://player.vimeo.com`.
- Work on a new branch `video-warmup` off `portrait-landscape-grid`. Do not commit until the user asks (identity: `templar.ajay@gmail.com`).
- `AGENTS.md`: Next.js here has breaking changes; consult `node_modules/next/dist/docs/` before relying on memory.

## Review Focus

1. Click a card before its warm player is ready: cold fallback plays; nothing double-plays or throws.
2. Hover card A (warm), then click card B: B uses the cold path; A's warm player is not shown or left playing.
3. Sweep the pointer across many cards quickly: never more than one warm iframe in the DOM; pointer leaving before 150ms loads nothing.
4. Close then reopen the same project: it plays again from a fresh player, no audio from the old one.
5. While only warm (hidden), Escape/backdrop/focus/scroll behave as if no modal exists; `modal-open` is only set when a project is active.
6. postMessage from a different origin, or malformed data, is ignored and never marks a player ready.
7. Draft/preview mode and projects lacking a `warmEmbedUrl` (no video URL) still render and open without errors.

---

### Task 1: `warmEmbedUrl` from the server

**Files:**
- Modify: `src/video.js` (`getVideoEmbed`)
- Test: `src/video.test.mjs`

**Interfaces:**
- Produces: `getVideoEmbed(videoUrl, fallbackVimeoId)` additionally returns `warmEmbedUrl: string | null`. `mapProject` already spreads this result, so projects carry it with no mapper change.

- [ ] **Step 1: Write failing tests** (`node:test`) named: `youtube warm url has enablejsapi, playsinline, no autoplay`, `youtube shorts url gets a warm url`, `vimeo warm url has api enabled, playsinline, no autoplay`, `vimeo fallback id gets a warm url`, `no video yields null warmEmbedUrl`, `embedUrl is unchanged and keeps autoplay=1`. Assertions parse the URL and check params (`enablejsapi=1`, `playsinline=1`, `autoplay` absent for warm; `autoplay=1` present for `embedUrl`; Vimeo warm has `api=1` and a `player_id` value).
- [ ] **Step 2: Run** `node --test src/video.test.mjs` — Expected: FAIL (`warmEmbedUrl` undefined). If Node cannot import the `.js` ESM file, note the error and rename to `.mjs`-compatible handling (a ruling, since it touches imports in `mapProject.js`).
- [ ] **Step 3: Implement** the extra `warmEmbedUrl` in all three success branches of `getVideoEmbed` and `null` in the empty branch. YouTube: same embed URL with `enablejsapi=1&playsinline=1&rel=0` (no autoplay). Vimeo: same URL with `api=1&player_id=warm&playsinline=1` plus the existing title/byline/portrait flags (no autoplay).
- [ ] **Step 4: Run** `node --test src/` — Expected: all PASS (orientation tests still pass).

### Task 2: Pure warm-up logic

**Files:**
- Create: `src/portfolio/warmup.mjs`
- Test: `src/portfolio/warmup.test.mjs`

**Interfaces:**
- Produces:
  - `canWarm(connection?: {saveData?: boolean, effectiveType?: string}) -> boolean` (false for saveData or `2g`/`slow-2g`; true when `connection` is undefined).
  - `playCommand(provider: "YouTube" | "Vimeo") -> string` — the JSON string to `postMessage` to start playback: YouTube `{"event":"command","func":"playVideo","args":[]}`, Vimeo `{"method":"play"}`.
  - `pauseCommand(provider) -> string` — same shape with `pauseVideo` / `pause`.
  - `listenCommand(provider) -> string` — the handshake sent after iframe `load`: YouTube `{"event":"listening","id":"warm"}`, Vimeo `{"method":"addEventListener","value":"ready"}`.
  - `isReadyMessage(provider, origin: string, data: unknown) -> boolean` — true only when `origin` is that provider's player origin (`https://www.youtube-nocookie.com` / `https://player.vimeo.com`) and the parsed payload is the provider's ready event (YouTube `onReady`, or an `infoDelivery`/`initialDelivery` event; Vimeo `{event:"ready"}`). `data` may be a JSON string or an object; malformed input returns false.
  - `PLAYER_HOSTS: {YouTube: string, Vimeo: string}` (the two origins above).

- [ ] **Step 1: Write failing tests**, named: `canWarm blocks saveData`, `canWarm blocks 2g and slow-2g`, `canWarm allows 4g and unknown connection`, `commands are valid JSON with the provider's fields`, `isReadyMessage accepts the provider's ready event from its own origin`, `isReadyMessage rejects wrong origin`, `isReadyMessage rejects malformed or non-ready data` (random string, `null`, `{}`, ready event from the other provider's origin).
- [ ] **Step 2: Run** `node --test src/portfolio/` — Expected: FAIL (module not found).
- [ ] **Step 3: Implement** all exports in `warmup.mjs`, dependency-free.
- [ ] **Step 4: Run** `node --test src/` — Expected: all PASS.

### Task 3: Warm hook, `VideoModal`, and page wiring

**Files:**
- Create: `src/portfolio/useVideoWarmup.js`
- Create: `src/components/VideoModal.js`
- Modify: `pages/index.js` (replace the inline modal block at ~296-310 and the `activeProject` effect at ~122-134; add card handlers/refs; add preconnect links in `<Head>` ~137-156)

**Interfaces:**
- Consumes: Task 1 `project.warmEmbedUrl`, Task 2 helpers.
- Produces:
  - `useVideoWarmup(projects) -> {warmProject, cardProps(project) -> {onPointerEnter, onPointerLeave, onFocus, onBlur, ref}}` — the single warm project (or null) and the per-card props that implement the triggers (desktop hover/focus delay; touch dwell via one IntersectionObserver for `(pointer: coarse)`), gated by `canWarm(navigator.connection)`. Cleans up timers/observers on unmount.
  - `<VideoModal activeProject warmProject onClose />` — renders nothing when neither is set; otherwise the shell with one iframe per the rules below; imperative `play()` exposed via ref (`forwardRef`) as `VideoModalHandle = {playWarm(project) -> boolean}`: returns `true` if the warm player for `project` was ready and the play command was sent; `false` means the caller must use the cold path.
  - In `index.js`: card button `onClick` calls `modalRef.current.playWarm(project)` synchronously first, then `setActiveProject(project)`.

- [ ] **Step 1: Extract `VideoModal`** with identical markup/behaviour for the active (cold) case: same classes (`video-modal`, `modal-backdrop`, `modal-content` with `data-orientation`, `modal-topbar`, `video-frame`), same iframe `allow`/`title`, Escape and backdrop/Close handlers, `modal-open` body class only when a project is active. Verify nothing changed: `npm run build` passes and the grid + modal render as before (use the browser tools on `npm run dev`/`npm start`).
- [ ] **Step 2: Warm iframe in the shell.** When `warmProject` is set and not active, render the shell hidden (class `is-warm-only`, `aria-hidden`, `inert`) with an iframe `src={warmProject.warmEmbedUrl}`; on its `load` send `listenCommand`; a `window` `message` listener accepts only `isReadyMessage` from the iframe's `contentWindow` (`event.source` check plus origin) and records ready for that project. When the active project equals the warm project and it was ready, reveal (drop `is-warm-only`) and keep the same iframe (same React key so it is not remounted); `playWarm` sends `playCommand`. Otherwise render the cold iframe with `embedUrl`. On close, send `pauseCommand` then unmount and clear the warm project.
- [ ] **Step 3: Implement `useVideoWarmup`** as specified; replacing the warm project must unmount the previous iframe (one warm at a time). Apply `cardProps(project)` to each grid card button in `index.js`; skip projects with no `warmEmbedUrl`.
- [ ] **Step 4: Preconnect.** Add the two `<link rel="preconnect" href=... />` tags to `<Head>`.
- [ ] **Step 5: Verify behavior with the browser tools** (`npm run build && npm start`, port 3123, restart the server after each rebuild with `pkill -f next-server`): (a) hover a card ~300ms: exactly one hidden player iframe appears and its requests show in the network list before any click; (b) sweep across many cards fast: at most one iframe in the DOM, none if each hover is under 150ms; (c) hover then click: modal opens with the same iframe element (no reload) and the player starts; (d) click without hovering: cold iframe, plays as before; (e) hover A, click B: B cold, A gone; (f) close then reopen the same card: fresh player, no residual audio; (g) while only warm, Escape and scroll behave normally and `document.body` has no `modal-open`; (h) emulate Save-Data/slow-2g via DevTools network conditions: no warm iframe appears. Repeat (a)-(c) for one YouTube and one Vimeo project (portrait and landscape), and for a draft-mode load if reachable.

### Task 4: Hidden-shell CSS and final checks

**Files:**
- Modify: `styles/globals.css` (near `.video-modal`)

- [ ] **Step 1: Implement `.video-modal.is-warm-only`**: `visibility: hidden; pointer-events: none;` keeping layout size (so portrait/landscape frame sizing is already right at reveal) and no backdrop blur/dimming; revealing removes the class with no layout jump. Confirm in the browser that the reveal doesn't flash or resize.
- [ ] **Step 2: Measure** cold vs warm click-to-first-frame in Chrome DevTools (Performance or Network timing for the player document and first video bytes) for one YouTube and one Vimeo project; report both numbers. If the headless browser blocks embeds, say so and report what can be shown instead (requests issued before click, same iframe element reused).
- [ ] **Step 3: Full checks:** `node --test src/` passes; `npm run build` passes with no new warnings; confirm Lighthouse-relevant load behaviour: loading the page and not interacting issues no YouTube/Vimeo player requests (network list), only the preconnect.
- [ ] **Step 4:** Leave changes uncommitted on branch `video-warmup`, and report results, the measurements, and anything that could not be verified (iOS Safari cannot be tested here).
