import { slots } from "../../../../test/server.ts";
import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { ToppingsField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["false", "true"],
  field: ToppingsField,
  rendered: (html) => slots(html, "checkbox").map((box) => box.attrs["aria-checked"]),
  shown: ["Ham"],
  title: "CheckboxGroupField",
});
