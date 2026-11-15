import { tags } from "@workerstack/testing/web/solid";

import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { TermsField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["true"],
  field: TermsField,
  rendered: (html) => tags(html, { "data-slot": "checkbox" }).map((box) => box.attrs["aria-checked"]),
  shown: ["Yes"],
  title: "CheckboxField",
});
