import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";

import { testFieldBrowser } from "../form/__fixtures__/field-browser.tsx";
import { TermsField } from "./__fixtures__/profile-fields.fixture.tsx";

afterEach(cleanup);

function terms(): Locator {
  return page.getByRole("checkbox", { name: "Terms" });
}

testFieldBrowser({
  control: terms,
  field: TermsField,
  fill: () => userEvent.click(terms()),
  name: "terms",
  title: "CheckboxField",
});
