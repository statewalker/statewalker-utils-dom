import { default as expect } from 'expect.js';
import { newReactiveNodeTemplate } from '../src/reactive.js';
import { JSDOM } from 'jsdom';

describe("iterate", () => {

  beforeEach((done) => {
    try {
      const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);
      globalThis.document = dom.window.document;
      globalThis.Text = dom.window.Text;
    } finally {
      done();
    }
  });

  it(`newReactiveNodeTemplate - should dynamically replace DOM nodes with values returned by async iterators`, async () => {
    let element = document.querySelector('body');
    const newReactiveNode = newReactiveNodeTemplate();

    const before = "before[";
    const after = "]after";

    const list = ["A", "B", "C", "D", "E", "F"]
    let resolve, reject, promise = new Promise((y, n) => (resolve = y, reject = n));
    async function* newIterator() {
      try {
        for (let value of list) {
          yield value;
          await new Promise(s => setTimeout(s, 1));
          expect(document.querySelector("body").textContent).to.eql(before + value + after);
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    }
    const it = newIterator();
    const [placeholder, start, stop] = newReactiveNode(it);
    document.body.appendChild(new Text(before));
    document.body.appendChild(placeholder);
    document.body.appendChild(new Text(after));
    start();
    await promise;
    stop();
    expect(document.querySelector("body").textContent).to.eql(before + list[list.length - 1] + after);
  })


  it(`newReactiveNodeTemplate - should be able to interrupt iterations`, async () => {
    let element = document.querySelector('body');
    const newReactiveNode = newReactiveNodeTemplate();

    const before = "before[";
    const after = "]after";

    const list = ["A", "B", "C", "D", "E", "F"]
    const lastLetter = "C"
    let resolve, reject, promise = new Promise((y, n) => (resolve = y, reject = n));
    let notify, notification = new Promise((y, n) => (notify = y));
    async function* newIterator() {
      try {
        for (let value of list) {
          yield value;
          expect(document.querySelector("body").textContent).to.eql(before + value + after);
          if (value === lastLetter) notify();
          await new Promise(s => setTimeout(s, 1));
        }
      } catch (err) {
        reject(err);
      } finally {
        resolve();
      }
    }
    const it = newIterator();
    const [placeholder, start, stop] = newReactiveNode(it);
    document.body.appendChild(new Text(before));
    document.body.appendChild(placeholder);
    document.body.appendChild(new Text(after));
    start();

    await notification;
    stop();

    await promise;
    expect(document.querySelector("body").textContent).to.eql(before + lastLetter + after);
  })


})
