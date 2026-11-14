import { For } from "solid-js";
import { expect, it } from "vitest";

import { Field, FieldLabel } from "../field/index.ts";
import { renderServer, slot, slots, text } from "../test/server.ts";
import { roles } from "./__fixtures__/role-select.fixture.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./index.ts";

// UI SDK 0.1.0-beta.2: SelectContent registers itself with the Select while rendering, a signal
// write Solid warns about on the server (SERVER_WRITE) and will make an error. Drop `.fails` when fixed.
// First in the file: Solid warns once per kind of write per process.
it.fails("Select on the server renders without warnings", () => {
  const { warnings } = renderServer(() => (
    <Select items={roles}>
      <SelectTrigger aria-label="Role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent />
    </Select>
  ));

  expect(warnings).toStrictEqual([]);
});

it("Select on the server renders a closed, labelled combobox with the placeholder and no popup", () => {
  const { html } = renderServer(() => (
    <Field name="role">
      <FieldLabel>Role</FieldLabel>
      <Select placeholder="Pick a role">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <For each={roles}>{(role) => <SelectItem value={role.value}>{role.label}</SelectItem>}</For>
        </SelectContent>
      </Select>
    </Field>
  ));

  const trigger = slot(html, "select-trigger");
  expect(trigger.attrs.role).toBe("combobox");
  expect(trigger.attrs["aria-expanded"]).toBe("false");
  expect(trigger.attrs["aria-labelledby"]).toBe(slot(html, "field-label").attrs.id);
  expect(slot(html, "select-value").attrs).toHaveProperty("data-placeholder");
  expect(text(html)).toContain("Pick a role");
  expect(slots(html, "select-content")).toStrictEqual([]);
  expect(slots(html, "select-item")).toStrictEqual([]);
});

it("Select on the server renders the selected item's label from `items`, and its value in the form input", () => {
  const { html } = renderServer(() => (
    <Select items={roles} defaultValue="editor" name="role">
      <SelectTrigger aria-label="Role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent />
    </Select>
  ));

  expect(text(html)).toContain("Editor");
  expect(slot(html, "select-value").attrs).not.toHaveProperty("data-placeholder");
  expect(slot(html, "select-form-input").attrs.value).toBe("editor");
});

// Items given as children only exist once they mount, so the server shows the raw value until
// hydration. Pass `items` to the Select for server-rendered labels. When this passes, drop `.fails`.
it.fails("Select on the server renders the selected item's label from children", () => {
  const { html } = renderServer(() => (
    <Select defaultValue="editor">
      <SelectTrigger aria-label="Role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <For each={roles}>{(role) => <SelectItem value={role.value}>{role.label}</SelectItem>}</For>
      </SelectContent>
    </Select>
  ));

  expect(text(html)).toContain("Editor");
});
