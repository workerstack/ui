import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { inputElement, mounted } from "../../../../test/dom.ts";
import { required } from "../../../../test/required.ts";
import { captured, settle, submit, typeInto } from "./__fixtures__/form-testing.ts";
import { type Account, AccountForm } from "./__fixtures__/form.fixture.tsx";
import { applyServerErrors, type FormFor } from "./index.ts";

afterEach(cleanup);

function summary(container: Element): HTMLElement | null {
  return container.querySelector<HTMLElement>("[data-slot=form-error-summary]");
}

function items(container: Element): string[] {
  return [...(summary(container)?.querySelectorAll("li") ?? [])].map((item) => item.textContent.trim());
}

it("FormErrorSummary lists two or more problems after a submit, focused, under its title", async () => {
  const { container } = render(() => <AccountForm />);
  await mounted();
  await submit(container);
  expect(items(container)).toStrictEqual(["Name: Enter your name.", "Email: Enter your email."]);
  expect(document.activeElement).toBe(summary(container));
  expect(screen.getByRole("heading", { name: "There's a problem" })).toBeTruthy();
});

it("FormErrorSummary links focus their fields' controls", async () => {
  const { container } = render(() => <AccountForm />);
  await mounted();
  await submit(container);
  const email = required(screen.getByRole("link", { name: "Email: Enter your email." }), "the email link");
  fireEvent.click(email);
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Email" }));
});

it("FormErrorSummary follows the fields as they are fixed", async () => {
  const { container } = render(() => <AccountForm />);
  await mounted();
  await submit(container);
  typeInto(inputElement(screen.getByRole("textbox", { name: "Name" })), "Ada");
  await settle();
  expect(items(container)).toStrictEqual(["Email: Enter your email."]);
});

it("FormErrorSummary lists a server error for a field the form doesn't show, as text", async () => {
  const form = captured<FormFor<Account>>();
  const { container } = render(() => <AccountForm keep={form.set} />);
  await mounted();
  await submit(container);
  applyServerErrors(form.get(), { name: ["Too common."], phone: ["Unknown."] });
  form.get().setFieldMeta("nickname", (meta) => ({ ...meta, errorMap: { onServer: "Hidden." } }));
  await settle();
  expect(items(container)).toContain("Hidden.");
});
