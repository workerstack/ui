import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted, type } from "../test/dom.ts";
import { required } from "../test/required.ts";
import { InvalidNotesTextarea, NotesTextarea } from "./__fixtures__/textarea.fixture.tsx";
import type { TextareaProps } from "./index.ts";

type OnValueChange = NonNullable<TextareaProps["onValueChange"]>;

afterEach(cleanup);

function box(): HTMLTextAreaElement {
  const el = screen.getByRole("textbox", { name: "Notes" });

  if (!(el instanceof HTMLTextAreaElement)) throw new Error("expected a <textarea>");

  return el;
}

it("Textarea in a Field is named by the label and takes the field's name", () => {
  render(() => <NotesTextarea />);
  expect(box().getAttribute("name")).toBe("notes");
  expect(box().className).toContain("rounded-md");
});

it("Textarea reports typed values through onValueChange", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <NotesTextarea onValueChange={onValueChange} />);
  await mounted();
  type(box(), "a\nb");
  expect(onValueChange).toHaveBeenLastCalledWith("a\nb", expect.anything());
});

it("Textarea cleans its text on blur and reports the change once", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <NotesTextarea onValueChange={onValueChange} />);
  await mounted();
  type(box(), "\n\nhello​ world  \n\n");
  onValueChange.mockClear();
  fireEvent.blur(box());
  expect(box().value).toBe("hello world");
  expect(onValueChange.mock.calls.map(([value]) => value)).toStrictEqual(["hello world"]);
});

it("Textarea leaves clean text alone on blur", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <NotesTextarea onValueChange={onValueChange} />);
  await mounted();
  type(box(), "one\ntwo");
  onValueChange.mockClear();
  fireEvent.blur(box());
  expect(box().value).toBe("one\ntwo");
  expect(onValueChange).not.toHaveBeenCalled();
});

it("Textarea does not clean while typing", async () => {
  render(() => <NotesTextarea />);
  await mounted();
  type(box(), "hello ");
  expect(box().value).toBe("hello ");
});

it("Textarea stores text as typed when clean is false", async () => {
  render(() => <NotesTextarea clean={false} />);
  await mounted();
  type(box(), "  hi  ");
  fireEvent.blur(box());
  expect(box().value).toBe("  hi  ");
});

it("Textarea stores what a custom clean returns", async () => {
  render(() => <NotesTextarea clean={(text) => text.toUpperCase()} />);
  await mounted();
  type(box(), "hi");
  fireEvent.blur(box());
  expect(box().value).toBe("HI");
});

it("Textarea leaves a read-only value alone on blur", () => {
  render(() => <NotesTextarea defaultValue="  hi  " readonly />);
  fireEvent.blur(box());
  expect(box().value).toBe("  hi  ");
});

it("Textarea calls the consumer's onBlur after cleaning", async () => {
  const seen: string[] = [];
  render(() => <NotesTextarea onBlur={(event) => seen.push(event.currentTarget.value)} />);
  await mounted();
  type(box(), "  hi  ");
  fireEvent.blur(box());
  expect(seen).toStrictEqual(["hi"]);
});

it("Textarea is disabled with its disabled prop", () => {
  render(() => <NotesTextarea disabled />);
  expect(box().disabled).toBe(true);
  expect(box().className).toContain("disabled:opacity-50");
});

it("Textarea in an invalid Field is marked invalid", () => {
  render(() => <InvalidNotesTextarea />);
  expect(box().getAttribute("aria-invalid")).toBe("true");
  expect(required(screen.getByText("Notes"), "the label").hasAttribute("data-invalid")).toBe(true);
});
