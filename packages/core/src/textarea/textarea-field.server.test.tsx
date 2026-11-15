import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { FILLED_PROFILE } from "../form/__fixtures__/profile.fixture.ts";
import { slots } from "../test/server.ts";
import { BioField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["bio"],
  field: BioField,
  rendered: (html) => slots(html, "textarea").map((box) => box.attrs.name),
  shown: [FILLED_PROFILE.bio],
  title: "TextareaField",
});
