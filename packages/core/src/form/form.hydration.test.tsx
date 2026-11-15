import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../test/hydration.ts";
import { EditableAccount, ReadOnlyAccount } from "./__fixtures__/form.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/form.hydration.fixture.tsx", import.meta.url), {
  EditableAccount,
  ReadOnlyAccount,
});

it("hydrating Form adds nothing the server didn't render", async () => {
  expect(mismatch(await hydrate("EditableAccount"))).toStrictEqual({});
});

it("hydrating a read-only Form adds nothing the server didn't render", async () => {
  expect(mismatch(await hydrate("ReadOnlyAccount"))).toStrictEqual({});
});

it("hydrating Form binds its fields: a submit shows their errors", async () => {
  await hydrate("EditableAccount");
  await userEvent.click(page.getByRole("button", { name: "Save" }));
  await expect.element(page.getByText("Enter your email.")).toBeVisible();
});
