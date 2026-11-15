import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../../test/hydration.ts";
import {
  EditableProfile,
  EditableProfileWithoutLists,
  ReadOnlyProfile,
} from "./__fixtures__/controls.hydration.fixture.tsx";
import { PROFILE_ERRORS } from "./__fixtures__/profile.fixture.ts";

const hydrate = hydrator(new URL("./__fixtures__/controls.hydration.fixture.tsx", import.meta.url), {
  EditableProfile,
  EditableProfileWithoutLists,
  ReadOnlyProfile,
});

it("hydrating the text and choice wrappers adds nothing the server didn't render", async () => {
  expect(mismatch(await hydrate("EditableProfileWithoutLists"))).toStrictEqual({});
});

// The select and comboboxes warn on the server (docs/upstream/ui-sdk.md, UISDK-1); the rest must match.
it("hydrating every wrapper claims the server's nodes and adds none", async () => {
  expect(mismatch(await hydrate("EditableProfile"), ["warnings", "replaced", "added"])).toStrictEqual({});
});

it("hydrating every wrapper's View in a read-only form adds nothing the server didn't render", async () => {
  expect(mismatch(await hydrate("ReadOnlyProfile"))).toStrictEqual({});
});

it("hydrating the wrappers binds their fields: a submit shows the empty field's error", async () => {
  await hydrate("EditableProfile");
  await userEvent.click(page.getByRole("button", { name: "Save" }));
  await expect.element(page.getByText(PROFILE_ERRORS.name, { exact: true })).toBeVisible();
});
