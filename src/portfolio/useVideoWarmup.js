import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {canWarm} from "./warmup.mjs";

const HOVER_DELAY_MS = 150;
const DWELL_MS = 1000;
const PREVIEW_DELAY_MS = 300;

// Hover previews only on real hovering pointers, and never for reduced-motion or data-saving visitors.
function canPreview() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return canWarm(navigator.connection);
}

export const projectId = (project) => project?._id || project?.id || null;

// Decides which single project (if any) should have a hidden, pre-loaded player.
// Desktop: pointer rests on a card (or keyboard focus). Touch: card dwells near the viewport centre.
export function useVideoWarmup(visibleProjects, isPlayerOpen = false) {
  const [warmProject, setWarmProject] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null); // {project, element} of the card showing its in-card preview
  const hoverTimer = useRef(null);
  const previewTimer = useRef(null);
  const blockedRef = useRef(false);
  blockedRef.current = isPlayerOpen; // never change the warm player while a video is open
  const projectsById = useMemo(() => new Map(visibleProjects.map((p) => [projectId(p), p])), [visibleProjects]);

  const warm = useCallback((project) => {
    if (!project?.warmEmbedUrl || blockedRef.current) return;
    if (!canWarm(typeof navigator !== "undefined" ? navigator.connection : undefined)) return;
    setWarmProject((current) => (projectId(current) === projectId(project) ? current : project));
  }, []);

  const clearWarm = useCallback(() => setWarmProject(null), []);

  useEffect(
    () => () => {
      clearTimeout(hoverTimer.current);
      clearTimeout(previewTimer.current);
    },
    []
  );

  // Never leave a preview playing behind an open modal.
  useEffect(() => {
    if (isPlayerOpen) setPreviewTarget(null);
  }, [isPlayerOpen]);

  // Touch devices: warm the card that has sat near the middle of the screen for ~1s.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !window.matchMedia("(pointer: coarse)").matches) return undefined;
    const timers = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.dataset.warmId;
          clearTimeout(timers.get(entry.target));
          if (entry.isIntersecting) {
            timers.set(entry.target, setTimeout(() => warm(projectsById.get(id)), DWELL_MS));
          }
        });
      },
      {rootMargin: "-35% 0px -35% 0px"}
    );
    document.querySelectorAll("[data-warm-id]").forEach((element) => observer.observe(element));
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      observer.disconnect();
    };
  }, [projectsById, warm]);

  const cardProps = useCallback(
    (project, {preview = true} = {}) => ({
      "data-warm-id": projectId(project),
      onPointerEnter: (event) => {
        if (event.pointerType === "touch") return;
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => warm(project), HOVER_DELAY_MS);
        clearTimeout(previewTimer.current);
        if (preview && project?.warmEmbedUrl && canPreview()) {
          const element = event.currentTarget;
          previewTimer.current = setTimeout(() => {
            if (!blockedRef.current) setPreviewTarget({project, element});
          }, PREVIEW_DELAY_MS);
        }
      },
      onPointerLeave: () => {
        clearTimeout(hoverTimer.current);
        clearTimeout(previewTimer.current);
        setPreviewTarget(null);
      },
      onFocus: (event) => {
        if (event.target.matches?.(":focus-visible")) warm(project);
      },
    }),
    [warm]
  );

  return {warmProject, clearWarm, cardProps, previewTarget};
}
