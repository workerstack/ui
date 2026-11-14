import { expect, it } from "vitest";

import { Input } from "../input/index.ts";
import { renderServer, slot, slots, tags } from "../test/server.ts";
import { Field, FieldDescription, FieldError, FieldLabel } from "./index.ts";

it("Field on the server connects the label and description to the control in the HTML", () => {
  const { html, warnings } = renderServer(() => (
    <Field name="email">
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldDescription>We never share it.</FieldDescription>
    </Field>
  ));

  const label = slot(html, "field-label");
  const input = slot(html, "input");
  const description = slot(html, "field-description");
  expect(label.name).toBe("label");
  expect(label.attrs.for).toBe(input.attrs.id);
  expect(input.attrs["aria-labelledby"]).toBe(label.attrs.id);
  expect(input.attrs["aria-describedby"]?.split(" ")).toContain(description.attrs.id);
  expect(input.attrs.name).toBe("email");
  expect(warnings).toStrictEqual([]);
});

it("Field on the server renders an invalid field invalid, with its error", () => {
  const { html } = renderServer(() => (
    <Field invalid>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldError>Taken</FieldError>
    </Field>
  ));

  const input = slot(html, "input");
  const error = slot(html, "field-error");
  expect(input.attrs["aria-invalid"]).toBe("true");
  expect(input.attrs["aria-describedby"]?.split(" ")).toContain(error.attrs.id);

  for (const part of ["field", "field-label", "field-error"])
    expect(slot(html, part).attrs).toHaveProperty("data-invalid");
  expect(html).toContain(">Taken</");
});

it("Field on the server leaves a valid field's error out of the HTML", () => {
  const { html } = renderServer(() => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldError>Taken</FieldError>
    </Field>
  ));

  expect(slots(html, "field-error")).toStrictEqual([]);
  expect(slot(html, "input").attrs).not.toHaveProperty("aria-invalid");
});

// UI SDK 0.1.0-beta.2 gives a FieldError with `match` an id of its own but adds it to the control's
// aria-describedby only after mount, so the server HTML names the unmatched error's id instead.
it.fails("Field on the server describes the control by a matched error in the HTML", () => {
  const { html } = renderServer(() => (
    <Field invalid>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldError match>Taken</FieldError>
    </Field>
  ));

  expect(slot(html, "input").attrs["aria-describedby"]?.split(" ")).toContain(slot(html, "field-error").attrs.id);
});

// UI SDK 0.1.0-beta.2 points the control at the description's id even when the field has no
// description. When this starts passing, the upstream fix has landed: drop `.fails`.
it.fails("Field on the server describes the control only by parts that are in the HTML", () => {
  const { html } = renderServer(() => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input />
    </Field>
  ));

  const ids = new Set(tags(html).map((tag) => tag.attrs.id));

  for (const id of slot(html, "input").attrs["aria-describedby"]?.split(" ") ?? []) expect(ids).toContain(id);
});
