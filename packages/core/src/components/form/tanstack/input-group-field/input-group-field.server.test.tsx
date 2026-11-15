import { tags } from "@workerstack/testing/web/solid";

import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { FILLED_PROFILE } from "../form/__fixtures__/profile.fixture.ts";
import { SiteAndNoteFields } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: [[["site", "ada.dev"]], ["note"]],
  field: SiteAndNoteFields,
  rendered: (html) => [
    tags(html, { "data-slot": "input" }).map((input) => [input.attrs.name, input.attrs.value]),
    tags(html, { "data-slot": "textarea" }).map((box) => box.attrs.name),
  ],
  shown: ["ada.dev", FILLED_PROFILE.note],
  title: "InputGroupField",
});
