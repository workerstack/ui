import { fireEvent, screen } from "@solidjs/testing-library";
import { expect, it } from "vitest";

import { type } from "../../../../test/dom.ts";
import { comboboxInput, testComboboxBehaviors } from "../form/__fixtures__/combobox-behaviors.tsx";
import { renderProfile, settle, testControlField, valueOf } from "../form/__fixtures__/field-testing.ts";
import { COMBOBOX_CONTRACT } from "./__fixtures__/contracts.fixture.tsx";
import { FruitField } from "./__fixtures__/profile-fields.fixture.tsx";

testControlField({ field: FruitField, title: "ComboboxField" }, COMBOBOX_CONTRACT);

it("ComboboxField.Control writes the picked item's value", async () => {
  const { form } = await renderProfile(FruitField);
  type(comboboxInput(/^Fruit/), "ban");
  fireEvent.click(await screen.findByRole("option", { name: "Banana" }));
  await settle();
  expect(valueOf(form, "fruit")).toBe("banana");
  expect(comboboxInput(/^Fruit/).value).toBe("Banana");
});

testComboboxBehaviors({
  field: FruitField,
  input: "ComboboxField.Input",
  label: /^Fruit/,
  name: "fruit",
  shown: "Banana",
  title: "ComboboxField",
});
