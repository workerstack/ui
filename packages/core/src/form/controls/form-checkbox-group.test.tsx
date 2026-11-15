import { cleanup, fireEvent, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { testFieldModule } from "../__fixtures__/field-module-contract.tsx";
import { errorTexts, settle, submit, userSteps } from "../__fixtures__/form-testing.ts";
import { CHECKBOX_GROUP_CONTRACT } from "./__fixtures__/contracts.fixture.tsx";
import { isBlurred, renderProfile, valueOf, viewText } from "./__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "./__fixtures__/profile.fixture.ts";

afterEach(cleanup);

testFieldModule(CHECKBOX_GROUP_CONTRACT);

it("formCheckboxGroup.Control is a group named by its legend", async () => {
  await renderProfile();
  const group = screen.getByRole("group", { name: "Toppings" });
  expect(group.querySelectorAll('[role="checkbox"]')).toHaveLength(2);
});

it("formCheckboxGroup.Control writes the checked values and blurs once focus leaves the group", async () => {
  const { form } = await renderProfile();
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

it("formCheckboxGroup.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile({ defaults: { ...FILLED_PROFILE, toppings: [] } });
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.toppings]);
});

it("formCheckboxGroup.Control renders the checked labels under its legend in a read-only form", async () => {
  const { container } = await renderProfile({ defaults: FILLED_PROFILE, readOnly: true });
  expect(screen.queryByRole("checkbox", { name: "Ham" })).toBeNull();
  expect(viewText(container, "toppings")).toBe("Ham");
  expect(screen.getByRole("group", { name: "Toppings" })).toBeTruthy();
});
