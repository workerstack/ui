import { fireEvent, screen } from "@solidjs/testing-library";
import { expect, it } from "vitest";

import { renderProfile, settle, testControlField, valueOf } from "../form/__fixtures__/field-testing.ts";
import { type } from "../test/dom.ts";
import { comboboxInput, testComboboxBehaviors } from "./__fixtures__/combobox-behaviors.tsx";
import { MULTI_COMBOBOX_CONTRACT } from "./__fixtures__/contracts.fixture.tsx";
import { TagsField } from "./__fixtures__/profile-fields.fixture.tsx";

testControlField({ field: TagsField, title: "MultiComboboxField" }, MULTI_COMBOBOX_CONTRACT);

it("MultiComboboxField.Control adds each picked item's value and shows it as a chip", async () => {
  const { form } = await renderProfile(TagsField, { defaults: { tags: ["bug"] } });
  type(comboboxInput(/^Tags/), "des");
  fireEvent.click(await screen.findByRole("option", { name: "Design" }));
  await settle();
  expect(valueOf(form, "tags")).toStrictEqual(["bug", "design"]);
  expect(await screen.findByRole("group", { name: "Design" })).toBeTruthy();
});

testComboboxBehaviors({
  field: TagsField,
  input: "MultiComboboxField.ChipsInput",
  label: /^Tags/,
  name: "tags",
  shown: "Bug, Design",
  title: "MultiComboboxField",
});
