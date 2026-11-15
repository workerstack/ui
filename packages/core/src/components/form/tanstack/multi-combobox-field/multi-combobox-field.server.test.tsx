import { slots } from "../../../../test/server.ts";
import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { TagsField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["Bug", "Design"],
  field: TagsField,
  rendered: (html) => slots(html, "combobox-chip").map((chip) => chip.attrs["aria-label"]),
  shown: ["Bug, Design"],
  title: "MultiComboboxField",
  warns: true,
});
