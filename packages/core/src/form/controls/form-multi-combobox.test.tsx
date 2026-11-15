import { cleanup, fireEvent, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { inputElement, type } from "../../test/dom.ts";
import { testFieldModule } from "../__fixtures__/field-module-contract.tsx";
import { errorTexts, settle, submit, userSteps } from "../__fixtures__/form-testing.ts";
import { MULTI_COMBOBOX_CONTRACT } from "./__fixtures__/contracts.fixture.tsx";
import { isBlurred, renderProfile, valueOf, viewText } from "./__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "./__fixtures__/profile.fixture.ts";

afterEach(cleanup);

testFieldModule(MULTI_COMBOBOX_CONTRACT);

function tags(): HTMLInputElement {
  return inputElement(screen.getByRole("combobox", { name: /^Tags/ }));
}

it("formMultiCombobox.Control adds each picked item's value and shows it as a chip", async () => {
  const { form } = await renderProfile({ defaults: { tags: ["bug"] } });
  type(tags(), "des");
  fireEvent.click(await screen.findByRole("option", { name: "Design" }));
  await settle();
  expect(valueOf(form, "tags")).toStrictEqual(["bug", "design"]);
  await vi.waitFor(() => expect(screen.getByRole("group", { name: "Design" })).toBeTruthy());
});

it("formMultiCombobox.ChipsInput blurs the field when it loses focus", async () => {
  const { form } = await renderProfile();
  userSteps(
    () => fireEvent.focus(tags()),
    () => fireEvent.blur(tags()),
  );
  await settle();
  expect(isBlurred(form, "tags")).toBe(true);
});

it("formMultiCombobox.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile({ defaults: { ...FILLED_PROFILE, tags: [] } });
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.tags]);
});

it("formMultiCombobox.Control renders the chosen labels from the Root's items in a read-only form", async () => {
  const { container } = await renderProfile({ defaults: FILLED_PROFILE, readOnly: true });
  expect(screen.queryByRole("combobox", { name: /^Tags/ })).toBeNull();
  expect(viewText(container, "tags")).toBe("Bug, Design");
});
