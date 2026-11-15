import { fireEvent, screen } from "@solidjs/testing-library";
import { expect, it } from "vitest";

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
import { CHECKBOX_GROUP_CONTRACT } from "./__fixtures__/contracts.fixture.tsx";
import { ToppingsField } from "./__fixtures__/profile-fields.fixture.tsx";

testControlField({ field: ToppingsField, title: "CheckboxGroupField" }, CHECKBOX_GROUP_CONTRACT);

it("CheckboxGroupField.Control is a group named by its legend", async () => {
  await renderProfile(ToppingsField);
  const group = screen.getByRole("group", { name: "Toppings" });
  expect(group.querySelectorAll('[role="checkbox"]')).toHaveLength(2);
});

it("CheckboxGroupField.Control writes the checked values and blurs once focus leaves the group", async () => {
  const { form } = await renderProfile(ToppingsField);
  const ham = screen.getByRole("checkbox", { name: "Ham" });
  const cheese = screen.getByRole("checkbox", { name: "Cheese" });
  userSteps(
    () => fireEvent.click(ham),
    () => fireEvent.focusOut(ham, { relatedTarget: cheese }),
  );
  await settle();
  expect(valueOf(form, "toppings")).toStrictEqual(["ham"]);
  expect(isBlurred(form, "toppings")).toBe(false);
  userSteps(() => fireEvent.focusOut(cheese, { relatedTarget: null }));
  await settle();
  expect(isBlurred(form, "toppings")).toBe(true);
});

it("CheckboxGroupField.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile(ToppingsField, { defaults: { ...FILLED_PROFILE, toppings: [] } });
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.toppings]);
});

it("CheckboxGroupField.Control renders the checked labels under its legend in a read-only form", async () => {
  const { container } = await renderProfile(ToppingsField, { defaults: FILLED_PROFILE, readOnly: true });
  expect(screen.queryByRole("checkbox", { name: "Ham" })).toBeNull();
  expect(viewText(container, "toppings")).toBe("Ham");
  expect(screen.getByRole("group", { name: "Toppings" })).toBeTruthy();
});
