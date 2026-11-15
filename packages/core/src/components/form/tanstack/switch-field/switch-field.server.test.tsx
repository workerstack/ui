import { slots } from "../../../../test/server.ts";
import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { AlertsField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: ["true"],
  field: AlertsField,
  rendered: (html) => slots(html, "switch").map((toggle) => toggle.attrs["aria-checked"]),
  shown: ["Yes"],
  title: "SwitchField",
});
