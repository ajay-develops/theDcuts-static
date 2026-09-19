import type {StructureResolver} from 'sanity/structure'

const hiddenTypes = new Set(['siteSettings'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Devender portfolio')
    .items([
      S.listItem()
        .title('Site settings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
      S.divider(),
      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('category').title('Project categories'),
      S.documentTypeListItem('service').title('Services'),
      S.divider(),
      S.listItem()
        .title('Content ready for future sections')
        .child(
          S.list()
            .title('Future sections')
            .items([
              S.documentTypeListItem('testimonial').title('Testimonials'),
              S.documentTypeListItem('experience').title('Experience'),
              S.documentTypeListItem('skill').title('Skills'),
              S.documentTypeListItem('post').title('Posts'),
            ]),
        ),
      ...S.documentTypeListItems().filter((item) => hiddenTypes.has(item.getId() || '') === false && !['project', 'category', 'service', 'testimonial', 'experience', 'skill', 'post'].includes(item.getId() || '')),
    ])
