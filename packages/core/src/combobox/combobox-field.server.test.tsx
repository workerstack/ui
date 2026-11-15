import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { slots } from "../test/server.ts";
import { FruitField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["Banana"],
  field: FruitField,
  rendered: (html) => slots(html, "combobox-input").map((input) => input.attrs.value),
  shown: ["Banana"],
  title: "ComboboxField",
  warns: true,
});
