function normalizedHostname(url) {
  return url.hostname.toLowerCase().replace(/^www\./, '')
}

export function getVideoEmbed(videoUrl, fallbackVimeoId) {
  if (videoUrl) {
    try {
      const url = new URL(videoUrl)
      const host = normalizedHostname(url)

      if (host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com')) {
        let id = url.searchParams.get('v')
        if (!id) {
          const parts = url.pathname.split('/').filter(Boolean)
          id = ['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : parts[0]
        }

        if (id) {
          return {
            id,
            provider: 'YouTube',
            embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`,
          }
        }
      }

      if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
        const id = url.pathname.split('/').filter(Boolean).reverse().find((part) => /^\d+$/.test(part))
        if (id) {
          return {
            id,
            provider: 'Vimeo',
            embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0`,
          }
        }
      }
    } catch {
      // Sanity validates new URLs; this fallback keeps older records renderable.
    }
  }

  if (fallbackVimeoId) {
    return {
      id: fallbackVimeoId,
      provider: 'Vimeo',
      embedUrl: `https://player.vimeo.com/video/${fallbackVimeoId}?autoplay=1&title=0&byline=0&portrait=0`,
    }
  }

  return {id: null, provider: null, embedUrl: null}
}
