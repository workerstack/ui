import { expect, it } from "vitest";

import { renderServer, slot, slots, text } from "../../test/server.ts";
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

  const input = slot(html, "combobox-input");
  expect(input.name).toBe("input");
  expect(input.attrs.role).toBe("combobox");
  expect(input.attrs["aria-expanded"]).toBe("false");
  expect(input.attrs["aria-labelledby"]).toBe(slot(html, "field-label").attrs.id);
  expect(slot(html, "field-label").attrs.for).toBe(input.attrs.id);
  expect(input.attrs.value).toBe("Banana");
  expect(input.attrs.placeholder).toBe("Pick a fruit");
});

it("Combobox on the server renders the box with the chevron and no popup", () => {
  const { html } = renderServer(() => <FruitItemsCombobox />);

  const group = slot(html, "combobox-group");
  expect(group.attrs.class).toContain("rounded-md");
  expect(slot(html, "combobox-trigger").attrs["aria-hidden"]).toBe("true");
  expect(slot(html, "combobox-input").attrs.value).toBe("");
  expect(slots(html, "combobox-content")).toStrictEqual([]);
  expect(slots(html, "combobox-item")).toStrictEqual([]);
});

it("Combobox on the server submits the chosen value under the field's name", () => {
  const { html } = renderServer(() => <FruitItemsCombobox defaultValue="cherry" name="fruit" />);

  const form = slot(html, "combobox-form-input");
  expect(form.attrs.name).toBe("fruit");
  expect(form.attrs.value).toBe("cherry");
});

it("Combobox multiple on the server renders a chip with a remove button for each chosen value", () => {
  const { html } = renderServer(() => <TagCombobox defaultValue={["bug", "feature"]} />);

  expect(slots(html, "combobox-chip")).toHaveLength(2);
  expect(text(html)).toContain("Bug");
  expect(text(html)).toContain("Feature");
  expect(slots(html, "combobox-chip-remove")).toHaveLength(2);
  expect(slots(html, "combobox-chip-remove")[0]?.attrs["aria-label"]).toBe("Remove");
  expect(slots(html, "combobox-chip-remove")[0]?.attrs["data-icon"]).toBe("x");
});
