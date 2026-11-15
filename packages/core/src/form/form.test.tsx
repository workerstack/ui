import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { inputElement, mounted } from "../test/dom.ts";
import {
  captured,
  deferred,
  descriptionOf,
  errorTexts,
  settle,
  submit,
  typeInto,
} from "./__fixtures__/form-testing.ts";
import { type Account, AccountForm } from "./__fixtures__/form.fixture.tsx";
import { applyServerErrors, type FormFor } from "./index.ts";

afterEach(cleanup);

function box(name: string): HTMLInputElement {
  return inputElement(screen.getByRole("textbox", { name }));
}

it("Form shows no errors before a submit, even for fields left empty", async () => {
  const { container } = render(() => <AccountForm />);
  await mounted();
  typeInto(box("Name"), "");
  await settle();
  expect(errorTexts(container)).toStrictEqual([]);
});

it("Form submit shows each field's errors through the Field, then they revalidate as the person types", async () => {
  const { container } = render(() => <AccountForm />);
  await mounted();
  await submit(container);
  expect(errorTexts(container)).toStrictEqual(["Enter your name.", "Enter your email."]);
  expect(box("Name").getAttribute("aria-invalid")).toBe("true");
  expect(descriptionOf(box("Name"))).toContain("Enter your name.");
  typeInto(box("Name"), "Ada");
  await settle();
  expect(errorTexts(container)).toStrictEqual(["Enter your email."]);
  expect(box("Name").getAttribute("aria-invalid")).toBeNull();
  typeInto(box("Name"), "");
  await settle();
  expect(errorTexts(container)).toStrictEqual(["Enter your name.", "Enter your email."]);
});

it("Form sends the values once every field is valid", async () => {
  const sent = vi.fn<(values: Account) => void>();
  const { container } = render(() => <AccountForm onSubmit={sent} />);
  await mounted();
  typeInto(box("Name"), "Ada");
  typeInto(box("Email"), "ada@example.com");
  await submit(container);
  expect(sent.mock.calls).toStrictEqual([[{ email: "ada@example.com", name: "Ada", phone: "" }]]);
  expect(errorTexts(container)).toStrictEqual([]);
});

it("Form submit with one problem focuses that field's control", async () => {
  const { container } = render(() => <AccountForm defaults={{ name: "Ada" }} />);
  await mounted();
  await submit(container);
  expect(document.activeElement).toBe(box("Email"));
  expect(container.querySelector("[data-slot=form-error-summary]")).toBeNull();
});

it("Form marks its required fields' labels", async () => {
  const { container } = render(() => <AccountForm />);
  await mounted();
  expect(container.querySelectorAll("label[data-mark]").length).toBe(2);
});

it("Form puts server errors on their fields, and each clears when its field changes", async () => {
  const form = captured<FormFor<Account>>();
  const defaults = { email: "ada@example.com", name: "Ada" };
  const { container } = render(() => <AccountForm defaults={defaults} keep={form.set} />);
  await mounted();
  await submit(container);
  applyServerErrors(form.get(), { email: ["Taken."], name: ["Too common."] });
  await settle();
  expect(errorTexts(container)).toStrictEqual(["Too common.", "Taken."]);
  expect(box("Email").getAttribute("aria-invalid")).toBe("true");
  typeInto(box("Email"), "grace@example.com");
  await settle();
  expect(errorTexts(container)).toStrictEqual(["Too common."]);
});

it("Form read-only renders each field's View in place of its control, with no required marks", async () => {
  const { container } = render(() => <AccountForm readOnly defaults={{ name: "Ada" }} />);
  await mounted();
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(container.querySelector("[data-slot=view]")?.textContent).toBe("Ada");
  expect(container.querySelectorAll("[data-slot=view]").length).toBe(3);
  expect(container.querySelector("[data-mark]")).toBeNull();
});

it("FormError shows a form-level server message as an alert", async () => {
  const form = captured<FormFor<Account>>();
  render(() => <AccountForm keep={form.set} />);
  await mounted();
  form.get().setErrorMap({ onSubmit: "The server is down." });
  await settle();
  expect(screen.getByRole("alert").textContent).toBe("The server is down.");
});

it("SubmitButton is busy while the submit runs, and idle after", async () => {
  const release = deferred();

  const { container } = render(() => (
    <AccountForm defaults={{ email: "ada@example.com", name: "Ada" }} onSubmit={() => release.promise} />
  ));

  await mounted();
  const save = screen.getByRole("button", { name: "Save" });
  const done = submit(container);
  await settle();
  expect(save.getAttribute("aria-busy")).toBe("true");
  release.resolve();
  await done;
  await settle();
  expect(save.getAttribute("aria-busy")).toBeNull();
});
