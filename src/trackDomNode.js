export default function trackDomNode(
  node,
  {
    onAdd = () => {},
    onRemove = () => {},
    isContainer = (n) => n.classList.contains("observablehq"),
    getContainer = (n) => {
      let container = n.ownerDocument.body;
      while ((n = n.parentElement)) {
        if (!isContainer(n)) continue;
        container = n;
        break;
      }
      return container;
    }
  }
) {
  requestAnimationFrame(() => {
    if (node.isConnected) {
      onAdd(node);
      const container = getContainer(node);
      if (container) {
        const observer = new MutationObserver(() => {
          if (container.contains(node)) return;
          observer.disconnect(), onRemove(node, true);
        });
        observer.observe(container, { subtree: true, childList: true });
      } else {
        onRemove(node, true);
      }
    } else {
      onRemove(node, false);
    }
  });
  return node;
}