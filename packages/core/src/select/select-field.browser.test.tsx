import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import { page } from "vitest/browser";

import { pick, testFieldBrowser } from "../form/__fixtures__/field-browser.tsx";
import { RoleField } from "./__fixtures__/profile-fields.fixture.tsx";

afterEach(cleanup);

testFieldBrowser({
  control: () => page.getByRole("combobox", { name: "Role" }),
  field: RoleField,
  fill: () => pick("Role", "Admin"),
  name: "role",
  title: "SelectField",
});
