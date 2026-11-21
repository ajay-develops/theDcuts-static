import test from "node:test";
import assert from "node:assert/strict";
import {getVideoEmbed} from "./video.js";

const params = (url) => new URL(url).searchParams;

test("youtube warm url has enablejsapi, playsinline, no autoplay", () => {
  const v = getVideoEmbed("https://www.youtube.com/watch?v=abc123");
  const p = params(v.warmEmbedUrl);
  assert.equal(new URL(v.warmEmbedUrl).origin, "https://www.youtube-nocookie.com");
  assert.equal(p.get("enablejsapi"), "1");
  assert.equal(p.get("playsinline"), "1");
  assert.equal(p.has("autoplay"), false);
});
test("youtube shorts url gets a warm url", () => {
  const v = getVideoEmbed("https://youtube.com/shorts/xyz789");
  assert.ok(v.warmEmbedUrl.includes("/embed/xyz789"));
});
test("vimeo warm url has api enabled, playsinline, no autoplay", () => {
  const v = getVideoEmbed("https://vimeo.com/930753990");
  const p = params(v.warmEmbedUrl);
  assert.equal(new URL(v.warmEmbedUrl).origin, "https://player.vimeo.com");
  assert.equal(p.get("api"), "1");
  assert.ok(p.get("player_id"));
  assert.equal(p.get("playsinline"), "1");
  assert.equal(p.has("autoplay"), false);
});
test("vimeo fallback id gets a warm url", () => {
  const v = getVideoEmbed(undefined, "12345");
  assert.ok(v.warmEmbedUrl.includes("/video/12345"));
});
test("no video yields null warmEmbedUrl", () => {
  assert.equal(getVideoEmbed(undefined, undefined).warmEmbedUrl, null);
});
test("embedUrl is unchanged and keeps autoplay=1", () => {
  assert.equal(params(getVideoEmbed("https://youtu.be/abc123").embedUrl).get("autoplay"), "1");
  assert.equal(params(getVideoEmbed("https://vimeo.com/1").embedUrl).get("autoplay"), "1");
});
