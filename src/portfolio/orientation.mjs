export const RATIOS = {landscape: 1.6, portrait: 0.5625};

// YouTube /shorts/ and Instagram /reel/ URLs are vertical videos.
function isVerticalVideoUrl(videoUrl) {
  if (!videoUrl) return false;
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const parts = url.pathname.split("/").filter(Boolean);
    const isYouTube = host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com" || host.endsWith(".youtube-nocookie.com");
    const isInstagram = host === "instagram.com" || host.endsWith(".instagram.com") || host === "instagr.am";
    if (isYouTube) return parts[0] === "shorts";
    if (isInstagram) return parts.includes("reel") || parts.includes("reels");
    return false;
  } catch {
    return false;
  }
}

// Thumbnail dimensions win; a YouTube /shorts/ or Instagram /reel/ URL is the fallback; default landscape.
export function getOrientation(dimensions, videoUrl) {
  const width = Number(dimensions?.width);
  const height = Number(dimensions?.height);
  if (width > 0 && height > 0) return height > width ? "portrait" : "landscape";
  return isVerticalVideoUrl(videoUrl) ? "portrait" : "landscape";
}
