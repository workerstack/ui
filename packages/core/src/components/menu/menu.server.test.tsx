import { expect, it } from "vitest";

import { renderServer, slot, slots, text } from "../../test/server.ts";
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

  const trigger = slot(html, "menu-trigger");
  expect(trigger.attrs["aria-haspopup"]).toBe("menu");
  expect(trigger.attrs["aria-expanded"]).toBe("false");
  expect(slots(html, "menu-content")).toStrictEqual([]);
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

  const content = slot(html, "menu-content");
  expect(content.attrs.role).toBe("menu");
  expect(content.attrs.class).toContain("bg-popover");
  expect(slot(html, "menu-trigger").attrs["aria-controls"]).toBe(content.attrs.id);
  const items = slots(html, "menu-item");
  expect(items.map((item) => item.attrs.role)).toStrictEqual(["menuitem", "menuitem"]);
  expect(items.map((item) => item.attrs["data-variant"])).toStrictEqual(["default", "destructive"]);
  expect(slot(html, "menu-separator").attrs.class).toContain("bg-border");
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

  expect(slot(html, "menu-checkbox-item").attrs["aria-checked"]).toBe("true");
  expect(slots(html, "menu-radio-item").map((item) => item.attrs["aria-checked"])).toStrictEqual(["true", "false"]);
  expect(slots(html, "menu-item-indicator").length).toBeGreaterThanOrEqual(2);
});
