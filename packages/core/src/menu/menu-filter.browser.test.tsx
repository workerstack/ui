import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { settled, style, token } from "../test/browser.ts";
import { required } from "../test/required.ts";
import { InsetMenu } from "./__fixtures__/inset-menu.fixture.tsx";
import { ProjectMenu } from "./__fixtures__/project-menu.fixture.tsx";

afterEach(cleanup);

/** The menu on screen, once it has settled. */
async function shownMenu(): Promise<Element> {
  await vi.waitFor(() => expect(document.querySelector('[role="menu"]:popover-open')).not.toBeNull());
  const menu = required(document.querySelector('[role="menu"]:popover-open'), "an open menu");
  await settled(menu);

  return menu;
}

/** The left edge of the first text an element shows. */
function textLeft(el: Element): number {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    if ((node.textContent ?? "").trim() === "") continue;
    const range = document.createRange();
    range.selectNodeContents(node);

    return range.getBoundingClientRect().left;
  }

  throw new Error("expected an element with text");
}

it("MenuFilter takes the typing when the menu opens, so typeahead does not jump to an item", async () => {
  render(() => <ProjectMenu />);
  await userEvent.click(page.getByRole("button", { name: "Move to project" }));
  await shownMenu();
  const filter = page.getByRole("searchbox", { name: "Filter" });
  // "o" starts "Onboarding": the menu's typeahead would highlight it and take the focus.
  await userEvent.keyboard("on");
  await expect.element(filter).toHaveValue("on");
  expect(document.activeElement).toBe(filter.element());
  await expect.element(page.getByRole("menuitem", { name: "Onboarding" })).toHaveAttribute("data-highlighted");
});

it("MenuFilter keeps Space and the side arrows for the text", async () => {
  render(() => <ProjectMenu />);
  await userEvent.click(page.getByRole("button", { name: "Move to project" }));
  await shownMenu();
  await userEvent.keyboard("caf{ArrowLeft}x{ArrowRight}e redesign");
  await expect.element(page.getByRole("searchbox", { name: "Filter" })).toHaveValue("caxfe redesign");
});

it("MenuFilter leaves the arrow keys to the items", async () => {
  render(() => <ProjectMenu />);
  await userEvent.click(page.getByRole("button", { name: "Move to project" }));
  await shownMenu();
  // Every project has an "a": all match, and the first one is highlighted.
  await userEvent.keyboard("a");
  const cafe = page.getByRole("menuitem", { name: "Café redesign" });
  const payments = page.getByRole("menuitem", { name: "Payments" });
  await expect.element(cafe).toHaveAttribute("data-highlighted");
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(payments).toHaveAttribute("data-highlighted");
  await expect.element(cafe).not.toHaveAttribute("data-highlighted");
  await userEvent.keyboard("{ArrowUp}");
  await expect.element(cafe).toHaveAttribute("data-highlighted");
});

it("MenuItem inset lines its text up with the text of an item that shows a check", async () => {
  render(() => <InsetMenu />);
  await userEvent.click(page.getByRole("button", { name: "Actions" }));
  const menu = await shownMenu();
  const checked = textLeft(page.getByRole("menuitemcheckbox", { name: "Pinned" }).element());
  expect(textLeft(page.getByRole("menuitem", { name: "Rename" }).element())).toBe(checked);
  expect(textLeft(page.getByRole("menuitem", { name: "Docs" }).element())).toBe(checked);
  expect(textLeft(page.getByRole("menuitem", { name: "Share" }).element())).toBe(checked);
  expect(textLeft(page.getByText("Account").element())).toBe(checked);
  expect(textLeft(page.getByText("View").element())).toBe(checked);
  expect(textLeft(page.getByRole("menuitem", { name: "Plain" }).element())).toBeLessThan(checked);
  expect(menu.querySelectorAll('[role="menuitem"]').length).toBeGreaterThan(0);
});

it("MenuShortcut turns foreground on a highlighted item", async () => {
  render(() => <InsetMenu />);
  await userEvent.click(page.getByRole("button", { name: "Actions" }));
  await shownMenu();
  const plain = page.getByRole("menuitem", { name: "Plain" });
  const shortcut = required(plain.element().querySelector('[data-slot="menu-shortcut"]'), "the shortcut");
  expect(style(shortcut).color).toBe(token("--ui-muted-foreground"));
  await userEvent.hover(plain);
  await expect.element(plain).toHaveAttribute("data-highlighted");
  await vi.waitFor(() => expect(style(shortcut).color).toBe(token("--ui-foreground")));
});
