import { expect, it } from "vitest";

import { isInputElement, isTextareaElement } from "./index.ts";

it("isInputElement accepts an input and rejects a textarea", () => {
  expect(isInputElement(document.createElement("input"))).toBe(true);
  expect(isInputElement(document.createElement("textarea"))).toBe(false);
});

it("isTextareaElement accepts a textarea and rejects an input", () => {
  expect(isTextareaElement(document.createElement("textarea"))).toBe(true);
  expect(isTextareaElement(document.createElement("input"))).toBe(false);
});
