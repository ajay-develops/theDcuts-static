import {useLiveMode} from "@sanity/react-loader";
import {VisualEditing} from "@sanity/visual-editing/next-pages-router";
import {sanityClient} from "../sanity/client";
import DisableDraftMode from "./DisableDraftMode";

const previewClient = sanityClient.withConfig({stega: true});

export default function SanityVisualEditing() {
  useLiveMode({client: previewClient});

  return (
    <>
      <VisualEditing />
      <DisableDraftMode />
    </>
  );
}
