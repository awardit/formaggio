/* @flow */

import type { ValidationError } from "./validation";

const errorEqual = (a: ValidationError, b: ValidationError): boolean =>
  a.error === b.error && a.field === b.field;

export const errorsEqual = (a: ?Array<ValidationError>, b: ?Array<ValidationError>): boolean => {
  if (!a && !b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  return a.every((ai: ValidationError): boolean =>
    b.some((bi: ValidationError): boolean =>
      errorEqual(ai, bi)));
};

/**
 * Indexing operator.
 */
const _idx = (o: mixed, i: string): mixed =>
  typeof o === "object" && o != null ? o[i] : null;

/**
 * Indexes deeply into the supplied object using a dot-notation string and
 * returns the value if any.
 */
export const get = (o: mixed, k: string, def?: mixed): mixed =>
  k.split(".").reduce(_idx, o) || def;

const _set = (o: mixed, k: Array<string>, v: mixed): mixed => {
  if (k.length === 0) {
    return v;
  }

  const i = k[0];
  const m = _idx(o, i);
  const n = _set(m, k.slice(1), v);

  return n === m ? o : { ...o, [i]: n };
};

/**
 * Indexes deeply into the supplied object using a dot-notation string and sets
 * the value. If undefineds or non-objects are encountered on the way they will
 * be converted to objects. The input variable `o` will not be modified,
 * instead a new object is returned.
 */
export const set = (o: mixed, k: string, v: mixed): mixed =>
  _set(o, k.split("."), v);
