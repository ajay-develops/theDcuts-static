import {stegaClean} from "next-sanity";
import {getVideoEmbed} from "../video";
import {urlFor} from "../sanity/image";
import {getOrientation, RATIOS} from "./orientation.mjs";

const IMAGE_SPECS = {
  landscape: {widths: [320, 480, 640, 1000, 1400], defaultWidth: 1000},
  portrait: {widths: [240, 360, 540, 720], defaultWidth: 540},
};

export function sanityImage(source, width, height) {
  if (!source?.asset) return null;
  return urlFor(source).width(width).height(height).fit("crop").auto("format").url();
}

export function sanityImageSrcSet(source, widths, aspectRatio) {
  if (!source?.asset) return null;
  return widths
    .map((width) => `${sanityImage(source, width, Math.round(width / aspectRatio))} ${width}w`)
    .join(", ");
}

// options.landscapeImage: crop the still as landscape even for a portrait video
// (used by the featured hero, whose frame is landscape). The player still follows `orientation`.
export function mapProject(project, {landscapeImage = false} = {}) {
  const video = getVideoEmbed(stegaClean(project?.videoUrl), stegaClean(project?.id));
  const thumbnail = project?.thumbnail;
  const orientation = getOrientation(thumbnail?.asset?.metadata?.dimensions, stegaClean(project?.videoUrl));
  const imageShape = landscapeImage ? "landscape" : orientation;
  const ratio = RATIOS[imageShape];
  const {widths, defaultWidth} = IMAGE_SPECS[imageShape];
  const imageHeight = Math.round(defaultWidth / ratio);

  return {
    ...project,
    ...video,
    categoryLabel: project?.category,
    category: stegaClean(project?.category),
    orientation,
    ratio: RATIOS[orientation],
    image: sanityImage(thumbnail, defaultWidth, imageHeight) || project?.image || `/img/dev/${video.id}.webp`,
    imageSrcSet: sanityImageSrcSet(thumbnail, widths, ratio),
    imageWidth: defaultWidth,
    imageHeight,
    imageAlt: stegaClean(thumbnail?.alt || `Still from ${project?.title || "project"}`),
  };
}

export function mapSite(site) {
  if (!site) return site;
  return {
    ...site,
    featuredProject: site.featuredProject ? mapProject(site.featuredProject, {landscapeImage: true}) : null,
    portraitUrl: sanityImage(site.portrait, 800, 1053),
    portraitSrcSet: sanityImageSrcSet(site.portrait, [360, 560, 800, 1100], 0.76),
    shareImageUrl: sanityImage(site.shareImage, 1200, 630),
  };
}

// Runs on the server (getStaticProps) or, in draft mode only, in the preview chunk.
export function mapHomeData(cmsData) {
  if (!cmsData) return cmsData;
  const site = mapSite(cmsData.site) || {};
  // No configured featured project: the hero falls back to the first project, cropped for the landscape hero frame.
  if (!site.featuredProject && cmsData.projects?.length) {
    site.featuredProject = mapProject(cmsData.projects[0], {landscapeImage: true});
  }
  return {
    ...cmsData,
    site,
    projects: (cmsData.projects || []).map((project) => mapProject(project)),
  };
}
