import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import { page, userEvent } from "vitest/browser";

import { testFieldBrowser } from "../form/__fixtures__/field-browser.tsx";
import { PlanField } from "./__fixtures__/profile-fields.fixture.tsx";

afterEach(cleanup);

testFieldBrowser({
  control: () => page.getByRole("radio", { name: "Free" }),
  field: PlanField,
  fill: () => userEvent.click(page.getByRole("radio", { name: "Pro" })),
  name: "plan",
  title: "RadioGroupField",
});
