# Portrait + landscape videos in the Work section

Status: awaiting approval. Size: small change. Video preloading is a separate, later spec.

## Intent
Vertical videos currently render as landscape: the grid card is fixed at 16:10, the thumbnail is cropped server-side to 1000x625 by Sanity, and the modal player is fixed at 16:9. Show each video at its true shape in both the grid and the player, with no cropping or letterboxing of the thumbnail, and no extra client-side work.

## Goals
- Portrait and landscape cards sit together in the grid at their real aspect ratios.
- The player modal matches the video's orientation.
- Orientation, image URLs, srcsets and embed data are computed on the server at build/ISR time, not in the browser.
- No layout shift: each card knows its ratio before the image loads.
- No new Sanity field required; editors just upload the right thumbnail.

## Non-goals / anti-goals
- No separate "vertical" section or format tabs; the category filters stay as they are.
- No blurred-fill letterboxing of thumbnails.
- No preloading work in this change.
- Not a rewrite of the page; existing look (grayscale hover, play icon, info row) is unchanged.

## Approaches considered
A. Justified rows (chosen): equal row height, card width follows its ratio, no crop.
B. Separate landscape/vertical sections: predictable but splits the portfolio by format.
C. Uniform cards with blurred fill: keeps the grid, but shrinks portrait thumbnails.

## Design
**Orientation detection (server-side).** The query already returns `thumbnail.asset.metadata.dimensions`. A project is portrait when thumbnail height > width. Fallbacks, in order: a YouTube `/shorts/` URL means portrait; otherwise landscape (this also covers the local `DEFAULT_PROJECTS`).

**Server-side mapping.** Move `mapProject`, `sanityImage` and `sanityImageSrcSet` out of `pages/index.js` into a module imported by `getStaticProps` (so `@sanity/image-url` leaves the main client bundle). `getStaticProps` returns projects already mapped, including: `orientation`, `ratio` (landscape 1.6, portrait 0.5625), `image`, `imageSrcSet`, `imageWidth/imageHeight`, `embedUrl`. Landscape thumbnails keep the current 16:10 crop; portrait ones are cropped (hotspot-aware) to 9:16. Draft mode is the exception: live preview data arrives on the client, so the same mapper is loaded in the already-dynamic `SanityPreviewData` chunk and applied there.

**Grid (CSS, no JS).** `.project-grid` becomes a wrapping flex container. Each card gets its ratio from the server as an inline CSS variable and uses `flex: <ratio> 1 <ratio * rowHeight>` plus `aspect-ratio` on the image, so cards in a row get equal height. The last row is capped (filler element or max-width) so a lone card doesn't stretch. Category filtering keeps working because the browser re-flows. Mobile (<760px): landscape cards go full width; portrait cards pair two per row.

**Player modal.** The modal gets an `orientation` class. Landscape: unchanged 16:9, up to 1200px wide. Portrait: 9:16 frame sized by height (max about 85vh), centered, with the top bar above it.

**Sizes/srcset.** `sizes` and widths are chosen per orientation so portrait cards don't download landscape-width images.

## Left to the builder
Exact row height and gap values, last-row cap technique, srcset width lists, how to share the mapper with the preview chunk, and visual verification at desktop/tablet/mobile with at least one portrait and one landscape project (a test portrait project may need to be added in Sanity or as local fallback data).
