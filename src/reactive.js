import getElementInvalidation from "./getElementInvalidation.js";
import toDomNode from "./toDomNode.js";

export function newDomTemplate(template, options = {}) {
  const newReactiveNode = newReactiveNodeTemplate(options);
  return (strings = [], ...args) => {
    const [values, start, stop] = toReactiveNodes(args, newReactiveNode);
    requestAnimationFrame(start);
    const result = template(strings, ...values);
    getElementInvalidation(result).then(stop);
    return result;
  };
}

export function toReactiveNodes(args, newReactiveNode) {
  const toStart = [];
  const toStop = [];
  args = args.reduce((list, v) => {
    let handled = false;
    if (v && typeof v === "object") {
      let toNode;
      if (typeof v.next === "function") {
        toNode = newReactiveNode;
      } else if (Array.isArray(v)) {
        toNode = (v) => toReactiveNodes(v, newReactiveNode);
      }
      if (toNode) {
        const [node, start, stop] = toNode(v);
        list.push(node);
        toStart.push(start);
        toStop.push(stop);
        handled = true;
      }
    }
    if (!handled) {
      list.push(v);
    }
    return list;
  }, []);
  const start = () => toStart.forEach((s) => s());
  const stop = () => toStop.forEach((s) => s());
  return [args, start, stop];
}

export function newReactiveNodeTemplate({
  createPlaceholder = () => document.createComment(""),
  createNode = toDomNode,
  updatePlaceholder = (placeholder, node, prev) => {
    if (prev && prev.parentElement) prev.parentElement.removeChild(prev);
    if (!placeholder.isConnected) return false;
    if (node) placeholder.parentElement.insertBefore(node, placeholder);
    return true;
  },
  // This handler can transform an iteration error to a visual representation.
  // It can re-throw the error to stop iteration process.
  handleError = (error) => {
    throw error;
  },
} = {}) {
  return (iterator) => {
    const placeholder = createPlaceholder();
    let stopped = false;
    let resolve;
    const call = (m) =>
      new Promise((r) => {
        resolve = r;
        return Promise
          .resolve()
          .then(m)
          .then((v) => v, async (error) => {
            try {
              return { value: await handleError(error) };
            } catch (e) {
              stopped = true;
              return { done: true };
            }
          })
          .then(resolve);
      });
    const stop = () => {
      stopped = true;
      iterator.return && iterator.return();
      resolve && resolve();
    };
    const start = async () => {
      let node;
      try {
        const next = iterator.next.bind(iterator);
        while (!stopped) {
          const slot = await call(next);
          if (stopped || !slot || slot.done) break;
          const value = await call(() => slot.value);
          if (stopped) break;
          const newNode = createNode(value);
          if (newNode !== node) {
            if (!updatePlaceholder(placeholder, newNode, node)) {
              break;
            }
            node = newNode;
          }
        }
      } finally {
        stop();
      }
    };
    return [placeholder, start, stop];
  };
}
