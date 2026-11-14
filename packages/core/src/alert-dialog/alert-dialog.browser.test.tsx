import { render } from "@solidjs/testing-library";
import { expect, it, onTestFinished, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { rect, settled, style, token } from "../test/browser.ts";
import { required } from "../test/required.ts";
import { DeleteDialog } from "./__fixtures__/delete-dialog.fixture.tsx";

/** How many times the focus-trap test presses Tab: more than the dialog has stops. */
const TAB_PRESSES = 5;

function alertDialog(): ReturnType<typeof page.getByRole> {
  return page.getByRole("alertdialog");
}

/** Renders the fixture, opens it with a real click and waits until it has settled. */
async function openAlertDialog(): Promise<Element> {
  const view = render(() => <DeleteDialog />);
  await userEvent.click(page.getByRole("button", { name: "Delete" }));
  await expect.element(alertDialog()).toBeVisible();
  await settled(document.body);
  onTestFinished(view.unmount);

  return alertDialog().element();
}

/** Presses Tab `times` more times and lists whether focus was inside the dialog after each press. */
async function focusAfterEachTab(dialog: Element, times: number, seen: boolean[] = []): Promise<boolean[]> {
  if (times === 0) return seen;

  await userEvent.tab();

  return focusAfterEachTab(dialog, times - 1, [...seen, dialog.contains(document.activeElement)]);
}

it("AlertDialog centers its window over a backdrop that uses the overlay token", async () => {
  const dialog = await openAlertDialog();
  const box = rect(dialog);
  expect(box.left + box.width / 2).toBeCloseTo(innerWidth / 2, 0);
  expect(box.top + box.height / 2).toBeCloseTo(innerHeight / 2, 0);
  const backdrop = required(document.querySelector('[data-slot="alert-dialog-backdrop"]'), "a backdrop");
  expect(rect(backdrop)).toMatchObject({ height: innerHeight, left: 0, top: 0, width: innerWidth });
  expect(style(backdrop).backgroundColor).toBe(token("--ui-overlay"));
  expect(style(dialog).backgroundColor).toBe(token("--ui-background"));
});

it("AlertDialog keeps Tab inside the dialog", async () => {
  const dialog = await openAlertDialog();
  expect(dialog.contains(document.activeElement)).toBe(true);
  expect(await focusAfterEachTab(dialog, TAB_PRESSES)).toStrictEqual(Array.from({ length: TAB_PRESSES }, () => true));
});

it("AlertDialog closes on Escape and gives focus back to the trigger", async () => {
  await openAlertDialog();
  await userEvent.keyboard("{Escape}");
  await vi.waitFor(() => expect(alertDialog().query()?.checkVisibility() ?? false).toBe(false));
  expect(document.activeElement).toBe(page.getByRole("button", { name: "Delete" }).element());
});

it("AlertDialog stays open on a click on the backdrop", async () => {
  const dialog = await openAlertDialog();
  await userEvent.click(document.body, { position: { x: 10, y: 10 } });
  await settled(document.body);
  expect(dialog.checkVisibility()).toBe(true);
});
