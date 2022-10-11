export default function toDomNode(value, doc = document) {
  if (value === undefined) return;
  if (value === null) value = "";
  if (typeof value === "number" || typeof value === "boolean")
    value = String(value);
  if (typeof value === "object" && !(value instanceof Node)) {
    value = Object.prototype.toString.call(value);
  }
  if (typeof value === "string") value = doc.createTextNode(value);
  return value;
}