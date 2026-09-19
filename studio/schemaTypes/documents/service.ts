import {defineField, defineType} from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Short description', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'order', title: 'Display order', type: 'number', initialValue: 100, validation: (rule) => rule.required().integer().min(0)}),
    defineField({name: 'deliverables', title: 'Deliverables', description: 'Ready for a future service detail view.', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'turnaround', title: 'Typical turnaround', type: 'string'}),
    defineField({name: 'process', title: 'Process', type: 'array', of: [{type: 'block'}]}),
  ],
  orderings: [{title: 'Display order', name: 'displayOrder', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title', description: 'description'}, prepare: ({title, description}) => ({title, subtitle: description})},
})
