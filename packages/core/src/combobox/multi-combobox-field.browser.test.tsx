import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import { page, userEvent } from "vitest/browser";

import { pick, testFieldBrowser } from "../form/__fixtures__/field-browser.tsx";
import { TagsField } from "./__fixtures__/profile-fields.fixture.tsx";

afterEach(cleanup);

async function fill(): Promise<void> {
  await pick("Tags", "Bug", "bu");
  await pick("Tags", "Design", "des");
  // A multiple combobox stays open after a pick; the person closes it.
  await userEvent.keyboard("{Escape}");
}

testFieldBrowser({
  control: () => page.getByRole("combobox", { name: "Tags" }),
  field: TagsField,
  fill,
  name: "tags",
  title: "MultiComboboxField",
});
