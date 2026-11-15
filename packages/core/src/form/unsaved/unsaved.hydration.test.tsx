import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../../test/hydration.ts";
import { SaveBarProfile, UnsavedFormsPage } from "./__fixtures__/unsaved.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/unsaved.hydration.fixture.tsx", import.meta.url), {
  SaveBarProfile,
  UnsavedFormsPage,
});

it("hydrating unsaved forms under the provider adds nothing the server didn't render", async () => {
  expect(mismatch(await hydrate("UnsavedFormsPage"))).toStrictEqual({});
});

it("hydrating a form with a save bar adds nothing the server didn't render", async () => {
  expect(mismatch(await hydrate("SaveBarProfile"))).toStrictEqual({});
});

it("hydrating a form with a save bar binds it: an edit shows the bar", async () => {
  await hydrate("SaveBarProfile");
  await userEvent.click(page.getByRole("textbox", { name: "Name" }));
  await userEvent.keyboard("!");
  await expect.element(page.getByRole("region", { name: "Unsaved changes" })).toBeVisible();
  localStorage.clear();
});
