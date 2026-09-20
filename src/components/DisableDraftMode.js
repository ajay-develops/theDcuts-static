import {useEffect, useState} from "react";

export default function DisableDraftMode() {
  const [isStandalonePreview, setIsStandalonePreview] = useState(false);

  useEffect(() => {
    setIsStandalonePreview(window.top === window);
  }, []);

  if (!isStandalonePreview) return null;

  return (
    <a className="disable-draft-mode" href="/api/disable-draft">
      Exit live preview
    </a>
  );
}
