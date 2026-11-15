import { expect, it } from "vitest";

import { renderServer, slot, text } from "../../test/server.ts";
import { FieldsetLegend } from "../field/index.ts";
import { PLAN_ITEMS } from "./__fixtures__/plans.fixture.ts";
import { RadioGroupView } from "./index.ts";

it("RadioGroupView on the server shows the chosen label under its legend, without warnings", () => {
  const { html, warnings } = renderServer(() => (
    <RadioGroupView items={PLAN_ITEMS} value="business" legend={<FieldsetLegend>Plan</FieldsetLegend>} />
  ));

  expect(text(html)).toBe("PlanBusiness");
  expect(warnings).toStrictEqual([]);
});

it("RadioGroupView on the server stands alone and marks no choice", () => {
  const { html } = renderServer(() => <RadioGroupView items={PLAN_ITEMS} value={null} />);
  expect(slot(html, "view").attrs).toHaveProperty("data-empty");
  expect(text(html)).toBe("—");
});
