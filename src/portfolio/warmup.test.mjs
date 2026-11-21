import test from "node:test";
import assert from "node:assert/strict";
import {canWarm, listenCommands, prebufferCommands, settleCommands, revealCommands, isReadyMessage, isPlayingMessage, isEndedMessage, restartCommands, PLAYER_HOSTS} from "./warmup.mjs";

test("canWarm blocks saveData", () => {
  assert.equal(canWarm({saveData: true, effectiveType: "4g"}), false);
});
test("canWarm blocks 2g and slow-2g", () => {
  assert.equal(canWarm({effectiveType: "2g"}), false);
  assert.equal(canWarm({effectiveType: "slow-2g"}), false);
});
test("canWarm allows 4g and unknown connection", () => {
  assert.equal(canWarm({effectiveType: "4g"}), true);
  assert.equal(canWarm({}), true);
  assert.equal(canWarm(undefined), true);
});
const parse = (list) => list.map((c) => JSON.parse(c));

test("youtube commands are valid JSON with the player API's fields", () => {
  assert.deepEqual(parse(listenCommands("YouTube")), [{event: "listening", id: "warm"}]);
  assert.deepEqual(parse(prebufferCommands("YouTube")), [
    {event: "command", func: "mute", args: []},
    {event: "command", func: "playVideo", args: []},
  ]);
  assert.deepEqual(parse(settleCommands("YouTube")), [
    {event: "command", func: "pauseVideo", args: []},
    {event: "command", func: "seekTo", args: [0, true]},
  ]);
  assert.deepEqual(parse(revealCommands("YouTube")), [
    {event: "command", func: "unMute", args: []},
    {event: "command", func: "playVideo", args: []},
  ]);
});
test("vimeo commands are valid JSON with the player API's fields", () => {
  assert.deepEqual(parse(listenCommands("Vimeo")), [
    {method: "addEventListener", value: "ready"},
    {method: "addEventListener", value: "play"},
    {method: "addEventListener", value: "ended"},
  ]);
  assert.deepEqual(parse(prebufferCommands("Vimeo")), [{method: "setMuted", value: true}, {method: "play"}]);
  assert.deepEqual(parse(settleCommands("Vimeo")), [{method: "pause"}, {method: "setCurrentTime", value: 0}]);
  assert.deepEqual(parse(revealCommands("Vimeo")), [{method: "setMuted", value: false}, {method: "play"}]);
});
test("isPlayingMessage detects playback from the provider's own origin only", () => {
  assert.equal(isPlayingMessage("YouTube", PLAYER_HOSTS.YouTube, JSON.stringify({event: "infoDelivery", info: {playerState: 1}})), true);
  assert.equal(isPlayingMessage("YouTube", PLAYER_HOSTS.YouTube, {event: "infoDelivery", info: {playerState: 3}}), false);
  assert.equal(isPlayingMessage("YouTube", PLAYER_HOSTS.YouTube, {event: "infoDelivery", info: {}}), false);
  assert.equal(isPlayingMessage("Vimeo", PLAYER_HOSTS.Vimeo, JSON.stringify({event: "play"})), true);
  assert.equal(isPlayingMessage("Vimeo", PLAYER_HOSTS.Vimeo, {event: "pause"}), false);
  assert.equal(isPlayingMessage("YouTube", "https://evil.example", {event: "infoDelivery", info: {playerState: 1}}), false);
  assert.equal(isPlayingMessage("Vimeo", PLAYER_HOSTS.YouTube, {event: "play"}), false);
  for (const bad of ["nope", null, undefined, 7, {}]) assert.equal(isPlayingMessage("YouTube", PLAYER_HOSTS.YouTube, bad), false);
});
test("isReadyMessage accepts the provider's ready event from its own origin", () => {
  assert.equal(isReadyMessage("YouTube", PLAYER_HOSTS.YouTube, JSON.stringify({event: "onReady"})), true);
  assert.equal(isReadyMessage("Vimeo", PLAYER_HOSTS.Vimeo, JSON.stringify({event: "ready", player_id: "warm"})), true);
});
test("youtube initialDelivery alone is not ready (only onReady is)", () => {
  assert.equal(isReadyMessage("YouTube", PLAYER_HOSTS.YouTube, {event: "initialDelivery", info: {}}), false);
});
test("isReadyMessage rejects wrong origin", () => {
  assert.equal(isReadyMessage("YouTube", "https://evil.example", {event: "onReady"}), false);
  assert.equal(isReadyMessage("YouTube", PLAYER_HOSTS.Vimeo, {event: "onReady"}), false);
  assert.equal(isReadyMessage("Vimeo", PLAYER_HOSTS.YouTube, {event: "ready"}), false);
});
test("isReadyMessage rejects malformed or non-ready data", () => {
  for (const data of ["not json", null, undefined, {}, 42, JSON.stringify({event: "infoDelivery"}), JSON.stringify({event: "play"})]) {
    assert.equal(isReadyMessage("YouTube", PLAYER_HOSTS.YouTube, data), false);
    assert.equal(isReadyMessage("Vimeo", PLAYER_HOSTS.Vimeo, data), false);
  }
});

test("restartCommands seek to the start and play", () => {
  assert.deepEqual(parse(restartCommands("YouTube")), [
    {event: "command", func: "seekTo", args: [0, true]},
    {event: "command", func: "playVideo", args: []},
  ]);
  assert.deepEqual(parse(restartCommands("Vimeo")), [{method: "setCurrentTime", value: 0}, {method: "play"}]);
});

test("isEndedMessage detects the end of playback from the provider's own origin only", () => {
  const yt = JSON.stringify({event: "infoDelivery", info: {playerState: 0}});
  assert.equal(isEndedMessage("YouTube", PLAYER_HOSTS.YouTube, yt), true);
  assert.equal(isEndedMessage("YouTube", "https://evil.example", yt), false);
  assert.equal(isEndedMessage("YouTube", PLAYER_HOSTS.YouTube, JSON.stringify({event: "infoDelivery", info: {playerState: 1}})), false);
  assert.equal(isEndedMessage("Vimeo", PLAYER_HOSTS.Vimeo, JSON.stringify({event: "ended"})), true);
  assert.equal(isEndedMessage("Vimeo", PLAYER_HOSTS.Vimeo, JSON.stringify({event: "play"})), false);
});
