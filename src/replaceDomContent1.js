export default function replaceDomContent1(element, ...nodes) {
  nodes = nodes.filter((n) => n !== undefined);
  if (!nodes.length) return;
  let first;
  for (let node of nodes) {
    if (!first) first = node;
    node && element.appendChild(node);
  }
  for (let elm = element.firstChild; elm && elm !== first; ) {
    const n = elm;
    elm = elm.nextSibling;
    element.removeChild(n);
  }
}