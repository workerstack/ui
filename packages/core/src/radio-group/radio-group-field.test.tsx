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
import { RADIO_GROUP_CONTRACT } from "./__fixtures__/contracts.fixture.tsx";
import { PlanField } from "./__fixtures__/profile-fields.fixture.tsx";

testControlField({ field: PlanField, title: "RadioGroupField" }, RADIO_GROUP_CONTRACT);

it("RadioGroupField.Control is a radio group named by its legend", async () => {
  await renderProfile(PlanField);
  const group = screen.getByRole("radiogroup", { name: "Plan" });
  expect(group.querySelectorAll('[role="radio"]')).toHaveLength(2);
});

it("RadioGroupField.Control writes the chosen value and blurs once focus leaves the group", async () => {
  const { form } = await renderProfile(PlanField);
  const pro = screen.getByRole("radio", { name: "Pro" });
  userSteps(
    () => fireEvent.click(pro),
    () => fireEvent.focusOut(pro, { relatedTarget: null }),
  );
  await settle();
  expect(valueOf(form, "plan")).toBe("pro");
  expect(isBlurred(form, "plan")).toBe(true);
});

it("RadioGroupField.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile(PlanField, { defaults: { ...FILLED_PROFILE, plan: null } });
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.plan]);
});

it("RadioGroupField.Control renders the chosen label under its legend in a read-only form", async () => {
  const { container } = await renderProfile(PlanField, { defaults: FILLED_PROFILE, readOnly: true });
  expect(screen.queryByRole("radio", { name: "Pro" })).toBeNull();
  expect(viewText(container, "plan")).toBe("Pro");
  expect(screen.getByRole("group", { name: "Plan" })).toBeTruthy();
});
