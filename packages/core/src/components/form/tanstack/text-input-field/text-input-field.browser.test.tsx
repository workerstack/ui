import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";

import { testFieldBrowser } from "../form/__fixtures__/field-browser.tsx";
import { NameField } from "./__fixtures__/profile-fields.fixture.tsx";

afterEach(cleanup);

// A required label draws its mark with CSS `content`, which Vitest's locator counts in the name
// (docs/upstream/ui-sdk.md, Other upstreams), so the box is found by how its name starts.
function name(): Locator {
  return page.getByRole("textbox", { name: /^Name/ });
}

testFieldBrowser({
  control: name,
  field: NameField,
  fill: () => userEvent.fill(name(), "Ada"),
  name: "name",
  title: "TextInputField",
});
