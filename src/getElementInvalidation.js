export default function getElementInvalidation(
  view,
  getRoot = (element) =>
    element ? (element.closest(".observablehq") || element.ownerDocument.body) : null
) {
  return (view.invalidation = view.invalidation || disposal(view));

  // See https://github.com/observablehq/inputs/blob/main/src/disposal.js
  function disposal(element) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const target = getRoot(element);
        if (!target) return resolve();
        const observer = new MutationObserver(() => {
          if (target.contains(element)) return;
          observer.disconnect(), resolve();
        });
        observer.observe(target, { subtree: true, childList: true });
      });
    });
  }
}

