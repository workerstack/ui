import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { rect, settled, style, token } from "../../test/browser.ts";
import { required } from "../../test/required.ts";
import { FileMenu } from "./__fixtures__/file-menu.fixture.tsx";
import type { MenuProps } from "./index.ts";

afterEach(cleanup);

/** How far a submenu may overlap its trigger item, in px. */
const SUBMENU_OVERLAP = 8;

function trigger(): ReturnType<typeof page.getByRole> {
  return page.getByRole("button", { name: "Actions" });
}

/** The menus on screen: the root menu, then any open submenu. */
function menus(): Element[] {
  return [...document.querySelectorAll('[role="menu"]')].filter((el) => el.checkVisibility());
}

/** The one menu on screen. */
function menu(): Element {
  return required(menus()[0], "an open menu");
}

/** Opens the menu with a real click and waits until it has settled. */
async function openWithClick(): Promise<void> {
  await userEvent.click(trigger());
  await vi.waitFor(() => expect(menus()).toHaveLength(1));
  await settled(menu());
}

it("Menu opens below its trigger in the top layer", async () => {
  render(() => <FileMenu />);
  await openWithClick();
  expect(menu().matches(":popover-open")).toBe(true);
  expect(rect(menu()).top).toBeGreaterThanOrEqual(rect(trigger().element()).bottom);
  expect(style(menu()).backgroundColor).toBe(token("--ui-background"));
});

it("Menu highlights the item under the pointer", async () => {
  render(() => <FileMenu />);
  await openWithClick();
  const rename = page.getByRole("menuitem", { name: "Rename" });
  await userEvent.hover(rename);
  await expect.element(rename).toHaveAttribute("data-highlighted");
  expect(style(rename.element()).backgroundColor).toBe(token("--ui-muted"));
});

it("Menu is driven by the keyboard: open on the first item, move, choose, focus back", async () => {
  const onAction = vi.fn<NonNullable<MenuProps["onAction"]>>();
  render(() => <FileMenu onAction={onAction} />);
  await userEvent.tab();
  await userEvent.keyboard("{ArrowDown}");
  await vi.waitFor(() => expect(menus()).toHaveLength(1));
  await expect.element(page.getByRole("menuitem", { name: "Rename" })).toHaveAttribute("data-highlighted");
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await vi.waitFor(() => expect(onAction).toHaveBeenCalledExactlyOnceWith("duplicate", expect.anything()));
  await vi.waitFor(() => expect(menus()).toHaveLength(0));
  expect(document.activeElement).toBe(trigger().element());
});

it("Menu opens a submenu beside its trigger with ArrowRight and closes it with ArrowLeft", async () => {
  render(() => <FileMenu />);
  await openWithClick();
  const share = page.getByRole("menuitem", { name: "Share" });
  await userEvent.hover(share);
  await userEvent.keyboard("{ArrowRight}");
  await vi.waitFor(() => expect(menus()).toHaveLength(2));
  const email = page.getByRole("menuitem", { name: "Email" }).element();
  const sub = required(email.closest('[role="menu"]'), "the submenu");
  await settled(sub);
  expect(rect(sub).left).toBeGreaterThanOrEqual(rect(share.element()).right - SUBMENU_OVERLAP);
  await userEvent.keyboard("{ArrowLeft}");
  await vi.waitFor(() => expect(menus()).toHaveLength(1));
});

it("Menu paints a destructive item red", async () => {
  render(() => <FileMenu />);
  await openWithClick();
  expect(style(page.getByRole("menuitem", { name: "Delete" }).element()).color).toBe(token("--ui-destructive"));
});

it("Menu closes on Escape and on a click outside", async () => {
  render(() => <FileMenu />);
  await openWithClick();
  await userEvent.keyboard("{Escape}");
  await vi.waitFor(() => expect(menus()).toHaveLength(0));
  await openWithClick();
  await userEvent.click(document.body, { position: { x: 900, y: 700 } });
  await vi.waitFor(() => expect(menus()).toHaveLength(0));
});
