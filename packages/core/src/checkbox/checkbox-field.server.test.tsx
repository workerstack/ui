import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { slots } from "../test/server.ts";
import { TermsField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["true"],
  field: TermsField,
  rendered: (html) => slots(html, "checkbox").map((box) => box.attrs["aria-checked"]),
  shown: ["Yes"],
  title: "CheckboxField",
});
