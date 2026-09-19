import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial', title: 'Testimonial', type: 'document',
  fields: [
    defineField({name: 'quote', title: 'Quote', type: 'text', rows: 5, validation: (rule) => rule.required()}),
    defineField({name: 'clientName', title: 'Client name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'clientTitle', title: 'Title or company', type: 'string'}),
    defineField({name: 'permissionConfirmed', title: 'Permission to publish confirmed', type: 'boolean', initialValue: false, validation: (rule) => rule.required().custom((value) => value ? true : 'Confirm permission before publishing this quote.')}),
    defineField({name: 'portrait', title: 'Portrait or logo', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
    defineField({name: 'order', title: 'Display order', type: 'number', initialValue: 100, validation: (rule) => rule.required().integer().min(0)}),
  ],
  preview: {select: {title: 'clientName', subtitle: 'clientTitle', media: 'portrait'}},
})
