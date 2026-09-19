import {defineQuery} from 'next-sanity'

export const HOME_QUERY = defineQuery(`{
  "site": *[_id == "siteSettings"][0]{
    name,
    role,
    location,
    seoTitle,
    seoDescription,
    shareImage {asset->{_id, url}, alt, hotspot, crop},
    heroEyebrow,
    heroTitle,
    heroEmphasis,
    heroIntroduction,
    primaryCtaLabel,
    availability,
    portrait {asset->{_id, url}, alt, hotspot, crop},
    "featuredProject": featuredProject->{
      _id,
      title,
      displayTitle,
      "slug": slug.current,
      "category": category->title,
      year,
      duration,
      order,
      summary,
      vimeoId,
      thumbnail {asset->{_id, url, metadata {lqip, dimensions}}, alt, hotspot, crop}
    },
    workEyebrow,
    workTitle,
    aboutLabel,
    aboutTitle,
    aboutParagraphs,
    facts[]{_key, value, label},
    servicesEyebrow,
    servicesTitle,
    contactEyebrow,
    contactTitle,
    contactCtaLabel,
    email,
    socialLinks[]{_key, label, url}
  },
  "projects": *[_type == "project"] | order(order asc, _createdAt asc){
    _id,
    title,
    displayTitle,
    "slug": slug.current,
    "category": category->title,
    year,
    duration,
    order,
    summary,
    vimeoId,
    thumbnail {asset->{_id, url, metadata {lqip, dimensions}}, alt, hotspot, crop}
  },
  "services": *[_type == "service"] | order(order asc, _createdAt asc){
    _id,
    title,
    description,
    order
  }
}`)
