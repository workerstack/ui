import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { NO_RING, rect, settled, style, token } from "../../test/browser.ts";
import { InvalidNotesTextarea, LimitedNotes, NotesTextarea } from "./__fixtures__/textarea.fixture.tsx";
import type { TextareaProps } from "./index.ts";

type OnValueChange = NonNullable<TextareaProps["onValueChange"]>;

/** `min-h-16` in px. */
const MIN_HEIGHT = 64;

afterEach(cleanup);

function box(): HTMLTextAreaElement {
  const el = page.getByRole("textbox", { name: "Notes" }).element();

  if (!(el instanceof HTMLTextAreaElement)) throw new Error("expected a <textarea>");

  return el;
}

it("Textarea reports real typing, new lines included", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <NotesTextarea onValueChange={onValueChange} />);
  await userEvent.type(page.getByRole("textbox", { name: "Notes" }), "a{Enter}b");
  expect(box().value).toBe("a\nb");
  expect(onValueChange.mock.calls.map(([value]) => value)).toStrictEqual(["a", "a\n", "a\nb"]);
});

it("Textarea keeps its minimum height when empty", () => {
  render(() => <NotesTextarea />);
  expect(rect(box()).height).toBeGreaterThanOrEqual(MIN_HEIGHT);
  expect(style(box()).minHeight).toBe("64px");
});

it("Textarea grows with its content", async () => {
  render(() => <NotesTextarea />);
  const before = rect(box()).height;
  await userEvent.type(page.getByRole("textbox", { name: "Notes" }), "1{Enter}2{Enter}3{Enter}4{Enter}5{Enter}6");
  expect(rect(box()).height).toBeGreaterThan(before);
});

it("Textarea cleans its text when focus leaves", async () => {
  render(() => <NotesTextarea />);
  await userEvent.type(page.getByRole("textbox", { name: "Notes" }), "{Enter}hi  {Enter}");
  expect(box().value).toBe("\nhi  \n");
  await userEvent.tab();
  expect(box().value).toBe("hi");
});

it("Textarea rings when it has keyboard focus", async () => {
  render(() => <NotesTextarea />);
  expect(style(box()).borderTopColor).toBe(token("--ui-input"));
  await userEvent.tab();
  expect(document.activeElement).toBe(box());
  await settled(box());
  expect(style(box()).borderTopColor).toBe(token("--ui-ring"));
  expect(style(box()).boxShadow).not.toMatch(NO_RING);
});

it("Textarea draws an invalid border in the destructive color", () => {
  render(() => <InvalidNotesTextarea />);
  expect(style(box()).borderTopColor).toBe(token("--ui-destructive"));
});

it("Textarea fades when disabled", () => {
  render(() => <NotesTextarea disabled />);
  expect(style(box()).opacity).toBe("0.5");
});

it("Textarea puts the counter under the box, at its end, and turns it destructive past the limit", async () => {
  render(() => <LimitedNotes />);
  const count = page.getByText("0/10").element();
  expect(rect(count).top).toBeGreaterThanOrEqual(rect(box()).bottom);
  expect(Math.round(rect(count).right)).toBe(Math.round(rect(box()).right));
  expect(style(count).color).toBe(token("--ui-muted-foreground"));
  await userEvent.type(page.getByRole("textbox", { name: "Notes" }), "abcdefghijk");
  await expect.element(page.getByText("11/10")).toBeVisible();
  expect(style(page.getByText("11/10").element()).color).toBe(token("--ui-destructive"));
});

it("Textarea read-only has no border and no placeholder but keeps its size", () => {
  render(() => <NotesTextarea placeholder="Write" />);
  const editable = rect(box()).height;
  const border = style(box()).borderTopColor;
  cleanup();
  render(() => <NotesTextarea readonly placeholder="Write" defaultValue="Hi" />);
  expect(box().placeholder).toBe("");
  expect(style(box()).borderTopColor).not.toBe(border);
  expect(style(box()).borderTopColor).toBe("rgba(0, 0, 0, 0)");
  expect(rect(box()).height).toBe(editable);
});
