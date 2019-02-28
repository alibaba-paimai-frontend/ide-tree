import { generateUUIDv4 } from '@bitjourney/uuid-v4';


export function uuid(len = 5) {
  return generateUUIDv4().slice(0, len); // id 截断处理
}


/**
 * convert string map to object
 *
 * @export
 * @param {Map<string, any>} strMap
 * @returns
 */
export function strMapToObj(strMap: Map<string, any>) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    // We don’t escape the key '__proto__'
    // which can cause problems on older engines
    obj[k] = v;
  }
  return obj;
}

export function sortNumberDesc(a: any, b: any) {
  return parseFloat(b) - parseFloat(a);
}


// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
export function escapeRegex(s: string) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};