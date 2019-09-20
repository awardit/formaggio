# Formaggio

The cheesy form library.

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
