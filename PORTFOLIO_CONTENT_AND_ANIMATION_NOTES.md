# Devender Saroha portfolio: preserved template UI and content gaps

This note records what was preserved from the Aali template, what is live now,
and what should be restored when verified portfolio content becomes available.

## Preserved source

- The original animation components remain in `src/` unchanged: parallax hero,
  WOW reveal classes, moving decorations, custom cursor, preloader, VanillaTilt
  service cards, Isotope portfolio filtering, Swiper testimonials, counters,
  popups, and modals.
- The complete original 19,367-line stylesheet is preserved at
  `styles/template-legacy.css`.
- The original light page, dark page, intro page, and dependency manifest are
  preserved in `legacy-template/`.
- These legacy files are intentionally outside `pages/` and are not imported by
  the live site. This keeps the Next.js 16 build clean while preserving the
  complete implementation for selective reuse.

## Live animation decisions

- The live hero uses one coordinated load sequence plus purposeful image,
  button, and project hover transitions.
- For the 2026-09-19 performance pass, the `hero-rise` and `portrait-in`
  animations kept their movement, duration, delay, and easing, while their
  initial opacity fade was removed so key content can paint immediately. If a
  richer fade is restored, keep the content visible on the first frame or begin
  the opacity effect after the initial paint.
- The original custom cursor, preloader, parallax portrait, moving squares,
  and repeated WOW scroll reveals are inactive. They were not deleted. Restore
  them selectively after testing motion, mobile performance, and reduced-motion
  behavior with the final visual direction.
- The original Isotope filter was replaced by a small React filter because all
  current categories fit a simple data array. The Isotope version remains in
  `src/components/Portfolio.js` for a larger or irregular future collection.

## UI held back because data is missing

| Preserved UI | Why it is not live | Data needed before restoring it |
| --- | --- | --- |
| Testimonial carousel | No verified client quotes appear on the Vimeo profile | Quote, client name, title/company, portrait or logo, and permission to publish |
| Resume timeline | No employment or education history is published | Organisation, role/course, dates, location, and a short responsibility or outcome |
| Skill progress bars | No defensible proficiency percentages are available | Named tools/skills and evidence-based wording; avoid invented percentages |
| Blog/news cards | No articles or behind-the-scenes posts were supplied | Title, summary, date, cover image, and article URL/content |
| Animated counters | Only film count and Vimeo join date are verified | Years of experience, completed projects, clients, awards, views, or other verified metrics |
| Service detail modals | The films show capabilities but not formal packages or case studies | Service scope, deliverables, typical turnaround, tools, process, and optional pricing language |
| Contact form delivery | The `/start-a-project` form UI, consent copy, Gmail fallback, and spam honeypot are live; submission stays disabled until the Formspree form ID is supplied | Formspree form ID for the form that delivers to `davender350@gmail.com` |
| Portfolio case-study modals | Vimeo supplies titles, durations, thumbnails, and video links only | Client, brief, Dev's role, edit decisions, tools, date, credits, and outcome |

## CMS readiness

- The live hero, featured project, project grid, categories, services, about
  copy, facts, contact details, social links, portrait, and SEO now come from
  Sanity. The original local content remains as a safe rendering fallback.
- Sanity document types now exist for testimonials, experience, skills, posts,
  and project case-study details. These types deliberately do not activate the
  preserved template sections until real content is published and the matching
  UI is restored and validated.
- Add future content in the Studio rather than inventing placeholders. When a
  section has complete data, restore its preserved component and motion from
  `src/` and `styles/template-legacy.css`.

## Current verified source data

The initial live content uses Devender's public Vimeo profile for his name,
location, biography, email address, portrait, ten film titles, durations,
thumbnails, and video URLs. New projects can use either YouTube or Vimeo.
Category labels and descriptive portfolio copy are editorial groupings for the
website and can be revised when Dev supplies project briefs.

## Future restoration order

1. Populate the existing Sanity case-study fields, then adapt the preserved
   portfolio modal.
2. Publish verified Sanity testimonials and restore the Swiper carousel.
3. Publish verified experience and skill records, then restore the resume UI.
4. Reintroduce parallax or moving decorations one at a time and validate mobile,
   keyboard, and reduced-motion behavior after each addition.
