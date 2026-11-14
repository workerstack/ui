import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted } from "../test/dom.ts";
import { required } from "../test/required.ts";
import { ShareDialog } from "./__fixtures__/share-dialog.fixture.tsx";

afterEach(cleanup);

/** The dialog on screen, if one is shown. */
function visibleDialog(): HTMLElement | undefined {
  return screen.queryAllByRole("dialog").find((el) => el.checkVisibility());
}

/** Opens the dialog from its trigger and waits until it shows. */
async function open(): Promise<void> {
  await mounted();
  fireEvent.click(screen.getByRole("button", { name: "Share" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeDefined());
}

it("Dialog opens from its trigger, named and described by its title and description", async () => {
  render(() => <ShareDialog />);
  await mounted();
  expect(visibleDialog()).toBeUndefined();
  await open();
  const dialog = required(visibleDialog(), "a visible dialog");
  expect(dialog.getAttribute("aria-labelledby")).toBe(screen.getByText("Share link").id);
  expect(dialog.getAttribute("aria-describedby")).toBe(screen.getByText("Anyone with the link can view.").id);
  expect(dialog.className).toContain("rounded-lg");
});

it("Dialog closes from the corner × and reports the change", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  render(() => <ShareDialog onOpenChange={onOpenChange} />);
  await open();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeUndefined());
  expect(onOpenChange.mock.calls.map(([isOpen]) => isOpen)).toStrictEqual([true, false]);
});

it("Dialog closes on Escape", async () => {
  render(() => <ShareDialog />);
  await open();
  fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
  await vi.waitFor(() => expect(visibleDialog()).toBeUndefined());
});

it("Dialog leaves the × out with showClose={false}", async () => {
  render(() => <ShareDialog showClose={false} />);
  await open();
  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  expect(screen.getByRole("button", { name: "Done" })).toBeTruthy();
});
