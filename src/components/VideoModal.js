import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import {stegaClean} from "next-sanity";
import {projectId} from "../portfolio/useVideoWarmup";
import {isPlayingMessage, isReadyMessage, listenCommands, PLAYER_HOSTS, prebufferCommands, revealCommands, settleCommands} from "../portfolio/warmup.mjs";

const IFRAME_ALLOW = "autoplay; fullscreen; picture-in-picture; encrypted-media";

// Renders the player shell. While only `warmProject` is set the shell is hidden and holds a pre-loaded
// player; clicking its card reveals the same iframe (no reload) and sends "play". Anything else uses
// the original cold iframe with autoplay=1.
const VideoModal = forwardRef(function VideoModal({activeProject, warmProject, onClose}, ref) {
  const warmFrameRef = useRef(null); // attached only to the warm iframe, never the cold fallback
  const readyIdRef = useRef(null);
  const stateRef = useRef({prebuffered: false, prebuffering: false, revealed: false});
  const [playedWarmId, setPlayedWarmId] = useState(null);

  const warmId = projectId(warmProject);
  const activeId = projectId(activeProject);
  const shown = activeProject || warmProject;

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
        if (!state.prebuffered && !state.revealed) {
          state.prebuffered = true; // one-shot: never prebuffer the same player twice
          state.prebuffering = true;
          send(provider, prebufferCommands(provider));
        }
      } else if (state.prebuffering && !state.revealed && isPlayingMessage(provider, event.origin, event.data)) {
        state.prebuffering = false;
        send(provider, settleCommands(provider));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [warmId, warmProject?.provider]);

  useEffect(() => {
    if (!activeId) setPlayedWarmId(null);
  }, [activeId]);

  // Called synchronously in the card's click handler so the user gesture still counts.
  const playWarm = useCallback(
    (project) => {
      const id = projectId(project);
      const frame = warmFrameRef.current?.contentWindow;
      if (!id || id !== warmId || readyIdRef.current !== id || !frame) return false;
      stateRef.current.revealed = true;
      send(project.provider, revealCommands(project.provider));
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
      <div className="modal-content" data-orientation={shown.orientation}>
        <div className="modal-topbar">
          <div><span>{[shown.categoryLabel || shown.category, shown.provider].filter(Boolean).join(" · ")}</span><strong>{shown.title}</strong></div>
          <button onClick={onClose} aria-label="Close video">Close</button>
        </div>
        <div className="video-frame">
          {iframeProject && (
            <iframe
              key={`${useWarmIframe ? "warm" : "cold"}-${projectId(iframeProject)}`}
              ref={useWarmIframe ? warmFrameRef : undefined}
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
