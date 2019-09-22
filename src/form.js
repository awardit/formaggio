/* @flow */

import type { Context, ElementProps, Node } from "react";
import type { ValidationError } from "./validation";
import type { FormDataValue, FormData } from "./types";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  errorsEqual,
  get,
  set,
} from "./util";

export type UpdateFn = (name: string, value: FormDataValue) => void;

export type FormContextData = {
  data: FormData,
  errors: Array<ValidationError>,
  idPrefix: string,
  update: UpdateFn,
  submitted: boolean
};

export type FormProps = ElementProps<"form"> & {
  errors?: Array<ValidationError>,
  name?: string,
  onChange: (data: FormData) => mixed,
  onError?: (e: Event, errors: Array<ValidationError>, data: FormData) => mixed,
  onSubmit: (e: Event, data: FormData) => mixed,
  value: FormData,
};

export type FormFieldData = {
  dirty: boolean,
  submitted: boolean,
  errors: Array<ValidationError>,
  inputProps: InputProps,
};

/**
 * Properties compatible with an <input /> element.
 */
export type InputProps = {
  id: string,
  name: string,
  onChange: (e: SyntheticInputEvent<HTMLInputElement>) => void,
  value: FormDataValue,
};

export const FormContext: Context<?FormContextData> = createContext();

/**
 * Fetches data, metadata, and callback, for a form field.
 *
 * NOTE: The first value encountered when rendering will be considered its
 *       original value, the component instance has to be re-rendered with
 *       a new key to consider it being a new non-dirty instance.
 */
export const useFormField = (name: string, def: FormDataValue = ""): FormFieldData => {
  const formData = useContext(FormContext);

  if (!formData) {
    throw new Error("useFormField() can only be used inside a <Form />.");
  }

  const { data, errors: formErrors, idPrefix, update, submitted } = formData;
  const value = String(get(data, name, def) ?? "");
  // Save the first render value in a ref so we can keep comparing it
  const original = useRef(value);
  const dirty = value !== original.current;
  const errors = formErrors.filter(({ field }: ValidationError): boolean => field === name);
  const id = idPrefix ? idPrefix + "." + name : name;
  const onChange = useCallback(
    ({ target }: SyntheticInputEvent<HTMLInputElement>): void =>
      update(name, target.type === "checkbox" ? target.checked : target.value),
    [name, update]
  );

  return {
    dirty,
    errors,
    submitted,
    inputProps: {
      id,
      name,
      onChange,
      value,
    },
  };
};

export const Form = (props: FormProps): Node => {
  const {
    children,
    errors,
    name,
    onChange,
    onError,
    onSubmit,
    value,
    ...formProps
  } = props;

  // If we have tried to submit the form
  const [submitted, setSubmitted] = useState(false);
  const prevErrors = useRef(errors);

  // Update errors if they are not equal
  if (!errorsEqual(prevErrors.current, errors)) {
    prevErrors.current = errors;
  }

  const stateErrors = prevErrors.current;

  // Only change the form context when the data/errors change
  const state = useMemo(
    (): FormContextData => ({
      data: value,
      errors: stateErrors || [],
      idPrefix: name,
      update: (name: string, newItemValue: FormDataValue): void => {
        const newValue = set(value, name, newItemValue);

        if (newValue !== value) {
          onChange(newValue);
        }
      },
      submitted,
    }),
    [name, stateErrors, onChange, value, submitted]
  );

  const handleSubmit = useCallback((e: Event): ?boolean => {
    setSubmitted(true);

    if (errors && errors.length > 0) {
      e.preventDefault();
      e.stopPropagation();

      if (onError) {
        onError(e, errors, value);
      }

      return false;
    }

    onSubmit(e, value);
  }, [errors, onError, onSubmit, value]);

  return (
    <form
      {...formProps}
      onSubmit={handleSubmit}
    >
      <FormContext.Provider value={state}>
        {children}
      </FormContext.Provider>
    </form>
  );
};
