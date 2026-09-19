import {defineField, defineType} from 'sanity'

function validateVideoUrl(value?: string) {
  if (!value) return true

  try {
    const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, '')
    const isYouTube = hostname === 'youtu.be' || hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtube-nocookie.com' || hostname.endsWith('.youtube-nocookie.com')
    const isVimeo = hostname === 'vimeo.com' || hostname.endsWith('.vimeo.com')
    return isYouTube || isVimeo || 'Use a YouTube or Vimeo video URL.'
  } catch {
    return 'Enter a valid YouTube or Vimeo URL.'
  }
}

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'caseStudy', title: 'Future case study'},
  ],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    defineField({name: 'displayTitle', title: 'Display title', description: 'Optional line-broken title for the featured layout.', type: 'text', rows: 2, group: 'content'}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', group: 'content', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'category', title: 'Category', type: 'reference', group: 'content', to: [{type: 'category'}], validation: (rule) => rule.required()}),
    defineField({name: 'year', title: 'Year', type: 'number', group: 'content', validation: (rule) => rule.integer().min(1900).max(2100)}),
    defineField({name: 'duration', title: 'Duration', description: 'Use MM:SS, for example 04:47.', type: 'string', group: 'content', validation: (rule) => rule.required().regex(/^\d{2}:\d{2}$/, {name: 'MM:SS'})}),
    defineField({name: 'order', title: 'Display order', type: 'number', group: 'content', initialValue: 100, validation: (rule) => rule.required().integer().min(0)}),
    defineField({name: 'summary', title: 'Short description', type: 'text', rows: 4, group: 'content'}),
    defineField({
      name: 'videoUrl',
      title: 'YouTube or Vimeo URL',
      description: 'Paste the full public or unlisted video URL. Private videos cannot be played on the portfolio.',
      type: 'url',
      group: 'media',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']}).custom(validateVideoUrl),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      group: 'media',
      options: {hotspot: true},
      description: 'Upload the still that should appear in the project grid and featured layout.',
      validation: (rule) => rule.required(),
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required().warning('Alternative text helps screen-reader users.')})],
    }),
    defineField({name: 'client', title: 'Client', type: 'string', group: 'caseStudy'}),
    defineField({name: 'role', title: 'Dev’s role', type: 'string', group: 'caseStudy'}),
    defineField({name: 'tools', title: 'Tools used', type: 'array', group: 'caseStudy', of: [{type: 'string'}]}),
    defineField({name: 'brief', title: 'Brief and edit decisions', type: 'array', group: 'caseStudy', of: [{type: 'block'}]}),
    defineField({name: 'credits', title: 'Credits', type: 'text', rows: 3, group: 'caseStudy'}),
    defineField({name: 'outcome', title: 'Outcome', type: 'text', rows: 3, group: 'caseStudy'}),
  ],
  orderings: [{title: 'Portfolio order', name: 'portfolioOrder', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', category: 'category.title', media: 'thumbnail', duration: 'duration'},
    prepare: ({title, category, media, duration}) => ({title, subtitle: [category, duration].filter(Boolean).join(' · '), media}),
  },
})
