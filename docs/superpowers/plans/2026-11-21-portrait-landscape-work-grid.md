# Portrait + Landscape Work Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show portrait and landscape videos at their true shape in the Work grid and player modal, with orientation and image data computed server-side.

**Architecture:** A pure orientation module plus a project mapper move out of `pages/index.js` and run in `getStaticProps` (and, for draft mode only, inside the dynamically loaded `SanityPreviewData` chunk). The grid becomes a wrapping flex layout where each card's flex-grow equals its aspect ratio (set via a server-provided CSS variable), giving equal-height justified rows. The modal switches frame size by orientation.

**Tech Stack:** Next.js 16.3.5 (pages router, ISR), React 19, Sanity (`next-sanity`, `@sanity/image-url`), plain CSS in `styles/globals.css`, `node --test` for the pure module.

**Spec:** `docs/superpowers/specs/2026-11-21-portrait-landscape-work-grid-design.md`

## Global Constraints

- Portrait when thumbnail `height > width`; else fallback YouTube `/shorts/` URL means portrait; else landscape.
- Landscape ratio 1.6 (16:10 crop, unchanged); portrait ratio 0.5625 (9:16 crop, hotspot-aware).
- Orientation, ratio, image URLs, srcsets, embed data computed server-side; none computed in the main client bundle.
- No new Sanity field; no separate vertical section; no blurred-fill thumbnails; no preloading work.
- Existing look (grayscale hover, play icon, info row) unchanged.
- Mobile (<760px): landscape full width; portrait two per row.
- Modal: landscape 16:9 up to 1200px; portrait 9:16 sized by height, max about 85vh, centered.
- `AGENTS.md`: this Next.js has breaking changes; consult `node_modules/next/dist/docs/` for `getStaticProps`/bundling behavior before relying on memory.
- Commit identity is personal (`templar.ajay@gmail.com`); commit only when the user asks.

## Review Focus

1. Thumbnail has no `metadata.dimensions` (old record or `DEFAULT_PROJECTS`): falls back to Shorts URL, then landscape; never throws.
2. Square thumbnail (w == h): treated as landscape (not portrait) and still renders.
3. Thumbnail dimensions disagree with the URL (landscape still for a `/shorts/` link): thumbnail wins.
4. Last row holds a single card (landscape or portrait): it does not stretch to full width.
5. Filter leaves only portrait cards (or one card): grid still lays out; draft-mode data with stega-encoded strings still detects orientation and builds correct URLs.

---

### Task 1: Pure orientation module

**Files:**
- Create: `src/portfolio/orientation.mjs`
- Test: `src/portfolio/orientation.test.mjs`

**Interfaces:**
- Produces: `getOrientation(dimensions, videoUrl) -> "portrait" | "landscape"`, where `dimensions` is `{width, height} | null | undefined` and `videoUrl` is `string | null | undefined`; `RATIOS = {landscape: 1.6, portrait: 0.5625}`.

- [ ] **Step 1: Write failing tests** with `node:test` and `node:assert/strict`, named: `portrait when height > width`, `landscape when width > height`, `square is landscape`, `dimensions win over shorts url` (landscape dims + `/shorts/` URL → landscape), `shorts url is portrait when dimensions missing`, `youtube.com/shorts/ID and youtu.be paths: only /shorts/ counts`, `landscape when nothing is known` (`getOrientation(undefined, undefined)`), `malformed url does not throw`.
- [ ] **Step 2: Run** `node --test src/portfolio/` — Expected: FAIL (module not found).
- [ ] **Step 3: Implement `getOrientation` and `RATIOS`** in `orientation.mjs`. Parse the URL with `new URL` in try/catch; shorts means host is a YouTube host and first path segment is `shorts` (reuse the host check style from `src/video.js`; do not import it, keep this file dependency-free).
- [ ] **Step 4: Run** `node --test src/portfolio/` — Expected: all PASS.

### Task 2: Server-side project mapper and data flow

**Files:**
- Create: `src/portfolio/mapProject.js`
- Modify: `pages/index.js` (remove `sanityImage`, `sanityImageSrcSet`, `mapProject`, the `urlFor` import and the in-component mapping at lines ~88-110 and ~136-138; adjust `Home`, `PortfolioHome`, `getStaticProps`)
- Modify: `src/components/SanityPreviewData.js`

**Interfaces:**
- Consumes: `getOrientation`, `RATIOS` from Task 1; `getVideoEmbed` from `src/video.js`; `urlFor` from `src/sanity/image.js`; `stegaClean` from `next-sanity`.
- Produces: `mapProject(project) -> MappedProject` where `MappedProject` adds to the raw project: `orientation`, `ratio`, `image`, `imageSrcSet`, `imageWidth`, `imageHeight`, `imageAlt`, `embedUrl`, `provider`, `categoryLabel`, `category` (cleaned). Also `mapHomeData(cmsData) -> {...cmsData, projects: MappedProject[], site: {...site, featuredProject: MappedProject | null}}`. `PortfolioHome` receives data already mapped.

