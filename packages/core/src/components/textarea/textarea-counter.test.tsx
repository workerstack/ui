import { cleanup, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, expect, it } from "vitest";

import { mounted, type } from "../../test/dom.ts";
import { required } from "../../test/required.ts";
import { UI_MESSAGES_EN as M } from "../provider/index.ts";
import { LimitedNotes, NotesTextarea, RequiredNotes } from "./__fixtures__/textarea.fixture.tsx";

afterEach(cleanup);

const FAMILY = "👨‍👩‍👧";

function box(): HTMLTextAreaElement {
  const el = screen.getByRole("textbox", { name: "Notes" });

  if (!(el instanceof HTMLTextAreaElement)) throw new Error("expected a <textarea>");

  return el;
}

function counter(): string {
  return required(document.querySelector("[data-slot=textarea-counter]"), "a counter").textContent;
}

it("Textarea counts graphemes against maxLength and updates as the text changes", async () => {
  render(() => <LimitedNotes defaultValue={`${FAMILY}${FAMILY}`} />);
  await mounted();
  expect(counter()).toBe("2/10");
  type(box(), "abcd");
  flush();
  expect(counter()).toBe("4/10");
});

it("Textarea without maxLength or read-only shows no counter", () => {
  render(() => <NotesTextarea />);
  expect(document.querySelector("[data-slot=textarea-counter]")).toBeNull();
  cleanup();
  render(() => <LimitedNotes readonly defaultValue="a" />);
  expect(document.querySelector("[data-slot=textarea-counter]")).toBeNull();
});

it("Textarea follows a controlled value in its counter", () => {
  render(() => <LimitedNotes value="abc" />);
  expect(counter()).toBe("3/10");
});

it("Textarea reports over-length text as the UI's message, live", async () => {
  render(() => <LimitedNotes />);
  await mounted();
  flush();
  type(box(), "abcdefghijkl");
  expect(box().validationMessage).toBe(M.textTooLong(12, 10));
  expect(box().value).toBe("abcdefghijkl");
  type(box(), "abcdefghij");
  expect(box().validationMessage).toBe("");
});

it("Textarea of spaces is missing when required, in the UI's words", async () => {
  render(() => <RequiredNotes />);
  await mounted();
  flush();
  expect(box().required).toBe(true);
  type(box(), "   ");
  expect(box().validationMessage).toBe(M.requiredText);
});
