import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { UI_MESSAGES_EN as M } from "../provider/index.ts";
import { inputElement, mounted, type } from "../test/dom.ts";
import { LimitedInput, ReadOnlyInput, RequiredBlankForm, UncleanedInput } from "./__fixtures__/input-rules.fixture.tsx";

afterEach(cleanup);

// One family emoji is many UTF-16 units but one thing a person sees.
const FAMILY = "👨‍👩‍👧";

it("Input read-only has no placeholder and keeps its value", () => {
  render(() => <ReadOnlyInput value="Pro" />);
  const input = inputElement(screen.getByRole("textbox", { name: "Plan" }));
  expect(input.hasAttribute("placeholder")).toBe(false);
  expect(input.value).toBe("Pro");
  expect(input.readOnly).toBe(true);
  expect(input.hasAttribute("data-readonly")).toBe(true);
});

it("Input required treats blank text as missing and the Field shows the UI's message", async () => {
  const view = render(() => <RequiredBlankForm />);
  await mounted();
  expect(inputElement(screen.getByRole("textbox", { name: "Name" })).required).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await vi.waitFor(() =>
    expect(view.container.querySelector("[data-slot=field-error]")?.textContent).toBe(M.requiredText),
  );
});

it("Input maxLength counts what a person sees, not UTF-16 units", async () => {
  render(() => <LimitedInput />);
  await mounted();
  const input = inputElement(screen.getByRole("textbox", { name: "Code" }));
  type(input, FAMILY + FAMILY);
  expect(input.value.length).toBeGreaterThan(2);
  expect(input.validationMessage).toBe("");
  type(input, FAMILY.repeat(3));
  expect(input.validationMessage).toBe(M.textTooLong(3, 2));
  expect(input.value).toBe(FAMILY.repeat(3));
});

it("TextInput with clean={false} stores the text as typed", async () => {
  const view = render(() => <UncleanedInput />);
  await mounted();
  const input = inputElement(screen.getByRole("textbox", { name: "Raw" }));
  type(input, "  Ada ");
  fireEvent.blur(input);
  expect(input.value).toBe("  Ada ");
  await vi.waitFor(() => expect(view.container.querySelector("output")?.textContent).toBe("[  Ada ]"));
});