- [ ] **Step 1: Implement `mapProject`** by moving the existing logic and making crop and srcset widths depend on orientation: landscape widths `[320, 480, 640, 1000, 1400]` at ratio 1.6 (existing); portrait widths `[240, 360, 540, 720]` at ratio 0.5625. `imageWidth/imageHeight` are the default `image` size (landscape 1000x625, portrait 540x960). Read dimensions from `project.thumbnail.asset.metadata.dimensions` and the URL via `stegaClean(project.videoUrl)`.
- [ ] **Step 2: Implement `mapHomeData`**, mapping `projects` and `site.featuredProject`.
- [ ] **Step 3: Apply it on the server.** In `getStaticProps`, return `cmsData: mapHomeData(cmsData)` for the published path. The `DEFAULT_PROJECTS` fallback (when `cmsData` is null) is mapped in `getStaticProps` as well, so `PortfolioHome` never calls `mapProject` itself; move the `DEFAULT_PROJECTS` mapping to the server by passing `fallbackProjects` mapped there (or equivalent) — the client must not import `mapProject.js` in the published path. Verify with Step 5.
- [ ] **Step 4: Draft mode.** `SanityPreviewData` imports `mapHomeData` and passes `mapHomeData(data)` to `children`, so the mapper is only in the dynamic preview chunk. Guard `data` being null/undefined during the first draft render.
- [ ] **Step 5: Verify bundle and behavior.** Run `npm install` (no `node_modules` yet), then `npm run build`. Expected: build succeeds; grep `.next/static` client chunks for `@sanity/image-url` code (e.g. search for `imageUrlBuilder` / the `urlFor` builder) — it should appear only in the preview chunk, not in the main page chunk. Run `npm run dev` and confirm the page still renders all projects with correct images.

### Task 3: Justified-row grid

**Files:**
- Modify: `pages/index.js` (project card markup, lines ~268-290)
- Modify: `styles/globals.css` (`.project-grid`, `.project-card`, `.project-image`, mobile media query near line 222)

**Interfaces:**
- Consumes: `MappedProject.ratio`, `orientation`, `imageWidth`, `imageHeight`, `image`, `imageSrcSet` from Task 2.

- [ ] **Step 1: Card markup.** Give each `<article>` a `data-orientation` attribute and `style={{"--ratio": project.ratio}}`; use `project.imageWidth/imageHeight` on the `<img>`; `sizes` per orientation (landscape keeps `(max-width: 760px) calc(100vw - 40px), 46vw`; portrait about `(max-width: 760px) 46vw, 22vw`).
- [ ] **Step 2: CSS.** `.project-grid` becomes `display: flex; flex-wrap: wrap` with the existing gaps; `.project-card` uses `flex: var(--ratio) 1 calc(var(--ratio) * var(--row-height))` with `--row-height` a clamp of about 280-420px, `min-width: 0`; `.project-image` uses `aspect-ratio: var(--ratio)` instead of the fixed 16/10. Cap the last row: a trailing `.project-grid::after { content: ""; flex: 100 1 0 }` filler absorbs leftover space (the technique's well-known limitation: it can also shrink the last full row slightly; check visually and adjust, or use `max-width` per card instead). Under 760px: landscape `flex-basis: 100%`; portrait `flex-basis: calc(50% - gap/2)`.
- [ ] **Step 3: Verify visually** with the browser tools (chrome-devtools MCP) at 1440, 900 and 390px wide using the real Sanity data: rows are equal height, no cropping of portrait thumbnails, no layout shift on image load, last row not stretched, and each category filter (including one with only portrait items) re-flows correctly. Take screenshots.

### Task 4: Orientation-aware player modal

**Files:**
- Modify: `pages/index.js` (modal block, lines ~325-339)
- Modify: `styles/globals.css` (`.modal-content`, `.video-frame`)

**Interfaces:**
- Consumes: `activeProject.orientation`, `activeProject.embedUrl` from Task 2.

- [ ] **Step 1: Markup.** Add `data-orientation={activeProject.orientation}` to `.modal-content`.
- [ ] **Step 2: CSS.** Landscape unchanged. Portrait: `.modal-content[data-orientation="portrait"]` is centered with `width: auto`; `.video-frame` uses `aspect-ratio: 9/16; height: min(85vh, 900px)` and fits within the viewport on short screens (include the top bar height in the budget, e.g. `calc(100svh - topbar - padding)`).
- [ ] **Step 3: Verify visually**: open one portrait and one landscape project at desktop and mobile sizes; the portrait player fills its frame with no black bars, close button and backdrop click still work, nothing scrolls on a 700px-tall viewport.

### Task 5: Final check

- [ ] **Step 1:** `node --test src/portfolio/` passes; `npm run build` passes with no new warnings.
- [ ] **Step 2:** In draft mode (`/api/enable-draft` via the Studio preview or the project's usual flow), confirm the grid and modal behave the same as published mode.
- [ ] **Step 3:** Remove nothing else; leave changes uncommitted and report results and screenshots to the user.
