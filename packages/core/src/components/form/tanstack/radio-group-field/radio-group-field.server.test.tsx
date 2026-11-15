import { slots } from "../../../../test/server.ts";
import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { PlanField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["false", "true"],
  field: PlanField,
  rendered: (html) => slots(html, "radio").map((radio) => radio.attrs["aria-checked"]),
  shown: ["Pro"],
  title: "RadioGroupField",
});
