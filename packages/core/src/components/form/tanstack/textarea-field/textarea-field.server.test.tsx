import { tags } from "@workerstack/testing/web/solid";

import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { FILLED_PROFILE } from "../form/__fixtures__/profile.fixture.ts";
import { BioField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["bio"],
  field: BioField,
  rendered: (html) => tags(html, { "data-slot": "textarea" }).map((box) => box.attrs.name),
  shown: [FILLED_PROFILE.bio],
  title: "TextareaField",
});
