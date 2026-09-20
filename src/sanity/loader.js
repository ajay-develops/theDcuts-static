import {loadQuery, setServerClient} from "@sanity/react-loader";
import {sanityClient} from "./client";

const viewerToken = process.env.SANITY_VIEWER_TOKEN;

setServerClient(viewerToken ? sanityClient.withConfig({token: viewerToken}) : sanityClient);

export function getLoadQueryOptions(draftMode) {
  return draftMode
    ? {perspective: "drafts", stega: true, useCdn: false}
    : {perspective: "published", stega: false, useCdn: true};
}

export {loadQuery};
