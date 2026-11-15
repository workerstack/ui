import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { EditableInvites, ReadOnlyInvites } from "./__fixtures__/form-array.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/form-array.hydration.fixture.tsx", import.meta.url), {
  EditableInvites,
  ReadOnlyInvites,
});

it("hydrating formArray adds nothing the server didn't render (editable)", async () => {
  const { mismatches } = await hydrate("EditableInvites");
  expect(mismatches).toStrictEqual({});
});

it("hydrating formArray adds nothing the server didn't render (read-only)", async () => {
  const { mismatches } = await hydrate("ReadOnlyInvites");
  expect(mismatches).toStrictEqual({});
});

it("hydrating formArray keeps the server's items working: Add appends and focuses the new item", async () => {
  await hydrate("EditableInvites");
  await userEvent.click(page.getByRole("button", { name: "Add invite" }));

  await expect.element(page.getByRole("textbox", { name: "Email 3" })).toHaveFocus();
  await userEvent.click(page.getByRole("button", { name: "Move item 3 up" }));

  await expect.element(page.getByRole("textbox", { name: "Email 3" })).toHaveValue("grace@acme.dev");
});
