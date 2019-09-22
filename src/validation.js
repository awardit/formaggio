/* @flow */

import type { FormData } from "./types";

export type ValidationError = {
  error: string,
  field: string,
};

export type Validator<T> = (t: T) => Array<ValidationError>;

export const rules = <T>(vs: Array<Validator<T>>): Validator<T> =>
  (t: T): Array<ValidationError> =>
    [].concat(...vs.map((i: Validator<T>): Array<ValidationError> => i(t)));

export const nestedRule = <T>(k: string, v: Validator<T>): Validator<T> =>
  (t: T): Array<ValidationError> => typeof t === "object" && t ?
    v(t[k]).map(
      ({ error, field }: ValidationError): ValidationError =>
        ({ error, field: k + "." + field })
    ) : [];

export const conditional = <T>(c: (t: T) => boolean, v: Validator<T>): Validator<T> =>
  (t: T): Array<ValidationError> => c(t) ? v(t) : [];

export const POSTAL_CODE = /^\d{3}\s?\d{2}$/;
/* eslint-disable max-len */
export const EMAIL = /^[!#$%&'*+/=?^_`{|}~\-a-z0-9]+(?:\.[!#$%&'*+/=?^_`{|}~\-a-z0-9]+)*@(?:[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])*$/i;
/* eslint-enable max-len */
export const PHONE = /^(?=.*\d{2,})[-\s+()0-9]+$/;

export const isRequired = (f: string): Validator<FormData> =>
  (t: FormData): Array<ValidationError> =>
    typeof t === "object" && t && (t[f] || t[f] === 0) ? [] : [{ error: "REQUIRED", field: f }];

export const lengthGt = (f: string, l: number): Validator<FormData> =>
  (t: FormData): Array<ValidationError> =>
    typeof t[f] === "string" && t[f].length > l ?
      [] :
      [{ error: "LENGTH_GT", field: f, lengthGt: l }];

export const lengthLt = (f: string, l: number): Validator<FormData> =>
  (t: FormData): Array<ValidationError> =>
    typeof t[f] === "string" && t[f].length < l ?
      [] :
      [{ error: "LENGTH_LT", field: f, lengthLt: l }];

export const isTruthy = (f: string): Validator<FormData> =>
  (t: FormData): Array<ValidationError> =>
    t[f] ? [] : [{ error: "TRUTHY", field: f }];

export const match = (f1: string, f2: string): Validator<FormData> =>
  (t: FormData): Array<ValidationError> =>
    t[f1] === t[f2] ? [] : [{ error: "MATCH", field: f2, match: f2 }];

export const isPhone = (f: string): Validator<FormData> =>
  (t: FormData): Array<ValidationError> =>
    typeof t[f] === "string" && PHONE.test(t[f]) ? [] : [{ error: "PHONE", field: f }];

export const isPostalCode = (f: string): Validator<FormData> =>
  (t: FormData): Array<ValidationError> => {
    const value = parseInt(String(t[f]).replace(/\s/g, ""), 10);

    return (POSTAL_CODE.test(String(t[f])) && !isNaN(value) && value > 10000) ?
      [] :
      [{ error: "POSTCODE", field: f }];
  };

export const isEmail = (f: string): Validator<FormData> =>
  (t: FormData): Array<ValidationError> =>
    typeof t[f] === "string" && EMAIL.test(t[f]) ? [] : [{ error: "EMAIL", field: f }];

const numeric = (x: mixed): boolean =>
  !isNaN((x: any) - parseFloat(x));

export const isNumeric = (f: string): Validator<FormData> =>
  (t: FormData): Array<ValidationError> => numeric(t[f]) ?
    [] :
    [{ error: "NUMERIC", field: f }];
