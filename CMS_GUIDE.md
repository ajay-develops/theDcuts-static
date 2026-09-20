# Devender Saroha portfolio CMS

The content editor is deployed at
[devender-saroha-portfolio.sanity.studio](https://devender-saroha-portfolio.sanity.studio/).
The public website's `/studio` address redirects to this editor, and the Studio
navbar includes a **View website** button that opens the live portfolio in a new
tab.

## Live preview

Open **Presentation** in the Studio navigation to edit with the portfolio beside
the document form. Draft changes appear in the preview as they are typed, and
clicking highlighted text in the preview opens its source field in the Studio.
The preview includes unpublished drafts; the public website continues to show
published content only.

When a preview is opened in its own browser tab, use **Exit live preview** in the
bottom-right corner to return to the published site. Preview access is protected
by Sanity's short-lived preview URL secrets and a server-only Viewer token.

## Editing the live site

1. Sign in to the Studio with a Sanity project member account.
2. Open **Site settings** for the hero, portrait, biography, facts, contact
   information, social links, SEO, and featured project.
3. Use **Projects**, **Project categories**, and **Services** to add, edit,
   reorder, publish, or delete portfolio content.
4. Press **Publish** after each change. The website refreshes published content
   within about 60 seconds.

Deleting a referenced category or featured project may be blocked until its
references are changed. This protects the live layout from broken records.

Projects accept full YouTube and Vimeo URLs. Paste the video URL, upload a
thumbnail still, add its alternative text, and publish. Public and unlisted
videos can play in the portfolio; private videos cannot be embedded.

## Future sections

The Studio also contains Testimonials, Experience, Skills, and Posts. Their
original template UI and animations remain preserved but intentionally inactive
until verified content exists. The fields needed to restore those sections are
already modeled in the CMS.

## Local development

- Website: `npm run dev`
- Studio: `npm run cms:dev`
- Website build: `npm run build`
- Studio build: `npm run cms:build`
- Regenerate the current seed: `npm run cms:seed`

The seed is intended for setup or recovery. Normal content changes should be
made in the Studio.

## Project enquiry form

The `/start-a-project` page submits to Formspree when
`NEXT_PUBLIC_FORMSPREE_FORM_ID` is set. Create a Formspree form that sends
notifications to `davender350@gmail.com`, then add only the form ID (the short
value after `/f/` in the endpoint) to Vercel. The form ID is public by design;
no API secret is stored in the browser.
