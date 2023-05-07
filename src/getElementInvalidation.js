import trackDomNode from "./trackDomNode.js";
export default function getElementInvalidation(
  view,
  getContainer,
) {
  // See https://github.com/observablehq/inputs/blob/main/src/disposal.js
  return view.invalidation = view.invalidation ||
    new Promise((resolve) =>
      trackDomNode(view, {
        onRemove: () => resolve(),
        getContainer,
      })
    );
}
