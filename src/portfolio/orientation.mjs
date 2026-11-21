export const RATIOS = {landscape: 1.6, portrait: 0.5625};

function isYouTubeShorts(videoUrl) {
  if (!videoUrl) return false;
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const isYouTube = host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com" || host.endsWith(".youtube-nocookie.com");
    return isYouTube && url.pathname.split("/").filter(Boolean)[0] === "shorts";
  } catch {
    return false;
  }
}

// Thumbnail dimensions win; a YouTube /shorts/ URL is the fallback; default landscape.
export function getOrientation(dimensions, videoUrl) {
  const width = Number(dimensions?.width);
  const height = Number(dimensions?.height);
  if (width > 0 && height > 0) return height > width ? "portrait" : "landscape";
  return isYouTubeShorts(videoUrl) ? "portrait" : "landscape";
}
