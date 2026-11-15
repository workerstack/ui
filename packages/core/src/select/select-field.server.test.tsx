import { testFieldServer } from "../form/__fixtures__/field-server.tsx";
import { text } from "../test/server.ts";
import { RoleField } from "./__fixtures__/profile-fields.fixture.tsx";

testFieldServer({
  expected: true,
  field: RoleField,
  rendered: (html) => text(html).includes("Admin"),
  shown: ["Admin"],
  title: "SelectField",
  warns: true,
});
