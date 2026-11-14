import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { Input } from "../input/index.ts";
import { required } from "../test/required.ts";
import { InvalidEmailField } from "./__fixtures__/invalid-email-field.fixture.tsx";
import { Field, FieldDescription, FieldError, FieldLabel } from "./index.ts";

afterEach(cleanup);

/** The parts of a Field, by data-slot. */
const PARTS = ["field", "field-label", "field-description", "field-error"];

it("Field labels its control and is described by its description", () => {
  render(() => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldDescription>We never share it.</FieldDescription>
    </Field>
  ));
  const input = screen.getByRole("textbox", { name: "Email" });
  const label = screen.getByText("Email");
  expect(label.tagName).toBe("LABEL");
  expect(label.getAttribute("for")).toBe(input.id);
  const description = screen.getByText("We never share it.");
  expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(description.id);
});

it("Field gives the control its name", () => {
  render(() => (
    <Field name="email">
      <FieldLabel>Email</FieldLabel>
      <Input />
    </Field>
  ));
  expect(screen.getByRole("textbox", { name: "Email" }).getAttribute("name")).toBe("email");
});

it("Field marks every part invalid and shows the error while invalid", async () => {
  render(() => <InvalidEmailField />);
  const input = screen.getByRole("textbox", { name: "Email" });
  expect(input.getAttribute("aria-invalid")).toBe("true");
  const invalid = PARTS.map((part) => document.querySelector(`[data-slot="${part}"]`)?.hasAttribute("data-invalid"));
  expect(invalid).toStrictEqual(PARTS.map(() => true));
  const error = screen.getByText("That email is taken.");
  await vi.waitFor(() => expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(error.id));
});

it("Field leaves the error out while valid", () => {
  render(() => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldError>That email is taken.</FieldError>
    </Field>
  ));
  expect(screen.queryByText("That email is taken.")).toBeNull();
  expect(screen.getByRole("textbox", { name: "Email" }).hasAttribute("aria-invalid")).toBe(false);
});

it("Field styles each part and lets the consumer's class win", () => {
  render(() => (
    <Field class="gap-4" invalid>
      <FieldLabel class="font-bold">Email</FieldLabel>
      <Input />
      <FieldDescription>Hint</FieldDescription>
      <FieldError match>Bad</FieldError>
    </Field>
  ));
  const field = required(document.querySelector('[data-slot="field"]'), "a field");
  expect(field.className).toContain("gap-4");
  expect(field.className).not.toContain("gap-2");
  expect(screen.getByText("Email").className).toContain("font-bold");
  expect(screen.getByText("Email").className).not.toContain("font-medium");
  expect(screen.getByText("Hint").className).toContain("text-muted-foreground");
  expect(screen.getByText("Bad").className).toContain("text-destructive");
});
