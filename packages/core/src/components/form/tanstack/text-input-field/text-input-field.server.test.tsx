import { tags } from "@workerstack/testing/web/solid";

import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { NameField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: [["name", "Ada"]],
  field: NameField,
  rendered: (html) => tags(html, { "data-slot": "input" }).map((input) => [input.attrs.name, input.attrs.value]),
  shown: ["Ada"],
  title: "TextInputField",
});
