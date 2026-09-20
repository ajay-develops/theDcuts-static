import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {StudioNavbar} from './components/StudioNavbar'
import {resolve} from './presentation'

const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'https://the-dcuts-static.vercel.app'

export default defineConfig({
  name: 'default',
  title: 'Devender Saroha Portfolio',

  projectId: 'yclymbbl',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    presentationTool({
      resolve,
      previewUrl: {
        initial: previewOrigin,
        previewMode: {
          enable: '/api/enable-draft',
        },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  studio: {
    components: {
      navbar: StudioNavbar,
    },
  },
})
