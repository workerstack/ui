import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted } from "../test/dom.ts";
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLabel,
  MenuLinkItem,
  type MenuProps,
  MenuSeparator,
  MenuTrigger,
} from "./index.ts";

afterEach(cleanup);

type OnAction = NonNullable<MenuProps["onAction"]>;

/** Opens the menu from its Actions trigger and waits until it shows. */
async function open(): Promise<void> {
  await mounted();
  fireEvent.click(screen.getByRole("button", { name: "Actions" }));
  await vi.waitFor(() => expect(screen.queryAllByRole("menu").some((el) => el.checkVisibility())).toBe(true));
}

it("MenuLabel renders a label that names no group", async () => {
  render(() => (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuLabel>ada@example.com</MenuLabel>
        <MenuSeparator />
        <MenuItem value="sign-out">Sign out</MenuItem>
      </MenuContent>
    </Menu>
  ));
  await open();
  const label = screen.getByText("ada@example.com");
  expect(label.getAttribute("data-slot")).toBe("menu-label");
  expect(screen.queryByRole("group")).toBeNull();
  expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeDefined();
});

it("MenuGroupLabel names its group", async () => {
  render(() => (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>Appearance</MenuGroupLabel>
          <MenuItem value="theme">Theme</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  ));
  await open();
  expect(screen.getByRole("group", { name: "Appearance" })).toBeDefined();
});

it("MenuLinkItem renders a link with the item's role that keeps the menu open", async () => {
  const onAction = vi.fn<OnAction>();
  const onClick = vi.fn<(event: MouseEvent) => void>((event) => event.preventDefault());
  render(() => (
    <Menu onAction={onAction}>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuLinkItem value="docs" href="#docs" onClick={onClick}>
          Docs
        </MenuLinkItem>
      </MenuContent>
    </Menu>
  ));
  await open();
  const docs = screen.getByRole("menuitem", { name: "Docs" });
  expect(docs.tagName).toBe("A");
  expect(docs.getAttribute("href")).toBe("#docs");
  fireEvent.click(docs);
  expect(onClick).toHaveBeenCalledOnce();
  await vi.waitFor(() => expect(onAction).toHaveBeenCalledExactlyOnceWith("docs", expect.anything()));
  expect(screen.getByRole("menuitem", { name: "Docs" }).checkVisibility()).toBe(true);
});

it("MenuLinkItem closes the menu with closeOnSelect", async () => {
  render(() => (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuLinkItem href="#docs" closeOnSelect onClick={(event) => event.preventDefault()}>
          Docs
        </MenuLinkItem>
      </MenuContent>
    </Menu>
  ));
  await open();
  fireEvent.click(screen.getByRole("menuitem", { name: "Docs" }));
  await vi.waitFor(() => expect(screen.queryAllByRole("menu").some((el) => el.checkVisibility())).toBe(false));
});
