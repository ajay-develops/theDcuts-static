import {defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

const homepage = [{title: 'Portfolio homepage', href: '/'}]

export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    siteSettings: defineLocations({
      locations: homepage,
      message: 'This content appears across the portfolio homepage',
      tone: 'positive',
    }),
    project: defineLocations({
      select: {title: 'title'},
      resolve: (document) => ({
        locations: homepage.map((location) => ({
          ...location,
          title: document?.title ? `${document.title} on the homepage` : location.title,
        })),
      }),
    }),
    category: defineLocations({
      locations: homepage,
      message: 'Categories appear in the Selected Work filters',
    }),
    service: defineLocations({
      locations: homepage,
      message: 'Services appear in the What I Do section',
    }),
  },
}
