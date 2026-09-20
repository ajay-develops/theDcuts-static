import {validatePreviewUrl} from "@sanity/preview-url-secret";
import {sanityClient} from "../../src/sanity/client";

export default async function enableDraftMode(req, res) {
  if (!req.url) {
    return res.status(400).json({message: "Missing request URL"});
  }

  const token = process.env.SANITY_VIEWER_TOKEN;
  if (!token) {
    return res.status(500).json({message: "Live preview is not configured"});
  }

  const {isValid, redirectTo = "/"} = await validatePreviewUrl(
    sanityClient.withConfig({token}),
    req.url,
  );

  if (!isValid) {
    return res.status(401).json({message: "Invalid preview secret"});
  }

  res.setDraftMode({enable: true});
  res.writeHead(307, {Location: redirectTo});
  return res.end();
}
