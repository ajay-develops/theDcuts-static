export const PLAYER_HOSTS = {
  YouTube: "https://www.youtube-nocookie.com",
  Vimeo: "https://player.vimeo.com",
};

const READY_EVENTS = {
  YouTube: ["onReady"],
  Vimeo: ["ready"],
};

// connection is navigator.connection (may be undefined, e.g. Safari/Firefox).
export function canWarm(connection) {
  if (!connection) return true;
  if (connection.saveData) return false;
  return connection.effectiveType !== "2g" && connection.effectiveType !== "slow-2g";
}

const yt = (func, args = []) => JSON.stringify({event: "command", func, args});
const vimeo = (method, value) => JSON.stringify(value === undefined ? {method} : {method, value});

// Sent after the iframe loads so the player starts posting events to us.
export function listenCommands(provider) {
  return provider === "Vimeo"
    ? [vimeo("addEventListener", "ready"), vimeo("addEventListener", "play")]
    : [JSON.stringify({event: "listening", id: "warm"})];
}

// While hidden the player plays muted just long enough to buffer, so the stream is ready at click time.
export function prebufferCommands(provider) {
  return provider === "Vimeo" ? [vimeo("setMuted", true), vimeo("play")] : [yt("mute"), yt("playVideo")];
}

// Sent once the muted prebuffer playback has started: stop and rewind to the beginning.
export function settleCommands(provider) {
  return provider === "Vimeo" ? [vimeo("pause"), vimeo("setCurrentTime", 0)] : [yt("pauseVideo"), yt("seekTo", [0, true])];
}

// Sent synchronously in the click handler.
export function revealCommands(provider) {
  return provider === "Vimeo" ? [vimeo("setMuted", false), vimeo("play")] : [yt("unMute"), yt("playVideo")];
}

function parsePayload(provider, origin, data) {
  if (!PLAYER_HOSTS[provider] || origin !== PLAYER_HOSTS[provider]) return null;
  let payload = data;
  if (typeof data === "string") {
    try {
      payload = JSON.parse(data);
    } catch {
      return null;
    }
  }
  return payload && typeof payload === "object" ? payload : null;
}

export function isPlayingMessage(provider, origin, data) {
  const payload = parsePayload(provider, origin, data);
  if (!payload) return false;
  return provider === "Vimeo" ? payload.event === "play" : payload.event === "infoDelivery" && payload.info?.playerState === 1;
}

export function isReadyMessage(provider, origin, data) {
  const payload = parsePayload(provider, origin, data);
  return Boolean(payload && READY_EVENTS[provider].includes(payload.event));
}
