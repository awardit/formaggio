/* @flow */

import ava from "ava";
import ninos from "ninos";
import { cleanup, render, fireEvent } from "@testing-library/react";
import React, { useContext } from "react";
import { Form, FormContext, useFormField } from "../src";

// We need to make sure we cleanup after each test, so serial
const test = ninos(ava).serial;

test.afterEach.always(cleanup);

const Field = (props: { +name: string }) => {
  const { inputProps } = useFormField(props.name);

  return <input type="text" {...inputProps} />;
};

test("Should render children", t => {
  const onChange = t.context.stub();
  const onError = t.context.stub();
  const onSubmit = t.context.stub();

  const { container } = render(
    <Form value={{}} onChange={onChange} onError={onError} onSubmit={onSubmit}>
      <Field name="foo" />
    </Form>
  );

  const input = container.querySelector("input");

  t.truthy(input);
  t.is(input.outerHTML, "<input type=\"text\" id=\"foo\" name=\"foo\" value=\"\">");
  t.is(onChange.calls.length, 0);
  t.is(onError.calls.length, 0);
  t.is(onSubmit.calls.length, 0);
});

test("Children should get value from <Form> value", t => {
  const onChange = t.context.stub();
  const onError = t.context.stub();
  const onSubmit = t.context.stub();

  const { container } = render(
    <Form value={{ foo: "bar" }} onChange={onChange} onError={onError} onSubmit={onSubmit}>
      <Field name="foo" />
    </Form>
  );

  const input = container.querySelector("input");

  t.truthy(input);
  t.is(input.outerHTML, "<input type=\"text\" id=\"foo\" name=\"foo\" value=\"bar\">");
  t.is(onChange.calls.length, 0);
  t.is(onError.calls.length, 0);
  t.is(onSubmit.calls.length, 0);
});

test("Should call onChange when input in modified", t => {
  const onChange = t.context.stub();
  const onError = t.context.stub();
  const onSubmit = t.context.stub();

  const { container, rerender } = render(
    <Form value={{ foo: "bar" }} onChange={onChange} onError={onError} onSubmit={onSubmit}>
      <Field name="foo" />
    </Form>
  );

  const input = container.querySelector("input");

  t.truthy(input);
  t.is(input.outerHTML, "<input type=\"text\" id=\"foo\" name=\"foo\" value=\"bar\">");
  t.is(onChange.calls.length, 0);
  t.is(onError.calls.length, 0);
  t.is(onSubmit.calls.length, 0);

  fireEvent.change(input, { target: { value: "baz" } });

  t.is(input.value, "bar");
  t.is(onChange.calls.length, 1);
  t.deepEqual(onChange.calls[0].arguments, [{ foo: "baz" }]);
  t.is(onError.calls.length, 0);
  t.is(onSubmit.calls.length, 0);

  rerender(
    <Form value={{ foo: "baz" }} onChange={onChange} onError={onError} onSubmit={onSubmit}>
      <Field name="foo" />
    </Form>
  );

  t.is(input.outerHTML, "<input type=\"text\" id=\"foo\" name=\"foo\" value=\"baz\">");
  t.is(onChange.calls.length, 1);
  t.is(onError.calls.length, 0);
  t.is(onSubmit.calls.length, 0);
});

test("Should empty the field when undefined", t => {
  const onChange = t.context.stub();
  const onError = t.context.stub();
  const onSubmit = t.context.stub();

  const { container, rerender } = render(
    <Form value={{ foo: "test" }} onChange={onChange} onError={onError} onSubmit={onSubmit}>
      <Field name="foo" />
    </Form>
  );

  rerender(
    <Form value={{ foo: (undefined: any) }} onChange={onChange} onError={onError} onSubmit={onSubmit}>
      <Field name="foo" />
    </Form>
  );

  const input = container.querySelector("input");

  t.is(input.outerHTML, "<input type=\"text\" id=\"foo\" name=\"foo\" value=\"\">");
  t.is(onChange.calls.length, 0);
  t.is(onError.calls.length, 0);
  t.is(onSubmit.calls.length, 0);
});

