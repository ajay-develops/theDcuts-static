import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import {stegaClean} from "next-sanity";
import {projectId} from "../portfolio/useVideoWarmup";
import {isEndedMessage, isPlayingMessage, isReadyMessage, listenCommands, PLAYER_HOSTS, prebufferCommands, restartCommands, revealCommands, settleCommands} from "../portfolio/warmup.mjs";

const IFRAME_ALLOW = "autoplay; fullscreen; picture-in-picture; encrypted-media";

// Renders the player shell. While only `warmProject` is set the shell is hidden and holds a pre-loaded
// player; clicking its card reveals the same iframe (no reload) and sends "play". Anything else uses
// the original cold iframe with autoplay=1.
// While `previewTarget` (the hovered card) matches the warm project, that same iframe is also laid over the
// card as a muted looping preview (CSS position only, so it never reloads), then returns to the modal on click.
const VideoModal = forwardRef(function VideoModal({activeProject, warmProject, previewTarget, onClose}, ref) {
  const warmFrameRef = useRef(null); // attached only to the warm iframe, never the cold fallback
  const readyIdRef = useRef(null);
  const stateRef = useRef({prebuffered: false, prebuffering: false, revealed: false});
  const [playedWarmId, setPlayedWarmId] = useState(null);
  const [previewShown, setPreviewShown] = useState(false);
  const instagramFrameRef = useRef(null);
  const [instagramHeight, setInstagramHeight] = useState(null);

  const warmId = projectId(warmProject);
  const activeId = projectId(activeProject);
  const shown = activeProject || warmProject;
  const previewing = Boolean(previewTarget && !activeProject && warmId && projectId(previewTarget.project) === warmId);
  const previewingRef = useRef(false);
  previewingRef.current = previewing;

  const send = (provider, commands) => {
    const frame = warmFrameRef.current?.contentWindow;
    if (frame) commands.forEach((command) => frame.postMessage(command, PLAYER_HOSTS[provider]));
  };

  // Warm player lifecycle (messages are only trusted from the iframe itself, from the provider's origin):
  // ready -> play muted to buffer -> first "playing" -> pause + rewind. A click at any point reveals + plays.
  useEffect(() => {
    readyIdRef.current = null;
    stateRef.current = {prebuffered: false, prebuffering: false, revealed: false};
    if (!warmId) return undefined;
    const provider = warmProject.provider;
    const onMessage = (event) => {
      if (event.source !== warmFrameRef.current?.contentWindow) return;
      const state = stateRef.current;
      if (isReadyMessage(provider, event.origin, event.data)) {
        readyIdRef.current = warmId;
        if (!state.revealed && (previewingRef.current || !state.prebuffered)) {
          state.prebuffered = true; // one-shot: never prebuffer the same player twice
          state.prebuffering = !previewingRef.current;
          send(provider, prebufferCommands(provider));
        }
      } else if (!state.revealed && isPlayingMessage(provider, event.origin, event.data)) {
        if (previewingRef.current) {
          state.prebuffering = false;
          setPreviewShown(true); // first frames are playing: fade the preview in over the still
        } else if (state.prebuffering) {
          state.prebuffering = false;
          send(provider, settleCommands(provider));
        }
      } else if (previewingRef.current && !state.revealed && isEndedMessage(provider, event.origin, event.data)) {
        send(provider, restartCommands(provider)); // loop the preview
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [warmId, warmProject?.provider]);

  // Preview on: play muted. Preview off (pointer left): stop and rewind, unless a click already took over.
  useEffect(() => {
    if (!previewing) return undefined;
    const provider = warmProject.provider;
    if (readyIdRef.current === warmId && !stateRef.current.revealed) {
      stateRef.current.prebuffering = false;
      send(provider, prebufferCommands(provider));
    }
    return () => {
      setPreviewShown(false);
      if (readyIdRef.current === warmId && !stateRef.current.revealed) send(provider, settleCommands(provider));
    };
  }, [previewing, warmId]);

  // Lay the warm iframe over the hovered card, scaled to cover it (no letterbox bars) and clipped to the card.
  useEffect(() => {
    const frame = warmFrameRef.current;
    if (!previewing || !frame) return undefined;
    const videoAspect = warmProject.orientation === "portrait" ? 9 / 16 : 16 / 9;
    const place = () => {
      const rect = previewTarget.element.getBoundingClientRect();
      const width = Math.max(rect.width, rect.height * videoAspect);
      const height = Math.max(rect.height, rect.width / videoAspect);
      const overflowX = (width - rect.width) / 2;
      const overflowY = (height - rect.height) / 2;
      frame.style.left = `${rect.left - overflowX}px`;
      frame.style.top = `${rect.top - overflowY}px`;
      frame.style.width = `${width}px`;
      frame.style.height = `${height}px`;
      frame.style.clipPath = `inset(${overflowY}px ${overflowX}px)`;
    };
    place();
    window.addEventListener("scroll", place, {passive: true, capture: true});
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, {capture: true});
      window.removeEventListener("resize", place);
      frame.style.cssText = "";
    };
  }, [previewing, previewTarget, warmProject]);

  useEffect(() => {
    if (!activeId) setPlayedWarmId(null);
  }, [activeId]);

  // Instagram's embed posts its content height; size the frame to it so there is no blank space or inner scrolling.
  const isInstagram = activeProject?.provider === "Instagram";
  useEffect(() => {
    setInstagramHeight(null);
    if (!isInstagram) return undefined;
    const onMessage = (event) => {
      if (event.origin !== "https://www.instagram.com" || event.source !== instagramFrameRef.current?.contentWindow) return;
      try {
        const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        const height = Number(payload?.details?.height);
        if (payload?.type === "MEASURE" && height > 0) setInstagramHeight(height);
      } catch {
        // Not a message we understand.
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isInstagram, activeId]);

  // Called synchronously in the card's click handler so the user gesture still counts.
  const playWarm = useCallback(
    (project) => {
      const id = projectId(project);
      const frame = warmFrameRef.current?.contentWindow;
      if (!id || id !== warmId || readyIdRef.current !== id || !frame) return false;
      stateRef.current.revealed = true;
      send(project.provider, [...restartCommands(project.provider).slice(0, 1), ...revealCommands(project.provider)]); // start from 0, unmuted
      setPlayedWarmId(id);
      return true;
    },
    [warmId]
  );
  useImperativeHandle(ref, () => ({playWarm}), [playWarm]);

  if (!shown) return null;

  const isActive = Boolean(activeProject);
  const useWarmIframe = Boolean(warmProject) && (!isActive || (playedWarmId === activeId && activeId === warmId));
  const iframeProject = useWarmIframe ? warmProject : activeProject;
  const title = stegaClean(shown.title);

  return (
    <div
      className={`video-modal${isActive ? "" : " is-warm-only"}`}
      role={isActive ? "dialog" : undefined}
      aria-modal={isActive ? "true" : undefined}
      aria-label={isActive ? title : undefined}
      aria-hidden={isActive ? undefined : true}
      inert={!isActive}
    >
      <button className="modal-backdrop" onClick={onClose} aria-label="Close video" tabIndex={isActive ? 0 : -1} />
      <div className="modal-content" data-orientation={shown.orientation} data-provider={shown.provider}>
        <div className="modal-topbar">
          <div><span>{[shown.categoryLabel || shown.category, shown.provider].filter(Boolean).join(" · ")}</span><strong>{shown.title}</strong></div>
          <button onClick={onClose} aria-label="Close video">Close</button>
        </div>
        <div className="video-frame" style={isInstagram && instagramHeight ? {height: `${instagramHeight}px`} : undefined}>
          {iframeProject && (
            <iframe
              key={`${useWarmIframe ? "warm" : "cold"}-${projectId(iframeProject)}`}
              ref={useWarmIframe ? warmFrameRef : isInstagram ? instagramFrameRef : undefined}
              className={useWarmIframe && previewing ? `is-previewing${previewShown ? " is-shown" : ""}` : undefined}
              src={useWarmIframe ? iframeProject.warmEmbedUrl : iframeProject.embedUrl}
              title={stegaClean(iframeProject.title)}
              allow={IFRAME_ALLOW}
              allowFullScreen
              onLoad={() => {
                if (useWarmIframe) send(iframeProject.provider, listenCommands(iframeProject.provider));
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default VideoModal;
