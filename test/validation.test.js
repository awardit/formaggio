/* @flow */

import ava from "ava";
import ninos from "ninos";
import {
  rules, nestedRule, conditional,
  isNumeric, isRequired, lengthGt, lengthLt, isTruthy, match,
  isPhone, isPostalCode, isEmail
} from "../src";

const test = ninos(ava);

test("Empty rules", t => {
  t.is(typeof rules([]), "function");
  t.deepEqual(rules([])(), []);
});

test("rules with no errors", t => {
  const a = t.context.stub(() => []);
  const b = t.context.stub(() => []);

  t.deepEqual(rules([a, b])("foo"), []);
  t.is(a.calls.length, 1);
  t.deepEqual(a.calls[0].arguments, ["foo"]);
  t.is(b.calls.length, 1);
  t.deepEqual(b.calls[0].arguments, ["foo"]);
});

test("rules with errors", t => {
  const a = t.context.stub(() => [
    { error: "a-error", field: "thefield" }
  ]);
  const b = t.context.stub(() => [
    { error: "b-error-1", field: "a-field" },
    { error: "b-error-2", field: "bar" }
  ]);

  t.deepEqual(rules([a, b])("foo"), [
    { error: "a-error", field: "thefield" },
    { error: "b-error-1", field: "a-field" },
    { error: "b-error-2", field: "bar" }
  ]);
  t.is(a.calls.length, 1);
  t.deepEqual(a.calls[0].arguments, ["foo"]);
  t.is(b.calls.length, 1);
  t.deepEqual(b.calls[0].arguments, ["foo"]);
});

test("nestedRule with primitive", t => {
  const a = t.context.stub(() => []);

  t.is(typeof nestedRule("foo", a), "function");
  t.deepEqual(nestedRule("foo", a)("foo"), []);

  t.is(a.calls.length, 0);
});

test("nestedRule with empty object", t => {
  const a = t.context.stub(() => [
    { error: "foo", field: "thefield" }
  ]);

  t.deepEqual(nestedRule("foo", a)({}), [
    { error: "foo", field: "foo.thefield" }
  ]);

  t.is(a.calls.length, 1);
  t.deepEqual(a.calls[0].arguments, [undefined]);
});

test("nestedRule with object", t => {
  const a = t.context.stub(() => []);

  t.deepEqual(nestedRule("foo", a)({ foo: "bar" }), []);

  t.is(a.calls.length, 1);
  t.deepEqual(a.calls[0].arguments, ["bar"]);
});

test("conditional", t => {
  const a = t.context.stub(() => [{ error: "error", field: "foo" }]);
  const b = t.context.stub(() => false);
  const c = t.context.stub(() => true);

  t.deepEqual(conditional(b, a)("bar"), []);

  t.is(a.calls.length, 0);
  t.is(b.calls.length, 1);
  t.deepEqual(b.calls[0].arguments, ["bar"]);

  t.deepEqual(conditional(c, a)("bar"), [{ error: "error", field: "foo" }]);

  t.is(a.calls.length, 1);
  t.is(b.calls.length, 1);
  t.is(c.calls.length, 1);
  t.deepEqual(c.calls[0].arguments, ["bar"]);
  t.deepEqual(a.calls[0].arguments, ["bar"]);
});

test("isNumeric", t => {
  t.is(typeof isNumeric("foo"), "function");
  t.deepEqual(isNumeric("foo")({ foo: "234" }), []);
  t.deepEqual(isNumeric("foo")({ foo: "23.4" }), []);
  t.deepEqual(isNumeric("foo")({ foo: 0 }), []);
  t.deepEqual(isNumeric("foo")({ foo: "0,ff" }), [{ error: "NUMERIC", field: "foo" }]);
  t.deepEqual(isNumeric("foo")({ foo: "0..1" }), [{ error: "NUMERIC", field: "foo" }]);
  t.deepEqual(isNumeric("foo")({ foo: true }), [{ error: "NUMERIC", field: "foo" }]);
  t.deepEqual(isNumeric("foo")({ foo: {} }), [{ error: "NUMERIC", field: "foo" }]);
  t.deepEqual(isNumeric("foo")({ foo: ([]: any) }), [{ error: "NUMERIC", field: "foo" }]);
  t.deepEqual(isNumeric("foo")({ foo: (null: any) }), [{ error: "NUMERIC", field: "foo" }]);
  t.deepEqual(isNumeric("foo")({ foo: (undefined: any) }), [{ error: "NUMERIC", field: "foo" }]);
  t.deepEqual(isNumeric("foo")({ foo: true }), [{ error: "NUMERIC", field: "foo" }]);
});

