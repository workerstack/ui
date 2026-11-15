import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";

import { testFieldBrowser } from "../form/__fixtures__/field-browser.tsx";
import { AlertsField } from "./__fixtures__/profile-fields.fixture.tsx";

afterEach(cleanup);

function alerts(): Locator {
  return page.getByRole("switch", { name: "Alerts" });
}

testFieldBrowser({
  control: alerts,
  field: AlertsField,
  fill: () => userEvent.click(alerts()),
  name: "alerts",
  title: "SwitchField",
});
