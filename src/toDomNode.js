export default function toDomNode(value, doc = document, containerElm = "span") {
  if (value === undefined) return;
  if (value === null) value = "";
  if (typeof value === "number" || typeof value === "boolean")
    value = String(value);
  if (typeof value === "object" && !(value instanceof Node)) {
    if (value !== null && value[Symbol.iterator]) {
      const elm = doc.createElement(containerElm);
      for (let val of value) {
        elm.appendChild(toDomNode(val, doc));
      }
      value = elm;
    } else {
      value = Object.prototype.toString.call(value);
    }
  }
  if (typeof value === "string") value = doc.createTextNode(value);
  return value;
}

