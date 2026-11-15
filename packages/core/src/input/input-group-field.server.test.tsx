import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { FILLED_PROFILE } from "../form/__fixtures__/profile.fixture.ts";
import { slots } from "../test/server.ts";
import { SiteAndNoteFields } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: [[["site", "ada.dev"]], ["note"]],
  field: SiteAndNoteFields,
  rendered: (html) => [
    slots(html, "input").map((input) => [input.attrs.name, input.attrs.value]),
    slots(html, "textarea").map((box) => box.attrs.name),
  ],
  shown: ["ada.dev", FILLED_PROFILE.note],
  title: "InputGroupField",
});
