import { expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../test/hydration.ts";
import { required } from "../test/required.ts";
import {
  SelectFixture,
  SelectItemsContentFixture,
  SelectItemsFixture,
  SelectOpenFixture,
} from "./__fixtures__/select.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/select.hydration.fixture.tsx", import.meta.url), {
  SelectFixture,
  SelectItemsContentFixture,
  SelectItemsFixture,
  SelectOpenFixture,
});

const CLIENT_SIDE: Parameters<typeof mismatch>[1] = ["warnings", "replaced", "added"];
const NOTHING_LOST: Parameters<typeof mismatch>[1] = ["warnings", "replaced"];
const LISTBOX = /role="listbox"/g;
const ROLE = { name: "Role" };

function listboxes(): Element[] {
  return [...document.querySelectorAll('[role="listbox"]')];
}

function visible(els: Element[]): Element[] {
  return els.filter((el) => el.checkVisibility());
}

function popoverOpen(els: Element[]): Element[] {
  return els.filter((el) => el.matches(":popover-open"));
}

// UI SDK 0.1.0-beta.2 renders a closed SelectContent on the client (its items register through it)
// but not on the server, so hydration adds the closed, hidden popup. Nothing shows or shifts, but
// the two renders disagree. Drop `.fails` when fixed.
it.fails("hydrating Select claims the server's nodes and adds none (items as children)", async () => {
  expect(mismatch(await hydrate("SelectFixture"), CLIENT_SIDE)).toStrictEqual({});
});

it("hydrating Select claims the server's nodes without warnings (items as children)", async () => {
  expect(mismatch(await hydrate("SelectFixture"), NOTHING_LOST)).toStrictEqual({});
});

it("hydrating Select claims the server's nodes without warnings (`items`)", async () => {
  expect(mismatch(await hydrate("SelectItemsFixture"), CLIENT_SIDE)).toStrictEqual({});
});

it("hydrating Select claims the server's nodes without warnings (`items` and a SelectContent)", async () => {
  expect(mismatch(await hydrate("SelectItemsContentFixture"), CLIENT_SIDE)).toStrictEqual({});
});

it("hydrating Select opens and picks from the server's trigger", async () => {
  const hydrated = await hydrate("SelectFixture");
  const trigger = required(hydrated.container.querySelector('[role="combobox"]'), "the server's trigger");
  await userEvent.click(page.getByRole("combobox", ROLE));
  await userEvent.click(page.getByRole("option", { name: "Editor" }));
  await expect.element(page.getByRole("status")).toHaveTextContent("editor");
  await expect.element(page.getByRole("combobox", ROLE)).toHaveTextContent("Editor");
  expect(hydrated.container.querySelector('[role="combobox"]')).toBe(trigger);
});

it("hydrating Select shows the label from `items` on the server and after hydration", async () => {
  const hydrated = await hydrate("SelectItemsContentFixture");
  expect(hydrated.server.html).toContain(">Editor<");
  await expect.element(page.getByRole("combobox", ROLE)).toHaveTextContent("Editor");
});

it("hydrating Select renders one listbox for `items` with its own SelectContent", async () => {
  await hydrate("SelectItemsContentFixture");
  await userEvent.click(page.getByRole("combobox", ROLE));
  await vi.waitFor(() => expect(visible(listboxes())).toHaveLength(1));
  expect(listboxes()).toHaveLength(1);
});

// UI SDK 0.1.0-beta.2: with `items` and a SelectContent of its own, an open Select renders two
// listboxes on the server, both id="…-content". SelectContent tells the Select it has content by
// writing a signal while rendering; on the server that write is inert (SERVER_WRITE), so the
// Select renders its default SelectContent too. Hydration then drops one. Drop `.fails` when fixed.
it.fails("hydrating Select gets one listbox from the server for an open select", async () => {
  const hydrated = await hydrate("SelectOpenFixture");
  expect(hydrated.server.html.match(LISTBOX)).toHaveLength(1);
});

it.fails("hydrating Select claims the server's nodes of an open select", async () => {
  expect(mismatch(await hydrate("SelectOpenFixture"), NOTHING_LOST)).toStrictEqual({});
});

it("hydrating Select makes an open select one open popup whose items work", async () => {
  const hydrated = await hydrate("SelectOpenFixture");
  expect(hydrated.warnings).toStrictEqual([]);
  await vi.waitFor(() => expect(popoverOpen(listboxes())).toHaveLength(1));
  expect(listboxes()).toHaveLength(1);
  await userEvent.click(page.getByRole("option", { name: "Viewer" }));
  await expect.element(page.getByRole("combobox", ROLE)).toHaveTextContent("Viewer");
});
