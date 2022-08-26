import getElementInvalidation from "./getElementInvalidation.js";

// This utility function allows to update HTML elements when the specified iterator yields a new value.
// It also allows to easily initialize the element and cleanup associated resources when this element is detached from DOM.
export default function bindView(
  iterator,
  action,
  { handleError = console.error, getRoot } = {}
) {
  let element;
  const f = {};
  f.init = newMethod(f);
  f.update = newMethod(f);
  f.done = newMethod(f, true);
  Object.defineProperty(f, "element", {
    get: () => element,
    set: (elm) => {
      element = (typeof elm === "function" ? elm() : elm) || element;
      if (!element) element = "div";
      if (typeof element === "string")
        element = document.createElement(element);
    }
  });
  let interrupt = false;
  f.init(() => {
    (async () => {
      let prev;
      for await (let value of iterator) {
        if (interrupt) break;
        f.update.run(element, value, prev);
        prev = value;
        if (interrupt) break;
      }
    })();
  });
  f.done(() => ((interrupt = true), iterator.return && iterator.return()));

  f.element = action(f) || element;

  f.init.run(element);
  const invalidation = getElementInvalidation(element, getRoot);
  invalidation.then(() => f.done.run(element));

  return element;

  function newMethod(f, reverse = false) {
    const list = [];
    return Object.assign((m) => (list.push(m), f), {
      run: (...args) => {
        for (let action of reverse ? list.reverse() : list) {
          try {
            action(...args);
          } catch (error) {
            handleError(error);
          }
        }
      }
    });
  }
}