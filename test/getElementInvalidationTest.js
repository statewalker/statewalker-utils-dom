import { default as expect } from "expect.js";
import getElementInvalidation from "../src/getElementInvalidation.js";
import { JSDOM } from "jsdom";

describe("getElementInvalidation", () => {
  beforeEach((done) => {
    try {
      const dom = new JSDOM(
        `<!DOCTYPE html><html><head></head><body></body></html>`,
      );
      globalThis.document = dom.window.document;
      globalThis.requestAnimationFrame = function requestAnimationFrame(f) {
        setImmediate(() => f(Date.now()));
      };
      globalThis.MutationObserver = dom.window.MutationObserver;
    } finally {
      done();
    }
  });

  it(`should return a single promise associated with a DOM node`, async () => {
    const div = document.createElement("div");

    // The promise associated with the node lifecycle
    const p = getElementInvalidation(div);
    expect(!!p).to.be(true);

    // Check that the second call returns the same promise
    const p1 = getElementInvalidation(div);
    expect(p1).to.be(p1);
  });

  it(`should resolve the returned promise when the node is removed from DOM`, async () => {
    let body = document.querySelector("body");
    const div = document.createElement("div");
    body.appendChild(div);
    let removed = false;

    // The promise associated with the node lifecycle
    const p = getElementInvalidation(div);
    expect(!!p).to.be(true);
    p.then(() => removed = true);

    // Node is attached to DOM - so the promise is not resolved
    await new Promise((r) => setTimeout(r, 10));
    expect(removed).to.be(false);

    // Node is still attached to DOM
    await new Promise((r) => setTimeout(r, 10));
    expect(removed).to.be(false);

    body.removeChild(div);

    // Node is still attached to DOM
    await new Promise((r) => setTimeout(r, 10));
    expect(removed).to.be(true);
  });

  it(`should resolve the returned promise even if the node is never attached to the DOM`, async () => {
    const div = document.createElement("div");

    // The promise associated with the node lifecycle
    const p = getElementInvalidation(div);
    expect(!!p).to.be(true);

    let removed = false;
    p.then(() => removed = true);

    expect(removed).to.be(false);
    await new Promise((r) => setTimeout(r, 10));
    expect(removed).to.be(true);
  });
});
