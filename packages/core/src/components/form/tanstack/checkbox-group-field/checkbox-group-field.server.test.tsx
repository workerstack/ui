import { tags } from "@workerstack/testing/web/solid";

import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { ToppingsField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["false", "true"],
  field: ToppingsField,
  rendered: (html) => tags(html, { "data-slot": "checkbox" }).map((box) => box.attrs["aria-checked"]),
  shown: ["Ham"],
  title: "CheckboxGroupField",
});