test("Should set submitted to true when submitted", t => {
  let lastSubmitted = null;

  const Field = (props: { +name: string }) => {
    const { inputProps, submitted } = useFormField(props.name);

    lastSubmitted = submitted;

    return <input type="text" {...inputProps} />;
  };

  const onChange = t.context.stub();
  const onError = t.context.stub();
  const onSubmit = t.context.stub();

  const { container } = render(
    <Form value={{ foo: "test" }} onChange={onChange} onError={onError} onSubmit={onSubmit}>
      <Field name="foo" />
    </Form>
  );

  const input = container.querySelector("input");
  const form = container.querySelector("form");

  t.is(onSubmit.calls.length, 0);
  t.is(lastSubmitted, false);

  fireEvent.submit(form);

  t.is(onSubmit.calls.length, 1);
  t.is(lastSubmitted, true);
});

test("Should get errors when validation fails", t => {
  let lastSubmitted = null;

  const Field = (props: { +name: string }) => {
    const { inputProps, submitted } = useFormField(props.name);

    lastSubmitted = submitted;

    return <input type="text" {...inputProps} />;
  };

  const onChange = t.context.stub();
  const onError = t.context.stub();
  const onSubmit = t.context.stub();

  const { container } = render(
    <Form
      value={{ foo: "test" }}
      errors={[{ error: "gurkan", field: "foo" }]}
      onChange={onChange}
      onError={onError}
      onSubmit={onSubmit}
    >
      <Field name="foo" />
    </Form>
  );

  const input = container.querySelector("input");
  const form = container.querySelector("form");

  t.is(onSubmit.calls.length, 0);
  t.is(onError.calls.length, 0);
  t.is(lastSubmitted, false);

  fireEvent.submit(form);

  t.is(onSubmit.calls.length, 0);
  t.is(onError.calls.length, 1);
  t.is(lastSubmitted, true);
});

test("Should throw when useFormField() is used outside <Form />", t => {
  t.throws(() => render(<Field name="foo" />), { message: "useFormField() can only be used inside a <Form />." });
});

test("Should not rerender when errors are not actually updated", t => {
  // React.memo to ensure we do not rerender
  const inner = t.context.stub(() => {
    // Ensure we re-render when it updates:
    useContext(FormContext);
  });
  const Component = React.memo(inner);

  const onChange = t.context.stub();
  const onError = t.context.stub();
  const onSubmit = t.context.stub();
  const value = {};

  const { rerender } = render(
    <Form value={value}
      errors={[]}
      onChange={onChange}
      onError={onError}
      onSubmit={onSubmit}
    >
      <Component />
    </Form>
  );

  t.is(inner.calls.length, 1);
  t.is(onChange.calls.length, 0);
  t.is(onSubmit.calls.length, 0);
  t.is(onError.calls.length, 0);

  const theTest = (errors, renderCount) => {
    rerender(
      <Form value={value}
        errors={(errors: any)}
        onChange={onChange}
        onError={onError}
        onSubmit={onSubmit}
      >
        <Component />
      </Form>
    );

    t.is(inner.calls.length, renderCount, "errors: " + typeof errors === "undefined" ? "undefined" : JSON.stringify(errors));
    t.is(onChange.calls.length, 0);
    t.is(onSubmit.calls.length, 0);
    t.is(onError.calls.length, 0);

    rerender(
      <Form value={value}
        errors={(errors: any)}
        onChange={onChange}
        onError={onError}
        onSubmit={onSubmit}
      >
        <Component />
      </Form>
    );

    t.is(inner.calls.length, renderCount, "second time, errors: " + typeof errors === "undefined" ? "undefined" : JSON.stringify(errors));
    t.is(onChange.calls.length, 0);
    t.is(onSubmit.calls.length, 0);
    t.is(onError.calls.length, 0);
  };

  theTest([], 1);
  theTest([{ error: "A", field: "foo" }], 2);
  theTest([{ error: "A", field: "foo" }, { error: "A", field: "bar" }], 3);
  theTest([{ error: "B", field: "foo" }, { error: "A", field: "bar" }], 4);
  theTest([{ error: "A", field: "bar" }, { error: "B", field: "foo" }], 4);
  theTest(null, 5);
  theTest(undefined, 5);
  theTest([], 6);
});
