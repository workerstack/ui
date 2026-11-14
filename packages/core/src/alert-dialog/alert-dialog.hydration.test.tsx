import { expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../test/hydration.ts";
import { required } from "../test/required.ts";
import { AlertDialogFixture, AlertDialogOpenFixture } from "./__fixtures__/alert-dialog.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/alert-dialog.hydration.fixture.tsx", import.meta.url), {
  AlertDialogFixture,
  AlertDialogOpenFixture,
});

function visibleDialog(): Element | undefined {
  return [...document.querySelectorAll('[role="alertdialog"]')].find((el) => el.checkVisibility());
}

it("hydrating AlertDialog claims the server's nodes without warnings (closed)", async () => {
  expect(mismatch(await hydrate("AlertDialogFixture"))).toStrictEqual({});
});

it("hydrating AlertDialog opens from the server's trigger", async () => {
  await hydrate("AlertDialogFixture");
  await userEvent.click(page.getByRole("button", { name: "Delete" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeDefined());
  await expect.element(page.getByRole("status")).toHaveTextContent("open");
});

it("hydrating AlertDialog claims the server's nodes without warnings (open)", async () => {
  expect(mismatch(await hydrate("AlertDialogOpenFixture"))).toStrictEqual({});
});

it("hydrating AlertDialog makes an open alert dialog described and closable", async () => {
  await hydrate("AlertDialogOpenFixture");
  await vi.waitFor(() => expect(visibleDialog()).toBeDefined());
  const dialog = required(visibleDialog(), "a visible alert dialog");
  await expect
    .poll(() => dialog.getAttribute("aria-describedby"))
    .toBe(page.getByText("This cannot be undone.").element().id);
  await userEvent.click(page.getByRole("button", { name: "Keep" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeUndefined());
  await expect.element(page.getByRole("status")).toHaveTextContent("closed");
});
