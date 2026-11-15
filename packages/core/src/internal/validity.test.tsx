import { cleanup, render, screen } from "@solidjs/testing-library";
import type { JSX } from "@solidjs/web";
import { flush } from "solid-js";
import { afterEach, expect, it } from "vitest";

import { UI_MESSAGES_EN as M } from "../components/provider/index.ts";
import { inputElement, mounted, type } from "../test/dom.ts";
import { ValidityInput, ValidityTextarea } from "./__fixtures__/validity.fixture.tsx";
import { setRequired, setValidity } from "./validity.ts";

afterEach(cleanup);

const ZWSP = String.fromCodePoint(0x200b);
const BLANKS = ["", "   ", `\t${ZWSP} `];
const CODER = `${String.fromCodePoint(0x1f469)}${String.fromCodePoint(0x200d)}${String.fromCodePoint(0x1f4bb)}`;

// What the box reports once the mount check and its microtask have run.
async function message(box: () => JSX.Element): Promise<string> {
  const view = render(box);

  await mounted();
  flush();

  const element = view.container.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");

  return element?.validationMessage ?? "no box";
}

it.each(BLANKS)("%j is missing in a required input and textarea", async (text) => {
  expect(await message(() => <ValidityInput required defaultValue={text} />)).toBe(M.requiredText);
  cleanup();
  expect(await message(() => <ValidityTextarea required defaultValue={text} />)).toBe(M.requiredText);
});

it("an email or URL of spaces is missing too", async () => {
  expect(await message(() => <ValidityInput required type="email" defaultValue="   " />)).toBe(M.requiredText);
  cleanup();
  expect(await message(() => <ValidityInput required type="url" defaultValue="   " />)).toBe(M.requiredText);
});

it("visible text is whole, and an optional blank box asks nothing", async () => {
  expect(await message(() => <ValidityInput required defaultValue="Ada" />)).toBe("");
  cleanup();
  expect(await message(() => <ValidityTextarea required defaultValue="a" />)).toBe("");
  cleanup();
  expect(await message(() => <ValidityInput defaultValue="   " />)).toBe("");
});

it("a password of spaces is whole", async () => {
  expect(await message(() => <ValidityInput required type="password" defaultValue="   " />)).toBe("");
});

it("typing spaces into a required box makes it missing, and a letter fixes it", async () => {
  render(() => <ValidityInput required />);
  await mounted();

  const box = inputElement(screen.getByRole("textbox", { name: "Box" }));

  type(box, "  ");
  expect(box.validationMessage).toBe(M.requiredText);
  type(box, "  a");
  expect(box.validationMessage).toBe("");
});

it("maxLength counts what a person sees, not UTF-16 units, and never blocks typing", async () => {
  expect(await message(() => <ValidityInput maxLength={3} defaultValue={CODER.repeat(3)} />)).toBe("");
  cleanup();
  expect(await message(() => <ValidityInput maxLength={3} defaultValue="abcd" />)).toBe(M.textTooLong(4, 3));
  cleanup();
  expect(await message(() => <ValidityTextarea maxLength={2} defaultValue={`${CODER}é`} />)).toBe("");

  render(() => <ValidityInput maxLength={5} />);
  await mounted();

  const box = inputElement(screen.getByRole("textbox", { name: "Box" }));

  expect(box.hasAttribute("maxlength")).toBe(false);
  type(box, "hello!");
  expect(box.value).toBe("hello!");
  expect(box.validationMessage).toBe(M.textTooLong(6, 5));
  type(box, "hello");
  expect(box.validationMessage).toBe("");
});

it("setValidity reports the required rule first and the next one once it clears", () => {
  const box = document.createElement("input");

  setValidity(box, "length", "Too long.");
  setValidity(box, "required", "Missing.");
  expect(box.validationMessage).toBe("Missing.");
  setValidity(box, "required", false);
  expect(box.validationMessage).toBe("Too long.");
  setValidity(box, "length", null);
  expect(box.validationMessage).toBe("");
});

it("setRequired asks only while the element is required and missing", () => {
  const box = document.createElement("input");

  setRequired(box, { message: "Missing.", missing: true });
  expect(box.validity.customError).toBe(false);
  box.required = true;
  setRequired(box, { message: "Missing.", missing: true });
  expect(box.validity.customError).toBe(true);
  setRequired(box, { message: "Missing.", missing: false });
  expect(box.validity.customError).toBe(false);
});
