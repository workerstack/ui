import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted } from "../../test/dom.ts";
import {
  Menu,
  MenuCheckboxItem,
  type MenuCheckboxItemProps,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  type MenuProps,
  MenuRadioGroup,
  type MenuRadioGroupProps,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "./index.ts";

afterEach(cleanup);

type OnAction = NonNullable<MenuProps["onAction"]>;

type OnCheckedChange = NonNullable<MenuCheckboxItemProps["onCheckedChange"]>;

type OnValueChange = NonNullable<MenuRadioGroupProps["onValueChange"]>;

/** The menu on screen, if one is shown. */
function visibleMenu(): HTMLElement | undefined {
  return screen.queryAllByRole("menu").find((el) => el.checkVisibility());
}

/** Opens the menu from its Actions trigger and waits until it shows. */
async function open(): Promise<void> {
  await mounted();
  fireEvent.click(screen.getByRole("button", { name: "Actions" }));
  await vi.waitFor(() => expect(visibleMenu()).toBeDefined());
}

it("Menu runs onAction with the chosen item's value and closes", async () => {
  const onAction = vi.fn<OnAction>();
  render(() => (
    <Menu onAction={onAction}>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem value="rename">Rename</MenuItem>
        <MenuSeparator />
        <MenuItem value="delete" variant="destructive">
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ));
  await open();
  const remove = screen.getByRole("menuitem", { name: "Delete" });
  expect(remove.getAttribute("data-variant")).toBe("destructive");
  expect(remove.className).toContain("text-destructive");
  fireEvent.click(remove);
  await vi.waitFor(() => expect(onAction).toHaveBeenCalledExactlyOnceWith("delete", expect.anything()));
  await vi.waitFor(() => expect(visibleMenu()).toBeUndefined());
});

it("Menu toggles a checkbox item and shows its check", async () => {
  const onCheckedChange = vi.fn<OnCheckedChange>();
  render(() => (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>View</MenuGroupLabel>
          <MenuCheckboxItem value="minimap" onCheckedChange={onCheckedChange}>
            Minimap
          </MenuCheckboxItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  ));
  await open();
  const minimap = screen.getByRole("menuitemcheckbox", { name: "Minimap" });
  expect(minimap.getAttribute("aria-checked")).toBe("false");
  fireEvent.click(minimap);
  await vi.waitFor(() => expect(minimap.getAttribute("aria-checked")).toBe("true"));
  expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true);
  await vi.waitFor(() =>
    expect(minimap.querySelector('[data-slot="menu-item-indicator"]')?.checkVisibility()).toBe(true),
  );
  expect(visibleMenu()).toBeDefined();
});

it("Menu chooses one radio item in a group", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuRadioGroup defaultValue="asc" onValueChange={onValueChange}>
          <MenuRadioItem value="asc">Ascending</MenuRadioItem>
          <MenuRadioItem value="desc">Descending</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  ));
  await open();
  const asc = screen.getByRole("menuitemradio", { name: "Ascending" });
  const desc = screen.getByRole("menuitemradio", { name: "Descending" });
  expect(asc.getAttribute("aria-checked")).toBe("true");
  fireEvent.click(desc);
  await vi.waitFor(() => expect(desc.getAttribute("aria-checked")).toBe("true"));
  expect(asc.getAttribute("aria-checked")).toBe("false");
  expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("desc");
});
