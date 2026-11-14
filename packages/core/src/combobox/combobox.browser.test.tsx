import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { drawnIcon, glyph, part, rect, settled, style, token } from "../test/browser.ts";
import { required } from "../test/required.ts";
import { CreateCombobox } from "./__fixtures__/create-combobox.fixture.tsx";
import { FruitCombobox, type FruitValueChange } from "./__fixtures__/fruit-combobox.fixture.tsx";
import { TagCombobox } from "./__fixtures__/tag-combobox.fixture.tsx";

afterEach(cleanup);

/** Slack for subpixel layout when comparing widths. */
const SUBPIXEL = 0.5;

function input(name = "Fruit"): ReturnType<typeof page.getByRole> {
  return page.getByRole("combobox", { name });
}

function listbox(): ReturnType<typeof page.getByRole> {
  return page.getByRole("listbox");
}

/** The box that holds the input, the clear button and the chevron. */
function box(name = "Fruit"): Element {
  const group = input(name).element().closest('[data-slot="combobox-group"]');

  return required(group, "the input inside its box");
}

/** The popup that holds the listbox, which is what opens and closes. */
function popup(): Element {
  return required(listbox().element().closest('[data-slot="combobox-content"]'), "the listbox inside the popup");
}

/** Waits until the listbox has closed. */
async function closed(): Promise<void> {
  await expect.poll(() => listbox().query()?.checkVisibility() ?? false).toBe(false);
}

/** Opens the list by clicking the input and waits until the listbox has settled. */
async function openWithClick(): Promise<void> {
  await userEvent.click(input());
  await expect.element(listbox()).toBeVisible();
  await settled(popup());
}

it("Combobox opens in the top layer, below the box and at least as wide", async () => {
  render(() => <FruitCombobox />);
  await openWithClick();
  const content = popup();
  expect(content.matches(":popover-open")).toBe(true);
  const anchor = rect(box());
  const popupBox = rect(content);
  expect(popupBox.top).toBeGreaterThanOrEqual(anchor.bottom);
  expect(popupBox.width).toBeGreaterThanOrEqual(anchor.width - SUBPIXEL);
  expect(style(content).backgroundColor).toBe(token("--ui-background"));
});

it("Combobox filters as you really type and picks with Enter", async () => {
  const onValueChange = vi.fn<FruitValueChange>();
  render(() => <FruitCombobox onValueChange={onValueChange} />);
  await userEvent.click(input());
  await userEvent.keyboard("ban");
  await expect.element(page.getByRole("option", { name: "Banana" })).toBeVisible();
  expect(page.getByRole("option", { name: "Apple" }).query()).toBeNull();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect.element(input()).toHaveValue("Banana");
  expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("banana");
  await closed();
});

it("Combobox shows the no results text when typing matches nothing", async () => {
  render(() => <FruitCombobox />);
  await userEvent.click(input());
  await userEvent.keyboard("zzz");
  await expect.element(page.getByText("No results")).toBeVisible();
  expect(listbox().query()).not.toBeNull();
});

it("Combobox closes on Escape", async () => {
  render(() => <FruitCombobox />);
  await openWithClick();
  await userEvent.keyboard("{Escape}");
  await closed();
  await expect.element(input()).toHaveFocus();
});

it("Combobox closes on a click outside", async () => {
  render(() => <FruitCombobox />);
  await openWithClick();
  await userEvent.click(document.body, { position: { x: 900, y: 700 } });
  await closed();
  expect(listbox().query()?.checkVisibility() ?? false).toBe(false);
});

it("Combobox draws the chevron after the input with UI SDK's icon", () => {
  render(() => <FruitCombobox />);
  const trigger = part(box(), "combobox-trigger");
  expect(drawnIcon(trigger, "::after")).toBe(glyph("--ui-icon-chevron"));
});

it("Combobox draws the box and its focus ring like an Input", async () => {
  render(() => <FruitCombobox />);
  const group = box();
  expect(style(group).borderTopColor).toBe(token("--ui-input"));
  expect(style(group).height).toBe("36px");
  await userEvent.click(input());
  await vi.waitFor(() => expect(style(group).borderTopColor).toBe(token("--ui-ring")));
  expect(style(group).boxShadow).not.toBe("none");
});

it("Combobox draws a check in the selected option", async () => {
  render(() => <FruitCombobox defaultValue="cherry" />);
  await openWithClick();
  const cherry = page.getByRole("option", { name: "Cherry" }).element();
  expect(drawnIcon(part(cherry, "combobox-item-indicator"), "::before")).toBe(glyph("--ui-icon-check"));
});

it("Combobox highlights the option under the arrow keys", async () => {
  render(() => <FruitCombobox />);
  await openWithClick();
  await userEvent.keyboard("{ArrowDown}");
  const first = page.getByRole("option", { name: "Apple" });
  await expect.element(first).toHaveAttribute("data-highlighted");
  expect(style(first.element()).backgroundColor).toBe(token("--ui-muted"));
});

it("Combobox draws an × in the clear button", async () => {
  render(() => <FruitCombobox defaultValue="apple" showClear />);
  const clear = page.getByRole("button", { name: "Clear" }).element();
  expect(drawnIcon(clear, "::before")).toBe(glyph("--ui-icon-x"));
  await userEvent.click(clear);
  await expect.element(input()).toHaveValue("");
});

it("Combobox draws the create row with a plus and a disabled hint", async () => {
  render(() => <CreateCombobox />);
  await userEvent.click(input("Label"));
  const hint = page.getByRole("option", { name: "Type to create an option" });
  await expect.element(hint).toBeVisible();
  const plus = required(hint.element().querySelector('[data-icon="plus"]'), "the hint's plus");
  expect(drawnIcon(plus, "::before")).toBe(glyph("--ui-icon-plus"));
  await userEvent.keyboard("Docs");
  await expect.element(page.getByRole("option", { name: "Create “Docs”" })).toBeVisible();
});

it("Combobox multiple draws chips with an × to remove each and a popup as wide as the chips box", async () => {
  render(() => <TagCombobox defaultValue={["bug"]} />);
  const chip = page.getByRole("button", { name: "Remove" }).element();
  expect(drawnIcon(chip, "::before")).toBe(glyph("--ui-icon-x"));
  await userEvent.click(input("Tags"));
  await expect.element(listbox()).toBeVisible();
  await settled(popup());
  const chips = rect(part(document.body, "combobox-chips"));
  const popupBox = rect(popup());
  expect(popupBox.top).toBeGreaterThanOrEqual(chips.bottom);
  expect(popupBox.width).toBeGreaterThanOrEqual(chips.width - SUBPIXEL);
});

it("Combobox multiple adds a chip with a real click and keeps the list open", async () => {
  render(() => <TagCombobox />);
  await userEvent.click(input("Tags"));
  await userEvent.click(page.getByRole("option", { name: "Feature" }));
  await expect.element(page.getByRole("button", { name: "Remove" })).toBeVisible();
  await expect.element(listbox()).toBeVisible();
});
