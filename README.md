![Formaggio Logo](https://raw.githubusercontent.com/awardit/formaggio/master/doc/logo_primary.svg?raw=true&sanitize=true)
<p align="center">The cheesy form library 🧀</p>

[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@awardit/formaggio.svg)](https://bundlephobia.com/result?p=@awardit/formaggio)
[![Dependencies](https://img.shields.io/david/awardit/formaggio.svg)](https://www.npmjs.com/package/@awardit/formaggio)
[![Build Status](https://travis-ci.org/awardit/formaggio.svg?branch=master)](https://travis-ci.org/awardit/formaggio)
[![Codecov](https://img.shields.io/codecov/c/gh/awardit/formaggio)](https://codecov.io/gh/awardit/formaggio)
![License](https://img.shields.io/npm/l/@awardit/formaggio)
[![npm](https://img.shields.io/npm/v/@awardit/formaggio)](https://www.npmjs.com/package/@awardit/formaggio)
[![Greenkeeper badge](https://badges.greenkeeper.io/awardit/formaggio.svg)](https://greenkeeper.io/)

## Installation

```bash
npm i @awardit/formaggio
```

## Forms

### Example

```javascript
import {
  Form,
  isEmail,
  required,
  rules,
  useFormField,
} from "@awardit/formaggio";

const TextInput = ({ name }) => {
  const { dirty, errors, submitted, inputProps } = useFormField(name);
  const className = (dirty || submitted) && errors.length ?
    "form__text-input form__text-input--error" :
    "form__text-input";

  return <input type="text" className={className} {...inputProps} />;
};

const validateMyForm = rules([
  required("name"),
  required("email"),
  isEmail("email")
]);

const MyForm = () => {
  const [data, setData] = useState({});
  const errors = validateMyForm(data);

  return (
    <Form
      noValidate
      name="my-form"
      value={data}
      onChange={setData}
      onSubmit={console.log}
    >
      <TextInput name="name" />
      <TextInput name="email" />

      <button type="submit">Submit</button>
    </Form>
  );
};
```

### `useFormField` hook

The library provided React Hook `useFormField` is used to provide access to the
state for the given field name which include:

 * `dirty: boolean`: True if the user has modified this field.
 * `submitted: boolean`: True if the user has tried to submit the form.
 * `errors: Array<ValidationError>`: List of errors which apply to this field.
 * `inputProps: Object`: Properties to apply to the `<input />` element.

The `inputProps` object contains `id`, `name`, `value` and an `onChange`
callback, the idea is to spread the properties into an `<input />`.

### `Form` component

The `<Form />` component provides the form state to any nested uses of
`useFormField`. It will wrap all its children in a `<form />` tag.

Properties: 

 * `errors?: Array<ValidationErrors>`: Any validation errors for this form.
 * `name?: string`: This string will prefix any `name` and `id` properties
   in nested uses of `useFormField`.
 * `onChange: (FormData) => void`: Callback for when the form data
   changes, these changes are performed immutably.
 * `onError?: (SyntheticEvent<HTMLFormElement>, Array<ValidationError>, FormData) => void`:
   Callback fired instead of `onSubmit` if there is an error in the form when
   the user tries to submit the form.
 * `onSubmit: (SyntheticEvent<HTMLFormElement>, FormData) => void`: Callback
   fired with the current form data when the user submits the form.
 * `value: FormData`: The data for the form.

Any properties not listed above will be propagated to the `<form />` element.

To properly handle validation and `onChange` events in nested `<input />`
elements it is recommended to set the property `noValidate` on `<Form />`.

## Validation

Validation is done using functions which take a value to validate and return
a list of errors. The validation functions are created using rule-constructors
or combinators.

### Example

```javascript
import {
  conditional,
  isEmail,
  lengthGt,
  required,
  rules,
} from "@awardit/formaggio";

const validator = rules([
  isEmail("email"),
  required("firstname"), 
  required("lastname"),
  conditional(s => s.password, lengthGt("password", 6)),
]);

const data = {
  firstname: "foo",
  lastname: "bar",
  email: "foo@bar",
};

const errors = validator(data);

console.log(errors); // [{ error: "EMAIL", field: "email" }]
```

### Rules

Validation rules are constructed in a declarative manner using rule constructors
and rule combinators.

A basic validator has the following type, where `T` is the type to be validated:

```javascript
type Validator<T> = (t: T) => Array<ValidationError>;
```

### Errors

Errors are objects containing an error code and a field path. The field path is
preserved through combinators and is used to determine which field caused the
specific error. Additional properties are allowed but are error-specific.

```javascript
type ValidationError = {
  error: string,
  field: string,
};
