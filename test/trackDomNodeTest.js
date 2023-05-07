import { default as expect } from "expect.js";
import trackDomNode from "../src/trackDomNode.js";
import { JSDOM } from "jsdom";

describe("trackDomNode", () => {
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

  it(`should be able to track attachement/removal of a node`, async () => {
    let element = document.querySelector("body");
    let added = false, removed = false;
    const text = trackDomNode(document.createTextNode("Hello"), {
      onAdd: (n) => {
        added = true;
      },
      onRemove: (n) => {
        removed = true;
      },
    });
    element.appendChild(text);

    expect(added).to.be(false);
    expect(removed).to.be(false);

    await new Promise((r) => setTimeout(r, 1));

    expect(added).to.be(true);
    expect(removed).to.be(false);

    text.parentElement.removeChild(text);
    await new Promise((r) => setTimeout(r, 1));

    expect(added).to.be(true);
    expect(removed).to.be(true);
  });
});
