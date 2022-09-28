export default function replaceDomContent(element, node) {
  if (node === undefined) return;
  while (element.lastChild && element.lastChild !== node)
    element.removeChild(element.lastChild);
  if (node && element.lastChild !== node) element.appendChild(node);
}