test("isRequired", t => {
  t.is(typeof isRequired("foo"), "function");
  t.deepEqual(isRequired("foo")({}), [{ error: "REQUIRED", field: "foo" }]);
  t.deepEqual(isRequired("foo")({ foo: (undefined: any) }), [{ error: "REQUIRED", field: "foo" }]);
  t.deepEqual(isRequired("foo")({ foo: (null: any) }), [{ error: "REQUIRED", field: "foo" }]);
  t.deepEqual(isRequired("foo")({ foo: "" }), [{ error: "REQUIRED", field: "foo" }]);
  t.deepEqual(isRequired("foo")({ foo: false }), [{ error: "REQUIRED", field: "foo" }]);
  t.deepEqual(isRequired("foo")({ foo: 0 }), []);
  t.deepEqual(isRequired("foo")({ foo: "a" }), []);
  t.deepEqual(isRequired("foo")({ foo: 1 }), []);
  t.deepEqual(isRequired("foo")({ foo: ([]: any) }), []);
  t.deepEqual(isRequired("foo")({ foo: {} }), []);
  t.deepEqual(isRequired("foo")({ foo: true }), []);
});

test("lengthGt", t => {
  t.is(typeof lengthGt("foo", 2), "function");
  t.deepEqual(lengthGt("foo", 2)({ foo: "abc" }), []);
  t.deepEqual(lengthGt("foo", 2)({ foo: "ab" }), [{ error: "LENGTH_GT", field: "foo", lengthGt: 2 }]);
  t.deepEqual(lengthGt("foo", 2)({ foo: 0 }), [{ error: "LENGTH_GT", field: "foo", lengthGt: 2 }]);
  t.deepEqual(lengthGt("foo", 2)({ foo: true }), [{ error: "LENGTH_GT", field: "foo", lengthGt: 2 }]);
  t.deepEqual(lengthGt("foo", 2)({ foo: (null: any) }), [{ error: "LENGTH_GT", field: "foo", lengthGt: 2 }]);
});

test("lengthLt", t => {
  t.is(typeof lengthLt("foo", 2), "function");
  t.deepEqual(lengthLt("foo", 2)({ foo: "a" }), []);
  t.deepEqual(lengthLt("foo", 2)({ foo: "ab" }), [{ error: "LENGTH_LT", field: "foo", lengthLt: 2 }]);
  t.deepEqual(lengthLt("foo", 2)({ foo: 0 }), [{ error: "LENGTH_LT", field: "foo", lengthLt: 2 }]);
  t.deepEqual(lengthLt("foo", 2)({ foo: true }), [{ error: "LENGTH_LT", field: "foo", lengthLt: 2 }]);
  t.deepEqual(lengthLt("foo", 2)({ foo: (null: any) }), [{ error: "LENGTH_LT", field: "foo", lengthLt: 2 }]);
});

test("isTruthy", t => {
  t.is(typeof isTruthy("foo"), "function");
  t.deepEqual(isTruthy("foo")({ foo: "a" }), []);
  t.deepEqual(isTruthy("foo")({ foo: true }), []);
  t.deepEqual(isTruthy("foo")({ foo: "" }), [{ error: "TRUTHY", field: "foo" }]);
  t.deepEqual(isTruthy("foo")({ foo: 0 }), [{ error: "TRUTHY", field: "foo" }]);
  t.deepEqual(isTruthy("foo")({ foo: false }), [{ error: "TRUTHY", field: "foo" }]);
  t.deepEqual(isTruthy("foo")({ foo: (null: any) }), [{ error: "TRUTHY", field: "foo" }]);
  t.deepEqual(isTruthy("foo")({ foo: (undefined: any) }), [{ error: "TRUTHY", field: "foo" }]);
});

