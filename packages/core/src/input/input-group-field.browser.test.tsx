import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";

import { testFieldBrowser } from "../form/__fixtures__/field-browser.tsx";
import { FILLED_PROFILE } from "../form/__fixtures__/profile.fixture.ts";
import { NoteField, SiteField } from "./__fixtures__/profile-fields.fixture.tsx";

afterEach(cleanup);

// A required label draws its mark with CSS `content`, which Vitest's locator counts in the name
// (docs/upstream/ui-sdk.md, Other upstreams), so each box is found by how its name starts.
function box(label: RegExp): () => Locator {
  return () => page.getByRole("textbox", { name: label });
}

testFieldBrowser({
  control: box(/^Site/),
  field: SiteField,
  fill: () => userEvent.fill(box(/^Site/)(), FILLED_PROFILE.site),
  name: "site",
  title: "InputGroupField.Control",
});

testFieldBrowser({
  control: box(/^Note/),
  field: NoteField,
  fill: () => userEvent.fill(box(/^Note/)(), FILLED_PROFILE.note),
  name: "note",
  title: "InputGroupField.TextareaControl",
});
