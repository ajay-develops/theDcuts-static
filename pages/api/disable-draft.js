export default function disableDraftMode(_req, res) {
  res.setDraftMode({enable: false});
  res.writeHead(307, {Location: "/"});
  res.end();
}
