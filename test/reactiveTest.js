import { default as expect } from 'expect.js';
import { newReactiveNodeTemplate } from '../src/reactive.js';
import { JSDOM } from 'jsdom';

describe("iterate#newReactiveNodeTemplate", () => {

  beforeEach((done) => {
    try {
      const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);
      globalThis.document = dom.window.document;
      // globalThis.Text = dom.window.Text;
    } finally {
      done();
    }
  });

  it(`should dynamically replace DOM nodes with values returned by async iterators`, async () => {
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
    document.body.appendChild(document.createTextNode(before));
    document.body.appendChild(placeholder);
    document.body.appendChild(document.createTextNode(after));
    start();
    await promise;
    stop();
    expect(document.querySelector("body").textContent).to.eql(before + list[list.length - 1] + after);
  })


  it(`should be able to interrupt iterations`, async () => {
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
    document.body.appendChild(document.createTextNode(before));
    document.body.appendChild(placeholder);
    document.body.appendChild(document.createTextNode(after));
    start();

    await notification;
    stop();

    await promise;
    expect(document.querySelector("body").textContent).to.eql(before + lastLetter + after);
  })


  it(`errors should stop iterations without rendering updates`, async () => {
    const newReactiveNode = newReactiveNodeTemplate();

    const before = "before[";
    const after = "]after";

    const list = ["A", "B", "C", "D", "E", "F"]
    const lastLetter = "C"
    let resolve, promise = new Promise((y) => (resolve = y));
    const contents = [];
    async function* newIterator() {
      try {
        for (let value of list) {
          if (value === lastLetter) throw new Error('STOP');
          yield value;
          contents.push(document.querySelector("body").textContent);
          await new Promise(s => setTimeout(s, 1));
        }
      } finally {
        resolve();
      }
    }
    const it = newIterator();
    const [placeholder, start, stop] = newReactiveNode(it);
    document.body.appendChild(document.createTextNode(before));
    document.body.appendChild(placeholder);
    document.body.appendChild(document.createTextNode(after));
    start();

    await new Promise(r => setTimeout(r, 10));
    stop();

    await promise;
    expect(contents).to.eql([
      before + 'A' + after,
      before + 'B' + after,
    ])
    expect(document.querySelector("body").textContent).to.eql(before + 'B' + after);
  })


  it(`should be able to handle errors and render their visualization`, async () => {
    let element = document.querySelector('body');
    let errorHandled = false;
    const newReactiveNode = newReactiveNodeTemplate({
      handleError : (error) => {
        errorHandled = true;
        return error.message;
      }
    });

    const before = "before[";
    const after = "]after";

    const list = ["A", "B", "C", "D", "E", "F"]
    const lastLetter = "C"
    let resolve, promise = new Promise((y) => (resolve = y));
    const contents = [];
    async function* newIterator() {
      try {
        for (let value of list) {
          if (value === lastLetter) throw new Error('STOP');
          yield value;
          contents.push(document.querySelector("body").textContent);
          await new Promise(s => setTimeout(s, 1));
        }
      } finally {
        resolve();
      }
    }
    const it = newIterator();
    const [placeholder, start, stop] = newReactiveNode(it);
    document.body.appendChild(document.createTextNode(before));
    document.body.appendChild(placeholder);
    document.body.appendChild(document.createTextNode(after));
    start();

    expect(errorHandled).to.be(false);
    await new Promise(r => setTimeout(r, 10));
    stop();

    await promise;
    expect(errorHandled).to.be(true);
    expect(contents).to.eql([
      before + 'A' + after,
      before + 'B' + after,
    ])
    expect(document.querySelector("body").textContent).to.eql(before + 'STOP' + after);
  })


})
