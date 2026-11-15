import { cleanup, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { inputElement, mounted, type } from "../../test/dom.ts";
import { UI_MESSAGES_EN as M } from "../provider/index.ts";
import { RequiredBox, RequiredForm } from "./__fixtures__/required-error.fixture.tsx";

afterEach(cleanup);

it("FieldError makes typing spaces into a required box missing, and typing a letter fixes it", async () => {
  render(() => <RequiredBox />);
  await mounted();
  flush();
  const box = inputElement(screen.getByRole("textbox", { name: "Name" }));
  type(box, "  ");
  expect(box.validationMessage).toBe(M.requiredText);
  type(box, "  a");
  expect(box.validationMessage).toBe("");
});

it("FieldError shows the UI's message for a missing value, never the browser's", async () => {
  const view = render(() => <RequiredForm />);
  await mounted();
  flush();
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  await vi.waitFor(() => expect(view.container.querySelectorAll("[data-slot=field-error]")).toHaveLength(2));
  const errors = [...view.container.querySelectorAll("[data-slot=field-error]")].map((error) => error.textContent);
  expect(errors).toStrictEqual([M.requiredField, M.requiredText]);
});

it("FieldError stays out until a submit finds the field invalid", async () => {
  const view = render(() => <RequiredForm />);
  await mounted();
  flush();
  const plan = screen.getByRole("combobox", { name: "Plan" });
  expect(plan instanceof HTMLSelectElement && plan.validity.valueMissing).toBe(true);
  expect(view.container.querySelector("[data-slot=field-error]")).toBeNull();
});
