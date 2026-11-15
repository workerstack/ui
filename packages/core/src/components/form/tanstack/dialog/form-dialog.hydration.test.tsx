import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../../../../test/hydration.ts";
import { ClosedProfile, OpenProfile } from "./__fixtures__/form-dialog.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/form-dialog.hydration.fixture.tsx", import.meta.url), {
  ClosedProfile,
  OpenProfile,
});

it("hydrating FormDialog adds nothing the server didn't render (closed)", async () => {
  expect(mismatch(await hydrate("ClosedProfile"))).toStrictEqual({});
});

it("hydrating FormDialog adds nothing the server didn't render (open)", async () => {
  expect(mismatch(await hydrate("OpenProfile"))).toStrictEqual({});
});

it("hydrating FormDialog opens from the server's trigger, and Cancel closes it", async () => {
  await hydrate("ClosedProfile");
  await userEvent.click(page.getByRole("button", { name: "Edit" }));
  await expect.element(page.getByRole("textbox", { name: "Name" })).toBeVisible();
  await userEvent.click(page.getByRole("button", { name: "Cancel" }));
  await expect.element(page.getByRole("textbox", { name: "Name" })).not.toBeInTheDocument();
});
