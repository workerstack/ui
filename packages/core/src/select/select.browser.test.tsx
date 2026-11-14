import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { drawnIcon, glyph, part, rect, settled, style, token } from "../test/browser.ts";
import { RoleSelect, type RoleSelectProps } from "./__fixtures__/role-select.fixture.tsx";

afterEach(cleanup);

/** Slack for subpixel layout when comparing widths. */
const SUBPIXEL = 0.5;

function trigger(): ReturnType<typeof page.getByRole> {
  return page.getByRole("combobox", { name: "Role" });
}

function listbox(): ReturnType<typeof page.getByRole> {
  return page.getByRole("listbox");
}

/** Waits until the listbox has closed. */
async function closed(): Promise<void> {
  await vi.waitFor(() => expect(listbox().query()?.checkVisibility() ?? false).toBe(false));
}

/** Opens the select with a real click and waits until its listbox has settled. */
async function openWithClick(): Promise<void> {
  await userEvent.click(trigger());
  await expect.element(listbox()).toBeVisible();
  await settled(listbox().element());
}

it("Select opens in the top layer, below the trigger and at least as wide", async () => {
  render(() => <RoleSelect />);
  await openWithClick();
  const popup = listbox().element();
  expect(popup.matches(":popover-open")).toBe(true);
  const anchor = rect(trigger().element());
  const box = rect(popup);
  expect(box.top).toBeGreaterThanOrEqual(anchor.bottom);
  expect(box.width).toBeGreaterThanOrEqual(anchor.width - SUBPIXEL);
  expect(style(popup).backgroundColor).toBe(token("--ui-background"));
});

it("Select picks an item with a real click, closes and keeps focus on the trigger", async () => {
  const onValueChange = vi.fn<NonNullable<RoleSelectProps["onValueChange"]>>();
  render(() => <RoleSelect onValueChange={onValueChange} />);
  await openWithClick();
  await userEvent.click(page.getByRole("option", { name: "Editor" }));
  await expect.element(trigger()).toHaveTextContent("Editor");
  expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("editor");
  await closed();
  expect(document.activeElement).toBe(trigger().element());
});

it("Select is driven by the keyboard: open, move, highlight and choose", async () => {
  render(() => <RoleSelect defaultValue="viewer" />);
  await userEvent.tab();
  expect(document.activeElement).toBe(trigger().element());
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(listbox()).toBeVisible();
  await userEvent.keyboard("{ArrowDown}");
  const editor = page.getByRole("option", { name: "Editor" });
  await expect.element(editor).toHaveAttribute("data-highlighted");
  expect(style(editor.element()).backgroundColor).toBe(token("--ui-muted"));
  await userEvent.keyboard("{Enter}");
  await expect.element(trigger()).toHaveTextContent("Editor");
});

it("Select closes on Escape and on a click outside", async () => {
  render(() => <RoleSelect />);
  await openWithClick();
  await userEvent.keyboard("{Escape}");
  await closed();
  await openWithClick();
  await userEvent.click(document.body, { position: { x: 900, y: 700 } });
  await vi.waitFor(() => expect(listbox().query()?.checkVisibility() ?? false).toBe(false));
});

it("Select draws the placeholder muted and the chevron after it", () => {
  render(() => <RoleSelect />);
  expect(style(part(trigger().element(), "select-value")).color).toBe(token("--ui-muted-foreground"));
  expect(drawnIcon(trigger().element(), "::after")).toBe(glyph("--ui-icon-chevron"));
});

it("Select draws a check in the selected item", async () => {
  render(() => <RoleSelect defaultValue="admin" />);
  await openWithClick();
  const admin = page.getByRole("option", { name: "Admin" }).element();
  expect(drawnIcon(part(admin, "select-item-indicator"), "::before")).toBe(glyph("--ui-icon-check"));
});
