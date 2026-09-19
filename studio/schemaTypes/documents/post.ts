import {defineField, defineType} from 'sanity'

export const post = defineType({
  name: 'post', title: 'Post', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'publishedAt', title: 'Published at', type: 'datetime', validation: (rule) => rule.required()}),
    defineField({name: 'coverImage', title: 'Cover image', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required().warning('Alternative text helps screen-reader users.')})]}),
    defineField({name: 'body', title: 'Article', type: 'array', of: [{type: 'block'}, {type: 'image', options: {hotspot: true}}]}),
    defineField({name: 'externalUrl', title: 'External article URL', type: 'url', validation: (rule) => rule.uri({scheme: ['http', 'https']})}),
  ],
  preview: {select: {title: 'title', subtitle: 'summary', media: 'coverImage'}},
})
