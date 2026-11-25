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
test("instagram reel and post urls embed, with no warm player", () => {
  for (const url of [
    "https://www.instagram.com/reel/C9abc_-12/",
    "https://instagram.com/reels/C9abc_-12",
    "https://www.instagram.com/p/C9abc_-12/?igsh=xyz",
    "https://www.instagram.com/someuser/reel/C9abc_-12/",
  ]) {
    const v = getVideoEmbed(url);
    assert.equal(v.provider, "Instagram", url);
    assert.equal(v.id, "C9abc_-12", url);
    assert.equal(v.embedUrl, "https://www.instagram.com/p/C9abc_-12/embed/", url);
    assert.equal(v.warmEmbedUrl, null, url);
  }
});
test("instagram profile url is not a video", () => {
  assert.equal(getVideoEmbed("https://www.instagram.com/someuser/").provider, null);
});
