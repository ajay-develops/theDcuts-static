import {defineField, defineType} from 'sanity'

export const skill = defineType({
  name: 'skill', title: 'Skill', type: 'document',
  fields: [
    defineField({name: 'name', title: 'Skill or tool', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Evidence-based description', description: 'Describe the capability without inventing a percentage.', type: 'text', rows: 3}),
    defineField({name: 'order', title: 'Display order', type: 'number', initialValue: 100, validation: (rule) => rule.required().integer().min(0)}),
  ],
  preview: {select: {title: 'name', subtitle: 'description'}},
})
