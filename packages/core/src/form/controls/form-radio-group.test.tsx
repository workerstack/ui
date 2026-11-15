import { cleanup, fireEvent, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { testFieldModule } from "../__fixtures__/field-module-contract.tsx";
import { errorTexts, settle, submit, userSteps } from "../__fixtures__/form-testing.ts";
import { RADIO_GROUP_CONTRACT } from "./__fixtures__/contracts.fixture.tsx";
import { isBlurred, renderProfile, valueOf, viewText } from "./__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "./__fixtures__/profile.fixture.ts";

afterEach(cleanup);

testFieldModule(RADIO_GROUP_CONTRACT);

it("formRadioGroup.Control is a radio group named by its legend", async () => {
  await renderProfile();
  const group = screen.getByRole("radiogroup", { name: "Plan" });
  expect(group.querySelectorAll('[role="radio"]')).toHaveLength(2);
});

it("formRadioGroup.Control writes the chosen value and blurs once focus leaves the group", async () => {
  const { form } = await renderProfile();
  const pro = screen.getByRole("radio", { name: "Pro" });
  userSteps(
    () => fireEvent.click(pro),
    () => fireEvent.focusOut(pro, { relatedTarget: null }),
  );
  await settle();
  expect(valueOf(form, "plan")).toBe("pro");
  expect(isBlurred(form, "plan")).toBe(true);
});

it("formRadioGroup.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile({ defaults: { ...FILLED_PROFILE, plan: null } });
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.plan]);
});

it("formRadioGroup.Control renders the chosen label under its legend in a read-only form", async () => {
  const { container } = await renderProfile({ defaults: FILLED_PROFILE, readOnly: true });
  expect(screen.queryByRole("radio", { name: "Pro" })).toBeNull();
  expect(viewText(container, "plan")).toBe("Pro");
  expect(screen.getByRole("group", { name: "Plan" })).toBeTruthy();
});
