import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../../../../test/hydration.ts";
import { EditableInvites, ReadOnlyInvites } from "./__fixtures__/form-array.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/form-array.hydration.fixture.tsx", import.meta.url), {
  EditableInvites,
  ReadOnlyInvites,
});

it("hydrating formArray adds nothing the server didn't render (editable)", async () => {
  expect(mismatch(await hydrate("EditableInvites"))).toStrictEqual({});
});

it("hydrating formArray adds nothing the server didn't render (read-only)", async () => {
  expect(mismatch(await hydrate("ReadOnlyInvites"))).toStrictEqual({});
});

it("hydrating formArray keeps the server's items working: Add appends and focuses the new item", async () => {
  await hydrate("EditableInvites");
  await userEvent.click(page.getByRole("button", { name: "Add invite" }));

  await expect.element(page.getByRole("textbox", { name: "Email 3" })).toHaveFocus();
  await userEvent.click(page.getByRole("button", { name: "Move item 3 up" }));

  await expect.element(page.getByRole("textbox", { name: "Email 3" })).toHaveValue("grace@acme.dev");
});
