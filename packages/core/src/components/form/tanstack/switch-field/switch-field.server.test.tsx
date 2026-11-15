import { tags } from "@workerstack/testing/web/solid";

import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { AlertsField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["true"],
  field: AlertsField,
  rendered: (html) => tags(html, { "data-slot": "switch" }).map((toggle) => toggle.attrs["aria-checked"]),
  shown: ["Yes"],
  title: "SwitchField",
});
