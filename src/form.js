/* @flow */

import type { Context, ElementProps, Node } from "react";
import type { ValidationError } from "./validation";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { get, set } from "diskho";

import type { FormDataValue, FormData } from "./types";

export type UpdateFn = (name: string, value: FormDataValue) => void;

export type FormContextData = {
  data: FormData,
  errors: Array<ValidationError>,
  idPrefix: string,
  update: UpdateFn
};

export type FormProps = ElementProps<"form"> & {
  errors?: Array<ValidationError>,
  name?: string,
  onChange: (data: FormData) => mixed,
  onError: (e: Event, errors: Array<ValidationError>, data: FormData) => mixed,
  onSubmit: (e: Event, data: FormData) => mixed,
  value: FormData,
};

export type FormFieldData = {
  id: string,
  dirty: boolean,
  errors: Array<ValidationError>,
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
export function useFormField(name: string, def?: mixed): FormFieldData {
  const formData = useContext(FormContext);

  if (!formData) {
    throw new Error("useFormField() can only be used inside a <Form />.");
  }

  const { data, errors: formErrors, idPrefix, update } = formData;
  const value = get(data, name, def);
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
    id,
    dirty,
    errors,
    name,
    onChange,
    value,
  };
}

function createFormContextData(
  name: string,
  errors: Array<ValidationError>,
  onChange: (data: FormData) => mixed,
  value: FormData
): FormContextData {
  return {
    data: value,
    errors: errors || [],
    idPrefix: name,
    update: (name: string, newItemValue: FormDataValue): void => {
      const newValue = set(value, name, newItemValue);

      if (newValue !== value) {
        onChange(newValue);
      }
    },
  };
}

export function Form(props: FormProps): Node {
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

  // Only change the form context when the data/errors change
  const [state, setState] = useState(
    (): FormContextData => createFormContextData(name, errors, onChange, value)
  );

  // Make sure to update the nested data when things change
  useEffect(
    (): void => setState(createFormContextData(name, errors, onChange, value)),
    [name, errors, onChange, value]
  );

  const handleSubmit = useCallback((e: Event): ?boolean => {
    if (errors && errors.length > 0) {
      e.preventDefault();
      e.stopPropagation();

      onError(e, errors, value);

      return false;
    }

    onSubmit(e, value);
  }, [errors, onError, onSubmit, value]);

  return (
    <form
      {...formProps}
      noValidate
      onSubmit={handleSubmit}
    >
      <FormContext.Provider value={state}>
        {children}
      </FormContext.Provider>
    </form>
  );
}
