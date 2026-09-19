import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-09-19'})
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const assetDirectory = path.resolve(scriptDirectory, '../../public/img/dev')

const categories = [
  {title: 'Narrative', slug: 'narrative', order: 1},
  {title: 'Motion', slug: 'motion', order: 2},
  {title: 'Documentary', slug: 'documentary', order: 3},
  {title: 'Travel', slug: 'travel', order: 4},
  {title: 'VFX', slug: 'vfx', order: 5},
]

const projects = [
  {vimeoId: '930753990', title: 'The universe exists within us', category: 'narrative', duration: '00:18', year: 2024},
  {vimeoId: '930782402', title: 'DILLI', category: 'motion', duration: '00:49', year: 2024},
  {vimeoId: '930759603', title: 'What Are We?', category: 'narrative', duration: '00:56', year: 2024},
  {vimeoId: '930762054', title: 'ZERO', category: 'motion', duration: '00:36', year: 2024},
  {vimeoId: '930767160', title: 'Teleport Effect', category: 'vfx', duration: '00:15', year: 2024},
  {vimeoId: '930769396', title: "Citizen's Thoughts", category: 'motion', duration: '00:09', year: 2024},
  {vimeoId: '931046018', title: 'Delhi Under the Smog', category: 'documentary', duration: '04:47', year: 2024, summary: 'A hard-edged visual story about a city struggling to breathe, built through atmosphere, pacing, and documentary detail.'},
  {vimeoId: '931463872', title: 'Different Delhi', category: 'travel', duration: '00:44', year: 2024},
  {vimeoId: '930775010', title: 'D.B. Cooper: Where Are You?', category: 'narrative', duration: '00:57', year: 2024},
  {vimeoId: '934436545', title: 'Creators United 2.0', category: 'motion', duration: '00:30', year: 2024},
]

const services = [
  {title: 'Video editing', description: 'Story structure, pacing, selects, and polished final cuts.'},
  {title: 'Motion graphics', description: 'Titles, logo animation, kinetic typography, and transitions.'},
  {title: 'Colour & finish', description: 'Colour balance, sound polish, exports, and delivery formats.'},
  {title: 'Visual effects', description: 'Compositing, screen work, clean-up, and stylised effects.'},
]

async function findOrCreate(type, field, value, document) {
  const existingId = await client.fetch(`*[_type == $type && ${field} == $value][0]._id`, {type, value})
  if (existingId) return client.createOrReplace({...document, _id: existingId})
  return client.create(document)
}

async function uploadImage(filename) {
  const existingId = await client.fetch('*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id', {filename})
  if (existingId) return existingId
  const asset = await client.assets.upload('image', fs.createReadStream(path.join(assetDirectory, filename)), {filename})
  return asset._id
}

const categoryDocuments = {}
for (const item of categories) {
  const document = await findOrCreate('category', 'slug.current', item.slug, {
    _type: 'category',
    title: item.title,
    displayTitle: item.vimeoId === '931046018' ? 'Delhi\nUnder the Smog' : item.title,
    slug: {_type: 'slug', current: item.slug},
    order: item.order,
  })
  categoryDocuments[item.slug] = document._id
}

const projectDocuments = {}
for (const [index, item] of projects.entries()) {
  const imageId = await uploadImage(`${item.vimeoId}.webp`)
  const document = await findOrCreate('project', 'vimeoId', item.vimeoId, {
    _type: 'project',
    title: item.title,
    slug: {_type: 'slug', current: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')},
    category: {_type: 'reference', _ref: categoryDocuments[item.category]},
    year: item.year,
    duration: item.duration,
    order: index + 1,
    summary: item.summary,
    vimeoId: item.vimeoId,
    thumbnail: {
      _type: 'image',
      asset: {_type: 'reference', _ref: imageId},
      alt: `Still from ${item.title}`,
    },
  })
  projectDocuments[item.vimeoId] = document._id
}

for (const [index, item] of services.entries()) {
  await findOrCreate('service', 'title', item.title, {
    _type: 'service',
    title: item.title,
    description: item.description,
    order: index + 1,
  })
}

const portraitId = await uploadImage('portrait-hd.webp')
const shareImageId = await uploadImage('930782402.webp')

await client.createOrReplace({
  _id: 'siteSettings',
  _type: 'siteSettings',
  name: 'Devender Saroha',
  role: 'Video Editor',
  location: 'Punjab, India',
  seoTitle: 'Devender Saroha — Video Editor',
  seoDescription: 'Portfolio of Devender Saroha, a video editor crafting narrative films, motion graphics, documentaries, travel stories, and visual effects.',
  shareImage: {_type: 'image', asset: {_type: 'reference', _ref: shareImageId}, alt: 'DILLI film still'},
  heroEyebrow: 'Video editor · Punjab, India',
  heroTitle: 'Stories cut\nto',
  heroEmphasis: 'move.',
  heroIntroduction: "I'm Devender Saroha. I shape raw footage into films with rhythm, clarity, and a visual pulse.",
  primaryCtaLabel: 'Watch selected work',
  availability: 'Available for projects',
  portrait: {_type: 'image', asset: {_type: 'reference', _ref: portraitId}, alt: 'Devender Saroha'},
  featuredProject: {_type: 'reference', _ref: projectDocuments['931046018']},
  workEyebrow: 'Selected work',
  workTitle: 'Ten cuts.\nOne point of view.',
  aboutLabel: 'ABOUT / DEV',
  aboutTitle: 'Every frame should earn its place.',
  aboutParagraphs: [
    "I'm a video editor focused on turning footage into clear, emotionally paced stories. My work moves between documentary, travel, narrative shorts, motion graphics, and visual effects.",
    'I bring a practical eye to every cut: find the idea, build the rhythm, and remove everything that gets in its way.',
  ],
  facts: [
    {_key: 'films', value: '10', label: 'Selected films'},
    {_key: 'disciplines', value: '5', label: 'Editing disciplines'},
    {_key: 'member-since', value: '2024', label: 'Vimeo member since'},
  ],
  servicesEyebrow: 'What I do',
  servicesTitle: 'From first cut\nto final frame.',
  contactEyebrow: 'Have footage. Need a story?',
  contactTitle: "Let's make\nthe cut.",
  contactCtaLabel: 'Start a conversation',
  email: 'davender350@gmail.com',
  socialLinks: [{_key: 'vimeo', label: 'Vimeo', url: 'https://vimeo.com/user217694996'}],
})

console.log(`Seeded ${projects.length} projects, ${services.length} services, and site settings.`)
