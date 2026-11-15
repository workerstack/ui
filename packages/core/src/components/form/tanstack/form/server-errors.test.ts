import { expect, it, vi } from "vitest";

import { applyHttpFormError, applyServerErrors, type FormErrorSink, isHttpFormError } from "./server-errors.ts";

/** The two setters the server-error helpers write through, as mocks. */
function sink() {
  return { setErrorMap: vi.fn<FormErrorSink["setErrorMap"]>(), setFieldMeta: vi.fn<FormErrorSink["setFieldMeta"]>() };
}

/** A field's meta as TanStack keeps it; the helpers spread it and set only `errorMap`. */
type FieldMeta = Parameters<Extract<Parameters<FormErrorSink["setFieldMeta"]>[1], (meta: never) => object>>[0];

/** Whether a meta argument is an update function rather than the meta itself. */
function isUpdate(update: Parameters<FormErrorSink["setFieldMeta"]>[1]): update is (meta: FieldMeta) => FieldMeta {
  return typeof update === "function";
}

/** The field and the `onServer` error each `setFieldMeta` call writes, applied to a bare meta. */
function written(form: ReturnType<typeof sink>): [string, string][] {
  // A bare meta: the members the update keeps by spreading don't matter here.
  const bare = { errorMap: {} } /* the update reads only errorMap */ as FieldMeta;

  return form.setFieldMeta.mock.calls.map(([name, update]) => {
    const meta = isUpdate(update) ? update(bare) : update;

    return [name, String(meta.errorMap.onServer)];
  });
}

it("applyServerErrors puts each field's messages, joined, in its onServer error", () => {
  const form = sink();
  applyServerErrors(form, { email: ["Taken."], name: [] });
  expect(written(form)).toStrictEqual([["email", "Taken."]]);
});

it("applyHttpFormError puts field messages on the fields and not on the form alert", () => {
  const form = sink();
  const field = { message: "Name must be at least 2 characters." };
  const error = { body: { fields: { name: [field] }, message: field.message }, status: 400 };
  const isApplied = applyHttpFormError(form, error);
  expect(isApplied).toBe(true);
  expect(written(form)).toStrictEqual([["name", field.message]]);
  expect(form.setErrorMap).not.toHaveBeenCalled();
});

it("applyHttpFormError sets the form alert when no field has a message", () => {
  const form = sink();
  const error = { body: { fields: { name: [{ message: "" }] }, message: "Invalid input" } };
  expect(applyHttpFormError(form, error)).toBe(true);
  expect(form.setErrorMap.mock.calls).toStrictEqual([[{ onSubmit: "Invalid input" }]]);
  expect(form.setFieldMeta).not.toHaveBeenCalled();
});

it("applyHttpFormError reads a bare body as well as a response", () => {
  const form = sink();
  expect(applyHttpFormError(form, { fields: {}, message: "Try again." })).toBe(true);
  expect(form.setErrorMap.mock.calls).toStrictEqual([[{ onSubmit: "Try again." }]]);
});

it("applyHttpFormError leaves a 401 and a body with nothing to show to the caller", () => {
  const form = sink();
  expect(applyHttpFormError(form, { body: { message: "Signed out." }, status: 401 })).toBe(false);
  expect(applyHttpFormError(form, { body: {}, status: 500 })).toBe(false);
  expect(form.setErrorMap).not.toHaveBeenCalled();
});

it("isHttpFormError accepts API errors and rejects anything else", () => {
  expect(isHttpFormError({ body: { fields: { name: [{ message: "Short." }] } }, status: 400 })).toBe(true);
  expect(isHttpFormError({ fields: {}, message: "Invalid input" })).toBe(true);
  expect(isHttpFormError(new Error("boom"))).toBe(false);
  expect(isHttpFormError({ message: "no fields" })).toBe(false);
  expect(isHttpFormError({ body: { fields: { name: "Short." } } })).toBe(false);
  expect(isHttpFormError({ body: {}, status: "400" })).toBe(false);
  expect(isHttpFormError(null)).toBe(false);
});
