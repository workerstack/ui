import { tags } from "@workerstack/testing/web/solid";

import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { FruitField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["Banana"],
  field: FruitField,
  rendered: (html) => tags(html, { "data-slot": "combobox-input" }).map((input) => input.attrs.value),
  shown: ["Banana"],
  title: "ComboboxField",
  warns: true,
});
