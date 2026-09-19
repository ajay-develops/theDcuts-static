# Devender Saroha portfolio CMS

The content editor is deployed at
[devender-saroha-portfolio.sanity.studio](https://devender-saroha-portfolio.sanity.studio/).

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
