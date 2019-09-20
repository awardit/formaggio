# Formaggio

[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@crossroads-loyalty-solutions/formaggio.svg)](https://bundlephobia.com/result?p=@crossroads-loyalty-solutions/formaggio)
[![Dependencies](https://img.shields.io/david/crossroads-loyalty-solutions/formaggio.svg)](https://www.npmjs.com/package/@crossroads-loyalty-solutions/formaggio)
[![Build Status](https://travis-ci.org/crossroads-loyalty-solutions/formaggio.svg?branch=master)](https://travis-ci.org/crossroads-loyalty-solutions/formaggio)
[![Codecov](https://img.shields.io/codecov/c/gh/crossroads-loyalty-solutions/formaggio)](https://codecov.io/gh/crossroads-loyalty-solutions/formaggio)
![License](https://img.shields.io/npm/l/@crossroads-loyalty-solutions/formaggio)
[![npm](https://img.shields.io/npm/v/@crossroads-loyalty-solutions/formaggio)](https://www.npmjs.com/package/@crossroads-loyalty-solutions/formaggio)

The cheesy form library 🧀

## Validation rules

Validation rules are created in a declarative manner using rule constructors
and rule combinators.

A basic validator has the following type, where `S` is the type to be validated:

```javascript
type Validator<S> = (s: S) => Array<ValidationError>;
```

### Examples

```javascript
const validator = rules([
  isEmail("email"),
  required("firstname"), 
  required("lastname"),
  conditional(s => s.password, lengthGt("password", 6)),
]);

// ...

const data = {
  firstname: "foo",
  lastname: "bar",
  email: "foo@bar",
};

const errors = validator(data);

console.log(errors); // [{ error: "EMAIL", field: "email" }]
```
