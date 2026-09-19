import createImageUrlBuilder from "@sanity/image-url";
import {sanityConfig} from "./client";

const builder = createImageUrlBuilder(sanityConfig);

export function urlFor(source) {
  return builder.image(source);
}
