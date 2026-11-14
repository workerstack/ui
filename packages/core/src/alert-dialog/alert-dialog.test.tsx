import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted } from "../test/dom.ts";
import { required } from "../test/required.ts";
import { DeleteDialog } from "./__fixtures__/delete-dialog.fixture.tsx";

afterEach(cleanup);

/** The alert dialog on screen, if one is shown. */
function visibleDialog(): HTMLElement | undefined {
  return screen.queryAllByRole("alertdialog").find((el) => el.checkVisibility());
}

/** Opens the alert dialog from its trigger and waits until it shows. */
async function open(): Promise<void> {
  await mounted();
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeDefined());
}

it("AlertDialog opens from its trigger as an alertdialog named and described by its parts", async () => {
  render(() => <DeleteDialog />);
  await mounted();
  expect(visibleDialog()).toBeUndefined();
  await open();
  const dialog = required(visibleDialog(), "a visible alert dialog");
  expect(dialog.getAttribute("aria-labelledby")).toBe(screen.getByText("Delete file?").id);
  expect(dialog.getAttribute("aria-describedby")).toBe(screen.getByText("This cannot be undone.").id);
  expect(dialog.className).toContain("rounded-lg");
});

it("AlertDialog has no corner close button", async () => {
  render(() => <DeleteDialog />);
  await open();
  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  expect(screen.getAllByRole("button").map((el) => el.textContent)).toContain("Keep");
});

it("AlertDialog moves focus into the dialog", async () => {
  render(() => <DeleteDialog />);
  await open();
  const dialog = required(visibleDialog(), "a visible alert dialog");
  await vi.waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
});

it("AlertDialog closes on Escape and reports the change", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  render(() => <DeleteDialog onOpenChange={onOpenChange} />);
  await open();
  fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
  await vi.waitFor(() => expect(visibleDialog()).toBeUndefined());
  expect(onOpenChange.mock.calls.map(([isOpen]) => isOpen)).toStrictEqual([true, false]);
});

it("AlertDialog closes from Cancel without running the action", async () => {
  const onDelete = vi.fn<() => void>();
  render(() => <DeleteDialog onDelete={onDelete} />);
  await open();
  fireEvent.click(screen.getByRole("button", { name: "Keep" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeUndefined());
  expect(onDelete).not.toHaveBeenCalled();
});

it("AlertDialog runs the action and closes from Action", async () => {
  const onDelete = vi.fn<() => void>();
  render(() => <DeleteDialog onDelete={onDelete} />);
  await open();
  fireEvent.click(screen.getByRole("button", { name: "Delete it" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeUndefined());
  expect(onDelete).toHaveBeenCalledOnce();
});

it("AlertDialog stays open on a click outside", async () => {
  render(() => <DeleteDialog />);
  await open();
  fireEvent.pointerDown(document.body);
  fireEvent.pointerUp(document.body);
  fireEvent.click(document.body);
  await mounted();
  expect(visibleDialog()).toBeDefined();
});

it("AlertDialog styles Action as a destructive Button and Cancel as an outline one", async () => {
  render(() => <DeleteDialog />);
  await open();
  expect(screen.getByRole("button", { name: "Delete it" }).className).toContain("bg-destructive");
  expect(screen.getByRole("button", { name: "Keep" }).className).toContain("border-input");
});
