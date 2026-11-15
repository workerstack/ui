import { renderServer, tag, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { Field, FieldLabel } from "../field/index.ts";
import { PRIORITY } from "./__fixtures__/priority.fixture.ts";
import { BooleanView, ChoiceView, View } from "./index.ts";

it("View on the server renders an output the field's label names, with its text and no warnings", () => {
  const { html, warnings } = renderServer(() => (
    <Field>
      <FieldLabel>Name</FieldLabel>
      <View text="Ada" />
    </Field>
  ));

  const label = tag(html, { "data-slot": "field-label" });
  const output = tag(html, { "data-slot": "view" });
  expect(output.name).toBe("output");
  expect(output.attrs["aria-labelledby"]).toBe(label.attrs.id);
  expect(label.attrs.for).toBe(output.attrs.id);
  expect(text(html)).toContain("Ada");
  expect(warnings).toStrictEqual([]);
});

it("View on the server shows the empty marker, marked empty", () => {
  const { html, warnings } = renderServer(() => <View />);
  expect(tag(html, { "data-slot": "view" }).attrs).toHaveProperty("data-empty");
  expect(text(html)).toBe("—");
  expect(warnings).toStrictEqual([]);
});

it("BooleanView on the server renders Yes", () => {
  const { html, warnings } = renderServer(() => <BooleanView value />);
  expect(text(html)).toBe("Yes");
  expect(warnings).toStrictEqual([]);
});

it("ChoiceView on the server renders colored options as badges", () => {
  const { html, warnings } = renderServer(() => <ChoiceView items={PRIORITY} value={["urgent", "normal"]} />);
  expect(text(html)).toBe("UrgentNormal");
  expect(html.match(/data-slot="badge"/g)).toHaveLength(2);
  expect(warnings).toStrictEqual([]);
});
