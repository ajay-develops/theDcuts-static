import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-09-20'})
const applyChanges = process.env.SANITY_CLEANUP_APPLY === '1'

const legacyDocuments = await client.fetch(`*[
  (_type == "category" && defined(displayTitle)) ||
  (_type == "project" && defined(vimeoId))
]{
  _id,
  _rev,
  _type,
  displayTitle,
  vimeoId,
  videoUrl
}`)

console.log(
  `${applyChanges ? 'Applying' : 'Dry run:'} ${legacyDocuments.length} legacy document(s) found.`,
)

for (const document of legacyDocuments) {
  const fieldsToUnset = []
  const fieldsToSet = {}

  if (document._type === 'category' && document.displayTitle !== undefined) {
    fieldsToUnset.push('displayTitle')
  }

  if (document._type === 'project' && document.vimeoId !== undefined) {
    const legacyVideoId = String(document.vimeoId).trim()

    if (!document.videoUrl) {
      if (!/^\d+$/.test(legacyVideoId)) {
        throw new Error(
          `Cannot migrate ${document._id}: vimeoId is not numeric and videoUrl is empty.`,
        )
      }
      fieldsToSet.videoUrl = `https://vimeo.com/${legacyVideoId}`
    }

    fieldsToUnset.push('vimeoId')
  }

  console.log(
    JSON.stringify({
      id: document._id,
      type: document._type,
      set: fieldsToSet,
      unset: fieldsToUnset,
    }),
  )

  if (applyChanges) {
    let patch = client.patch(document._id).ifRevisionId(document._rev)
    if (Object.keys(fieldsToSet).length > 0) patch = patch.set(fieldsToSet)
    await patch.unset(fieldsToUnset).commit()
  }
}

if (!applyChanges && legacyDocuments.length > 0) {
  console.log(
    'No data changed. Run `npm run cms:cleanup-legacy` from the repository root to apply.',
  )
} else if (applyChanges) {
  console.log('Legacy field cleanup complete.')
}
