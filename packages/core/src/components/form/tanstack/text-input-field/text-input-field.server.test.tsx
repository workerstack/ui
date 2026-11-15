import { slots } from "../../../../test/server.ts";
import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { NameField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: [["name", "Ada"]],
  field: NameField,
  rendered: (html) => slots(html, "input").map((input) => [input.attrs.name, input.attrs.value]),
  shown: ["Ada"],
  title: "TextInputField",
});
