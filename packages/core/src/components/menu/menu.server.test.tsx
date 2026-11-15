import { renderServer, tag, tags, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
} from "./index.ts";

// UI SDK 0.1.0-beta.2: MenuContent registers itself with the Menu while rendering, a signal write
// Solid warns about on the server (SERVER_WRITE) and will make an error. Drop `.fails` when fixed.
// First in the file: Solid warns once per kind of write per process.
it.fails("Menu on the server renders without warnings", () => {
  const { warnings } = renderServer(() => (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem value="rename">Rename</MenuItem>
      </MenuContent>
    </Menu>
  ));

  expect(warnings).toStrictEqual([]);
});

it("Menu on the server renders only a collapsed trigger while closed", () => {
  const { html } = renderServer(() => (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem value="rename">Rename</MenuItem>
      </MenuContent>
    </Menu>
  ));

  const trigger = tag(html, { "data-slot": "menu-trigger" });
  expect(trigger.attrs["aria-haspopup"]).toBe("menu");
  expect(trigger.attrs["aria-expanded"]).toBe("false");
  expect(tags(html, { "data-slot": "menu-content" })).toStrictEqual([]);
});

it("Menu on the server renders an open menu with its items, styled", () => {
  const { html } = renderServer(() => (
    <Menu defaultOpen>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem value="rename">
          Rename <MenuShortcut>F2</MenuShortcut>
        </MenuItem>
        <MenuSeparator />
        <MenuItem value="delete" variant="destructive">
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ));

  const content = tag(html, { "data-slot": "menu-content" });
  expect(content.attrs.role).toBe("menu");
  expect(content.attrs.class).toContain("bg-popover");
  expect(tag(html, { "data-slot": "menu-trigger" }).attrs["aria-controls"]).toBe(content.attrs.id);
  const items = tags(html, { "data-slot": "menu-item" });
  expect(items.map((item) => item.attrs.role)).toStrictEqual(["menuitem", "menuitem"]);
  expect(items.map((item) => item.attrs["data-variant"])).toStrictEqual(["default", "destructive"]);
  expect(tag(html, { "data-slot": "menu-separator" }).attrs.class).toContain("bg-border");
  expect(text(html)).toContain("F2");
});

it("Menu on the server renders checked state and indicators for checkbox and radio items", () => {
  const { html } = renderServer(() => (
    <Menu defaultOpen>
      <MenuTrigger>View</MenuTrigger>
      <MenuContent>
        <MenuCheckboxItem value="minimap" defaultChecked>
          Minimap
        </MenuCheckboxItem>
        <MenuRadioGroup defaultValue="asc">
          <MenuRadioItem value="asc">Ascending</MenuRadioItem>
          <MenuRadioItem value="desc">Descending</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  ));

  expect(tag(html, { "data-slot": "menu-checkbox-item" }).attrs["aria-checked"]).toBe("true");
  expect(tags(html, { "data-slot": "menu-radio-item" }).map((item) => item.attrs["aria-checked"])).toStrictEqual([
    "true",
    "false",
  ]);
  expect(tags(html, { "data-slot": "menu-item-indicator" }).length).toBeGreaterThanOrEqual(2);
});
