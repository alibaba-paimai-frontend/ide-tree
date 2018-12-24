import { generateUUIDv4 } from '@bitjourney/uuid-v4';

export function uuid(len = 5) {
    return generateUUIDv4().slice(0, len); // id 截断处理
}

export function invariant(check: boolean, message: string, thing?: string) {
  if (!check) {
    throw new Error(
      '[ide-view] Invariant failed: ' +
        message +
        (thing ? " in '" + thing + "'" : '')
    );
  }
}

export function isExist(val: any): boolean {
  return typeof val !== 'undefined' && val !== null;
}

// from mobx
export function uniq(arr: any[]) {
  var res: any[] = [];
  arr.forEach(function(item) {
    if (res.indexOf(item) === -1) res.push(item);
  });
  return res;
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
  return parseFloat(b) - parseFloat(a)
}

export function pick(object: any, paths: string[]) {
  const obj: any = {};
  for (const path of paths) {
    if (object[path]) {
      obj[path] = object[path]
    }
  }
  return obj;
} 