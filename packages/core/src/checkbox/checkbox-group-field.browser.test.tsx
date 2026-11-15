import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import { page, userEvent } from "vitest/browser";

import { testFieldBrowser } from "../form/__fixtures__/field-browser.tsx";
import { ToppingsField } from "./__fixtures__/profile-fields.fixture.tsx";

afterEach(cleanup);

testFieldBrowser({
  control: () => page.getByRole("checkbox", { name: "Cheese" }),
  field: ToppingsField,
  fill: () => userEvent.click(page.getByRole("checkbox", { name: "Ham" })),
  name: "toppings",
  title: "CheckboxGroupField",
});
