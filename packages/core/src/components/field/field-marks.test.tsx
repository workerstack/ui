import { cleanup, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, expect, it } from "vitest";

import { mounted } from "../../test/dom.ts";
import { FieldSaysRequired, MarkedForm, TwoFields } from "./__fixtures__/marks.fixture.tsx";
import { HookField } from "./__fixtures__/required-mark.fixture.tsx";
import { FIELD_MARKS_MESSAGES_EN as M } from "./field-marks.messages.ts";
import type { FieldMarks } from "./index.ts";

afterEach(cleanup);

// Each label's text with the mark the theme draws after it: "*" or "(optional)".
function labels(root: HTMLElement): string[] {
  return [...root.querySelectorAll<HTMLElement>("[data-slot=field-label]")].map((label) => {
    const mark = label.getAttribute("data-mark");
    const text = label.getAttribute("data-mark-text") ?? "";

    return `${label.textContent.trim()}${mark === "optional" ? ` ${text}` : text}`;
  });
}

// What a form that marks as `marks` says on its two fields.
async function marked(marks: FieldMarks): Promise<string[]> {
  const view = render(() => <MarkedForm marks={marks} />);
  await mounted();
  flush();
  const result = labels(view.container);
  cleanup();

  return result;
}

it("Field marks required and optional fields in a form, each as the form says", async () => {
  expect(await marked("both")).toStrictEqual(["Name*", `Nickname ${M.optionalMark}`]);
  expect(await marked("required")).toStrictEqual(["Name*", "Nickname"]);
  expect(await marked("optional")).toStrictEqual(["Name", `Nickname ${M.optionalMark}`]);
  expect(await marked("none")).toStrictEqual(["Name", "Nickname"]);
});

it("Field draws the mark from attributes, so the label keeps its own text", async () => {
  render(() => <MarkedForm marks="both" />);
  await mounted();
  flush();
  const name = screen.getByText("Name");
  expect(name.getAttribute("data-mark")).toBe("required");
  expect(name.textContent).toBe("Name");
  expect(screen.getByRole("textbox", { name: "Name" })).toBeTruthy();
});

it("Field marks nothing outside a form", async () => {
  const view = render(() => <TwoFields />);
  await mounted();
  flush();
  expect(labels(view.container)).toStrictEqual(["Name", "Nickname"]);
});

it("Field marks a field required by its prop, and never a read-only one", async () => {
  const view = render(() => <FieldSaysRequired />);
  await mounted();
  flush();
  expect(labels(view.container)).toStrictEqual(["Plan*", "Ref"]);
});

it("useRequiredMark marks the label while the control it joined is required", async () => {
  const view = render(() => <HookField required />);
  await mounted();
  await mounted();
  flush();
  expect(labels(view.container)).toStrictEqual(["Pick*"]);
});

it("useRequiredMark leaves the label unmarked while the control is not required", async () => {
  const view = render(() => <HookField required={false} />);
  await mounted();
  await mounted();
  flush();
  expect(labels(view.container)).toStrictEqual(["Pick"]);
});
