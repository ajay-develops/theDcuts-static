import test from "node:test";
import assert from "node:assert/strict";
import {getOrientation, RATIOS} from "./orientation.mjs";

test("portrait when height > width", () => {
  assert.equal(getOrientation({width: 1080, height: 1920}), "portrait");
});
test("landscape when width > height", () => {
  assert.equal(getOrientation({width: 1920, height: 1080}), "landscape");
});
test("square is landscape", () => {
  assert.equal(getOrientation({width: 1000, height: 1000}), "landscape");
});
test("dimensions win over shorts url", () => {
  assert.equal(getOrientation({width: 1920, height: 1080}, "https://youtube.com/shorts/abc123"), "landscape");
  assert.equal(getOrientation({width: 1080, height: 1920}, "https://youtu.be/abc123"), "portrait");
});
test("shorts url is portrait when dimensions missing", () => {
  assert.equal(getOrientation(undefined, "https://www.youtube.com/shorts/abc123"), "portrait");
  assert.equal(getOrientation(null, "https://youtube.com/shorts/abc123"), "portrait");
  assert.equal(getOrientation({}, "https://m.youtube.com/shorts/abc123"), "portrait");
});
test("only youtube /shorts/ paths count", () => {
  assert.equal(getOrientation(undefined, "https://youtu.be/abc123"), "landscape");
  assert.equal(getOrientation(undefined, "https://www.youtube.com/watch?v=abc123"), "landscape");
  assert.equal(getOrientation(undefined, "https://vimeo.com/shorts/123"), "landscape");
});
test("landscape when nothing is known", () => {
  assert.equal(getOrientation(undefined, undefined), "landscape");
});
test("malformed url does not throw", () => {
  assert.equal(getOrientation(undefined, "not a url"), "landscape");
});
test("ratios", () => {
  assert.deepEqual(RATIOS, {landscape: 1.6, portrait: 0.5625});
});
