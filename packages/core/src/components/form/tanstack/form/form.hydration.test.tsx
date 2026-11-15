import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { EditableAccount, ReadOnlyAccount } from "./__fixtures__/form.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/form.hydration.fixture.tsx", import.meta.url), {
  EditableAccount,
  ReadOnlyAccount,
});

it("hydrating Form adds nothing the server didn't render", async () => {
  const { mismatches } = await hydrate("EditableAccount");
  expect(mismatches).toStrictEqual({});
});

it("hydrating a read-only Form adds nothing the server didn't render", async () => {
  const { mismatches } = await hydrate("ReadOnlyAccount");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Form binds its fields: a submit shows their errors", async () => {
  await hydrate("EditableAccount");
  await userEvent.click(page.getByRole("button", { name: "Save" }));
  await expect.element(page.getByText("Enter your email.")).toBeVisible();
});
