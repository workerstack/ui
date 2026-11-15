import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";

import { testFieldBrowser } from "../form/__fixtures__/field-browser.tsx";
import { FILLED_PROFILE } from "../form/__fixtures__/profile.fixture.ts";
import { BioField } from "./__fixtures__/profile-fields.fixture.tsx";

afterEach(cleanup);

// A required label's mark is CSS `content`, counted in the locator's name: the box is found by how it starts.
function bio(): Locator {
  return page.getByRole("textbox", { name: /^Bio/ });
}

testFieldBrowser({
  control: bio,
  field: BioField,
  fill: () => userEvent.fill(bio(), FILLED_PROFILE.bio),
  name: "bio",
  title: "TextareaField",
});
