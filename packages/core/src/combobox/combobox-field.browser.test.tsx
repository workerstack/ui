import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import { page } from "vitest/browser";

import { pick, testFieldBrowser } from "../form/__fixtures__/field-browser.tsx";
import { FruitField } from "./__fixtures__/profile-fields.fixture.tsx";

afterEach(cleanup);

testFieldBrowser({
  control: () => page.getByRole("combobox", { name: "Fruit" }),
  field: FruitField,
  fill: () => pick("Fruit", "Banana", "ban"),
  name: "fruit",
  title: "ComboboxField",
});
