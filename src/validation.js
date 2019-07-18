/* @flow */

export type ValidationError = {
  error: string,
  field: string,
};

export type Validator<S> = (s: S) => Array<ValidationError>;

export function rules<S>(vs: Array<Validator<S>>): Validator<S> {
  return s => [].concat.apply([], vs.map(i => i(s)));
}

export function nestedRule<S>(k: string, v: Validator<S>): Validator<S> {
  return s => typeof s === "object" && s ?
    v(s[k]).map(({ error, field }) => ({ error, field: k + "." + field })) :
    [];
}

export function conditional<S>(c: (s: S) => boolean, v: Validator<S>): Validator<S> {
  return s => c(s) ? v(s) : [];
}

export const ADDRESS = /^[\D][\D\d]*$/;
export const TEXT = /^[^\d]+$/;
export const POSTAL_CODE = /^\d{3}\s?\d{2}$/;
export const EMAIL = /\S+@\S+\.\S+/;
export const PHONE = /^(?=.*[0-9]{2,})[-\s+()0-9]+$/;

export function numeric(x: mixed) {
  return !isNaN(parseFloat(x)) && isFinite(x);
}

export function required(f: string): Validator<*> {
  return s => typeof s === "object" && s[f] ? [] : [{ error: "REQUIRED", field: f }];
}

export function lengthGt(f: string, l: number): Validator<*> {
  return s => s[f] && s[f].length > l ? [] : [{ error: "LENGTH_GT", field: f, lengthGt: l }];
}

export function lengthLt(f: string, l: number): Validator<*> {
  return s => s[f] && s[f].length < l ? [] : [{ error: "LENGTH_LT", field: f, lengthLt: l }];
}

export function truthy(f: string): Validator<*> {
  return s => s[f] ? [] : [{ error: "TRUTHY", field: f }];
}

export function match(f1: string, f2: string): Validator<*> {
  return s => s[f1] === s[f2] ? [] : [{ error: "MATCH", field: f2, match: f2 }];
}

export function isAddress(f: string): Validator<*> {
  return s => typeof s === "object" && s[f] && ADDRESS.test(s[f]) ? [] : [{ error: "ADDRESS", field: f }];
}

export function isPhone(f: string): Validator<*> {
  return s => PHONE.test(s[f]) ? [] : [{ error: "PHONE", field: f }];
}

export function isPostalCode(f: string): Validator<*> {
  return s => {
    const value = parseInt(s[f].replace(/\s/g, ""), 10);
    return (POSTAL_CODE.test(s[f]) && value !== NaN && value > 10000) ? [] : [{ error: "POSTCODE", field: f }];
  };
}

export function isText(f: string): Validator<*> {
  return s => TEXT.test(s[f]) ? [] : [{ error: "TEXT", field: f }];
}

export function isEmail(f: string): Validator<*> {
  return s => EMAIL.test(s[f]) ? [] : [{ error: "EMAIL", field: f }];
}

export function isNumeric(f: string): Validator<*> {
  return s => numeric(s[f]) ? [] : [{ error: "NUMERIC", field: f }];
}

