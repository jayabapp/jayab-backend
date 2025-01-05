const isJSON = require('is-json');

export default function isJson(value: unknown): boolean {
  return isJSON(value);
}
