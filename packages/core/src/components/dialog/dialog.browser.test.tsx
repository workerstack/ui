import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { drawnIcon, glyph, rect, settled, style, token } from "../../test/browser.ts";
import { required } from "../../test/required.ts";
import { ShareDialog } from "./__fixtures__/share-dialog.fixture.tsx";

afterEach(cleanup);

/** How many times the focus-trap test presses Tab: more than the dialog has stops. */
const TAB_PRESSES = 5;

function dialog(): ReturnType<typeof page.getByRole> {
  return page.getByRole("dialog");
}

function trigger(): ReturnType<typeof page.getByRole> {
  return page.getByRole("button", { name: "Share" });
}

function shown(): boolean {
  return dialog().query()?.checkVisibility() ?? false;
}

/** Waits until the dialog has closed. */
async function closed(): Promise<void> {
  await vi.waitFor(() => expect(shown()).toBe(false));
}

/** Opens the dialog with a real click and waits until it has settled. */
async function open(): Promise<void> {
  await userEvent.click(trigger());
  await expect.element(dialog()).toBeVisible();
  await settled(document.body);
}

function focusInside(): boolean {
  return dialog().element().contains(document.activeElement);
}

/** Presses Tab `times` times, one after another; false as soon as focus leaves the dialog. */
async function tabStaysInside(times: number): Promise<boolean> {
  if (times === 0) return true;

  await userEvent.tab();

  return focusInside() && tabStaysInside(times - 1);
}

it("Dialog centers its window over a backdrop that covers the viewport", async () => {
  render(() => <ShareDialog />);
  await open();
  const box = rect(dialog().element());
  expect(box.left + box.width / 2).toBeCloseTo(innerWidth / 2, 0);
  expect(box.top + box.height / 2).toBeCloseTo(innerHeight / 2, 0);
  expect(box.width).toBe(512);
  const backdrop = required(document.querySelector('[data-slot="dialog-backdrop"]'), "a dialog backdrop");
  expect(rect(backdrop)).toMatchObject({ height: innerHeight, left: 0, top: 0, width: innerWidth });
  expect(style(backdrop).backgroundColor).toBe(token("--ui-overlay"));
  expect(style(dialog().element()).backgroundColor).toBe(token("--ui-background"));
});

it("Dialog moves focus into the dialog and keeps Tab inside it", async () => {
  render(() => <ShareDialog />);
  await open();
  expect(focusInside()).toBe(true);
  expect(await tabStaysInside(TAB_PRESSES)).toBe(true);
});

it("Dialog closes on Escape and gives focus back to the trigger", async () => {
  render(() => <ShareDialog />);
  await open();
  await userEvent.keyboard("{Escape}");
  await closed();
  expect(document.activeElement).toBe(trigger().element());
});

it("Dialog closes from the corner × and from a DialogClose", async () => {
  render(() => <ShareDialog />);
  await open();
  const corner = page.getByRole("button", { name: "Close" });
  expect(drawnIcon(corner.element(), "::before")).toBe(glyph("--ui-icon-x"));
  expect(rect(corner.element())).toMatchObject({ height: 24, width: 24 });
  await userEvent.click(corner);
  await closed();
  await open();
  await userEvent.click(page.getByRole("button", { name: "Done" }));
  await closed();
});

it("Dialog closes on a click on the backdrop", async () => {
  render(() => <ShareDialog />);
  await open();
  await userEvent.click(document.body, { position: { x: 10, y: 10 } });
  await vi.waitFor(() => expect(shown()).toBe(false));
});

it("Dialog puts the × 16px inside the padding box's top right corner", async () => {
  render(() => <ShareDialog />);
  await open();
  const box = rect(dialog().element());
  const close = rect(page.getByRole("button", { name: "Close" }).element());
  const border = Number.parseFloat(style(dialog().element()).borderTopWidth);
  expect(box.right - border - close.right).toBeCloseTo(16, 0);
  expect(close.top - box.top - border).toBeCloseTo(16, 0);
});
