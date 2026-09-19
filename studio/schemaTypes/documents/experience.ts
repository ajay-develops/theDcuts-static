import {defineField, defineType} from 'sanity'

export const experience = defineType({
  name: 'experience', title: 'Experience', type: 'document',
  fields: [
    defineField({name: 'organisation', title: 'Organisation', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'role', title: 'Role or course', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'kind', title: 'Type', type: 'string', options: {list: [{title: 'Work', value: 'work'}, {title: 'Education', value: 'education'}], layout: 'radio'}, validation: (rule) => rule.required()}),
    defineField({name: 'startDate', title: 'Start date', type: 'date'}),
    defineField({name: 'endDate', title: 'End date', type: 'date'}),
    defineField({name: 'current', title: 'Current', type: 'boolean', initialValue: false}),
    defineField({name: 'location', title: 'Location', type: 'string'}),
    defineField({name: 'summary', title: 'Responsibility or outcome', type: 'text', rows: 4}),
    defineField({name: 'order', title: 'Display order', type: 'number', initialValue: 100, validation: (rule) => rule.required().integer().min(0)}),
  ],
  preview: {select: {title: 'role', subtitle: 'organisation'}},
})
