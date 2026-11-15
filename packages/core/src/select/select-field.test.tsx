import { fireEvent, screen } from "@solidjs/testing-library";
import { expect, it, vi } from "vitest";

import {
  errorTexts,
  FILLED_PROFILE,
  isBlurred,
  PROFILE_ERRORS,
  renderProfile,
  settle,
  submit,
  testControlField,
  userSteps,
  valueOf,
  viewText,
} from "../form/__fixtures__/field-testing.ts";
import { SELECT_CONTRACT } from "./__fixtures__/contracts.fixture.tsx";
import { RoleField } from "./__fixtures__/profile-fields.fixture.tsx";

testControlField({ field: RoleField, title: "SelectField" }, SELECT_CONTRACT);

function trigger(): HTMLElement {
  return screen.getByRole("combobox", { name: /^Role/ });
}

it("SelectField.Control writes the picked value and shows its label", async () => {
  const { form } = await renderProfile(RoleField);
  fireEvent.click(trigger());
  fireEvent.click(await screen.findByRole("option", { name: "Editor" }));
  await settle();
  expect(valueOf(form, "role")).toBe("editor");
  await vi.waitFor(() => expect(trigger().textContent).toContain("Editor"));
});

it("SelectField.Trigger blurs the field when it loses focus", async () => {
  const { form } = await renderProfile(RoleField);
  userSteps(
    () => fireEvent.focus(trigger()),
    () => fireEvent.blur(trigger()),
  );
  await settle();
  expect(isBlurred(form, "role")).toBe(true);
});

it("SelectField.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile(RoleField, { defaults: { ...FILLED_PROFILE, role: null } });
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.role]);
  expect(trigger().getAttribute("aria-invalid")).toBe("true");
});

it("SelectField.Control renders the chosen label from the Root's items in a read-only form", async () => {
  const { container } = await renderProfile(RoleField, { defaults: FILLED_PROFILE, readOnly: true });
  expect(screen.queryByRole("combobox", { name: /^Role/ })).toBeNull();
  expect(viewText(container, "role")).toBe("Admin");
});
