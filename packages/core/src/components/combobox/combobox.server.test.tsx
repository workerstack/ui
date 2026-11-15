import { renderServer, tag, tags, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { FruitItemsCombobox } from "./__fixtures__/fruit-combobox.fixture.tsx";
import { TagCombobox } from "./__fixtures__/tag-combobox.fixture.tsx";

// UI SDK 0.1.0-beta.2: ComboboxContent registers itself with the Combobox while rendering, a signal
// write Solid warns about on the server (SERVER_WRITE) and will make an error. Drop `.fails` when fixed.
// First in the file: Solid warns once per kind of write per process.
it.fails("Combobox on the server renders without warnings", () => {
  const { warnings } = renderServer(() => <FruitItemsCombobox defaultValue="banana" />);

  expect(warnings).toStrictEqual([]);
});

it("Combobox on the server renders a closed combobox linked to its label, with the chosen label", () => {
  const { html } = renderServer(() => <FruitItemsCombobox defaultValue="banana" />);

  const input = tag(html, { "data-slot": "combobox-input" });
  expect(input.name).toBe("input");
  expect(input.attrs.role).toBe("combobox");
  expect(input.attrs["aria-expanded"]).toBe("false");
  expect(input.attrs["aria-labelledby"]).toBe(tag(html, { "data-slot": "field-label" }).attrs.id);
  expect(tag(html, { "data-slot": "field-label" }).attrs.for).toBe(input.attrs.id);
  expect(input.attrs.value).toBe("Banana");
  expect(input.attrs.placeholder).toBe("Pick a fruit");
});

it("Combobox on the server renders the box with the chevron and no popup", () => {
  const { html } = renderServer(() => <FruitItemsCombobox />);

  const group = tag(html, { "data-slot": "combobox-group" });
  expect(group.attrs.class).toContain("rounded-md");
  expect(tag(html, { "data-slot": "combobox-trigger" }).attrs["aria-hidden"]).toBe("true");
  expect(tag(html, { "data-slot": "combobox-input" }).attrs.value).toBe("");
  expect(tags(html, { "data-slot": "combobox-content" })).toStrictEqual([]);
  expect(tags(html, { "data-slot": "combobox-item" })).toStrictEqual([]);
});

it("Combobox on the server submits the chosen value under the field's name", () => {
  const { html } = renderServer(() => <FruitItemsCombobox defaultValue="cherry" name="fruit" />);

  const form = tag(html, { "data-slot": "combobox-form-input" });
  expect(form.attrs.name).toBe("fruit");
  expect(form.attrs.value).toBe("cherry");
});

it("Combobox multiple on the server renders a chip with a remove button for each chosen value", () => {
  const { html } = renderServer(() => <TagCombobox defaultValue={["bug", "feature"]} />);

  expect(tags(html, { "data-slot": "combobox-chip" })).toHaveLength(2);
  expect(text(html)).toContain("Bug");
  expect(text(html)).toContain("Feature");
  expect(tags(html, { "data-slot": "combobox-chip-remove" })).toHaveLength(2);
  expect(tags(html, { "data-slot": "combobox-chip-remove" })[0]?.attrs["aria-label"]).toBe("Remove");
  expect(tags(html, { "data-slot": "combobox-chip-remove" })[0]?.attrs["data-icon"]).toBe("x");
});
