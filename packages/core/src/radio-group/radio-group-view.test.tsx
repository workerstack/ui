import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { FieldsetLegend } from "../field/index.ts";
import { PLAN_ITEMS } from "./__fixtures__/plans.fixture.ts";
import { RadioGroupView } from "./index.ts";

afterEach(cleanup);

it("RadioGroupView shows the chosen label from items under its legend in a named group", () => {
  render(() => <RadioGroupView items={PLAN_ITEMS} value="business" legend={<FieldsetLegend>Plan</FieldsetLegend>} />);
  expect(screen.getByRole("group", { name: "Plan" }).contains(screen.getByRole("status"))).toBe(true);
  expect(screen.getByRole("status").textContent).toBe("Business");
});

it("RadioGroupView stands alone without a legend and marks no choice", () => {
  render(() => <RadioGroupView items={PLAN_ITEMS} value={null} />);
  expect(screen.queryByRole("group")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("—");
});
