import { tags } from "@workerstack/testing/web/solid";

import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { PlanField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["false", "true"],
  field: PlanField,
  rendered: (html) => tags(html, { "data-slot": "radio" }).map((radio) => radio.attrs["aria-checked"]),
  shown: ["Pro"],
  title: "RadioGroupField",
});