test("match", t => {
  t.is(typeof match("foo", "bar"), "function");
  t.deepEqual(match("foo", "bar")({ foo: "identical str", bar: "identical str" }), []);
  t.deepEqual(match("foo", "bar")({ foo: "", bar: "" }), []);
  t.deepEqual(match("foo", "bar")({ foo: true, bar: true }), []);
  t.deepEqual(match("foo", "bar")({ foo: false, bar: false }), []);
  t.deepEqual(match("foo", "bar")({ foo: (null: any), bar: (null: any) }), []);
  t.deepEqual(match("foo", "bar")({ foo: (undefined: any), bar: (undefined: any) }), []);
  t.deepEqual(match("foo", "bar")({ foo: "1", bar: "2" }), [{ error: "MATCH", field: "bar", match: "bar" }]);
});

test("isEmail", t => {
  t.is(typeof isEmail("foo"), "function");
  t.deepEqual(isEmail("foo")({ foo: "foo@bar.com" }), []);
  t.deepEqual(isEmail("foo")({ foo: "-_+@bar.com" }), []);
  t.deepEqual(isEmail("foo")({ foo: "fOo@bar.com" }), []);
  t.deepEqual(isEmail("foo")({ foo: "foo-@bar.com" }), []);
  t.deepEqual(isEmail("foo")({ foo: "åäö@bar.com" }), [{ error: "EMAIL", field: "foo" }]);
  t.deepEqual(isEmail("foo")({ foo: "foo baz@bar.com" }), [{ error: "EMAIL", field: "foo" }]);
  t.deepEqual(isEmail("foo")({ foo: "foo.@bar.com" }), [{ error: "EMAIL", field: "foo" }]);
  t.deepEqual(isEmail("foo")({ foo: "foo@bar-.com" }), [{ error: "EMAIL", field: "foo" }]);
  t.deepEqual(isEmail("foo")({ foo: "foo@bar.com-" }), [{ error: "EMAIL", field: "foo" }]);
  t.deepEqual(isEmail("foo")({ foo: "foo@bar.-com" }), [{ error: "EMAIL", field: "foo" }]);
  t.deepEqual(isEmail("foo")({ foo: ".foo@bar.com" }), [{ error: "EMAIL", field: "foo" }]);
});

test("isPostalCode", t => {
  t.is(typeof isPostalCode("foo"), "function");
  t.deepEqual(isPostalCode("foo")({ foo: "12345" }), []);
  t.deepEqual(isPostalCode("foo")({ foo: "123 45" }), []);
  t.deepEqual(isPostalCode("foo")({ foo: "1234" }), [{ error: "POSTCODE", field: "foo" }]);
  t.deepEqual(isPostalCode("foo")({ foo: "123456" }), [{ error: "POSTCODE", field: "foo" }]);
  t.deepEqual(isPostalCode("foo")({ foo: "abcde" }), [{ error: "POSTCODE", field: "foo" }]);
  t.deepEqual(isPostalCode("foo")({ foo: false }), [{ error: "POSTCODE", field: "foo" }]);
  t.deepEqual(isPostalCode("foo")({ foo: true }), [{ error: "POSTCODE", field: "foo" }]);
  t.deepEqual(isPostalCode("foo")({ foo: (null: any) }), [{ error: "POSTCODE", field: "foo" }]);
  t.deepEqual(isPostalCode("foo")({ foo: (undefined: any) }), [{ error: "POSTCODE", field: "foo" }]);
});

test("isPhone", t => {
  t.is(typeof isPhone("foo"), "function");
  t.deepEqual(isPhone("foo")({ foo: "0701234567" }), []);
  t.deepEqual(isPhone("foo")({ foo: "0046701234567" }), []);
  t.deepEqual(isPhone("foo")({ foo: "+46701234567" }), []);
  t.deepEqual(isPhone("foo")({ foo: "abc" }), [{ error: "PHONE", field: "foo" }]);
  t.deepEqual(isPhone("foo")({ foo: false }), [{ error: "PHONE", field: "foo" }]);
  t.deepEqual(isPhone("foo")({ foo: true }), [{ error: "PHONE", field: "foo" }]);
  t.deepEqual(isPhone("foo")({ foo: (null: any) }), [{ error: "PHONE", field: "foo" }]);
  t.deepEqual(isPhone("foo")({ foo: (undefined: any) }), [{ error: "PHONE", field: "foo" }]);
});
