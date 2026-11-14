import { expect, it } from "vitest";

import { renderServer, slot, slots } from "../test/server.ts";
import { TermsCheckbox } from "./__fixtures__/terms-checkbox.fixture.tsx";
import { ToppingsGroup } from "./__fixtures__/toppings-group.fixture.tsx";

// First in the file: Solid warns once per kind of write per process.
it("Checkbox on the server renders without warnings", () => {
  const { warnings } = renderServer(() => <TermsCheckbox defaultChecked />);

  expect(warnings).toStrictEqual([]);
});

it("Checkbox on the server renders an unchecked checkbox labelled by its Field", () => {
  const { html } = renderServer(() => <TermsCheckbox />);

  const box = slot(html, "checkbox");
  expect(box.attrs.role).toBe("checkbox");
  expect(box.attrs["aria-checked"]).toBe("false");
  expect(box.attrs).not.toHaveProperty("data-checked");
  expect(box.attrs["aria-labelledby"]).toBe(slot(html, "field-label").attrs.id);
  expect(slots(html, "checkbox-indicator")).toStrictEqual([]);
});

it("Checkbox on the server renders a checked checkbox with its check", () => {
  const { html } = renderServer(() => <TermsCheckbox defaultChecked />);

  const box = slot(html, "checkbox");
  expect(box.attrs["aria-checked"]).toBe("true");
  expect(box.attrs).toHaveProperty("data-checked");
  expect(slots(html, "checkbox-indicator")).toHaveLength(1);
});

it("Checkbox on the server renders an indeterminate checkbox as mixed", () => {
  const { html } = renderServer(() => <TermsCheckbox defaultChecked="indeterminate" />);

  const box = slot(html, "checkbox");
  expect(box.attrs["aria-checked"]).toBe("mixed");
  expect(box.attrs).toHaveProperty("data-indeterminate");
});

it("Checkbox on the server renders a disabled checkbox", () => {
  const { html } = renderServer(() => <TermsCheckbox disabled />);

  expect(slot(html, "checkbox").attrs).toHaveProperty("data-disabled");
});

it("CheckboxGroup on the server renders the boxes in its value as checked", () => {
  const { html } = renderServer(() => <ToppingsGroup defaultValue={["ham"]} />);

  expect(slot(html, "checkbox-group").attrs.role).toBe("group");
  const states = slots(html, "checkbox").map((box) => box.attrs["aria-checked"]);
  expect(states).toStrictEqual(["false", "true", "false"]);
});

it("CheckboxGroup on the server renders a parent as mixed for some", () => {
  const { html } = renderServer(() => (
    <ToppingsGroup withParent defaultValue={["ham"]} allValues={["cheese", "ham", "olive"]} />
  ));

  const states = slots(html, "checkbox").map((box) => box.attrs["aria-checked"]);
  expect(states).toStrictEqual(["mixed", "false", "true", "false"]);
});
