import { expect, it } from "vitest";

import { isText } from "./combobox-context.ts";

it("Combobox context tells text from an item object", () => {
  expect(isText("Apple")).toBe(true);
  expect(isText({ label: "Apple", value: "apple" })).toBe(false);
});

it("Combobox context does not take a missing value or a number for text", () => {
  expect(isText(undefined)).toBe(false);
  expect(isText(3)).toBe(false);
});
