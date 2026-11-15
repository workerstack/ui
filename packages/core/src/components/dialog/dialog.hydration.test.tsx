import { expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../../test/hydration.ts";
import { required } from "../../test/required.ts";
import { DialogFixture, DialogOpenFixture } from "./__fixtures__/dialog.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/dialog.hydration.fixture.tsx", import.meta.url), {
  DialogFixture,
  DialogOpenFixture,
});

function visibleDialog(): Element | undefined {
  return [...document.querySelectorAll('[role="dialog"]')].find((el) => el.checkVisibility());
}

it("hydrating Dialog claims the server's nodes without warnings (closed)", async () => {
  expect(mismatch(await hydrate("DialogFixture"))).toStrictEqual({});
});

it("hydrating Dialog opens from the server's trigger", async () => {
  await hydrate("DialogFixture");
  await userEvent.click(page.getByRole("button", { name: "Share" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeDefined());
  await expect.element(page.getByRole("status")).toHaveTextContent("open");
});

it("hydrating Dialog claims the server's nodes without warnings (open)", async () => {
  expect(mismatch(await hydrate("DialogOpenFixture"))).toStrictEqual({});
});

it("hydrating Dialog makes an open dialog a modal that is shown, described and closable", async () => {
  await hydrate("DialogOpenFixture");
  await vi.waitFor(() => expect(visibleDialog()).toBeDefined());
  const dialog = required(visibleDialog(), "a visible dialog");
  await expect
    .poll(() => dialog.getAttribute("aria-describedby"))
    .toBe(page.getByText("Anyone with the link can view.").element().id);
  await userEvent.keyboard("{Escape}");
  await vi.waitFor(() => expect(visibleDialog()).toBeUndefined());
  await expect.element(page.getByRole("status")).toHaveTextContent("closed");
});
