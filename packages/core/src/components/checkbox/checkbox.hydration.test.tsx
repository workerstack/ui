import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { required } from "../../test/required.ts";
import {
  CheckboxFixture,
  CheckboxViewFixture,
  CheckedCheckboxFixture,
} from "./__fixtures__/checkbox.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/checkbox.hydration.fixture.tsx", import.meta.url), {
  CheckboxFixture,
  CheckboxViewFixture,
  CheckedCheckboxFixture,
});

const TERMS = { name: "Accept terms" };

it("hydrating Checkbox claims the server's nodes without a mismatch", async () => {
  const { mismatches } = await hydrate("CheckboxFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating a checked Checkbox claims the server's nodes without a mismatch", async () => {
  const { mismatches } = await hydrate("CheckedCheckboxFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Checkbox keeps the server's checked state", async () => {
  const hydrated = await hydrate("CheckedCheckboxFixture");
  expect(hydrated.server.html).toContain('aria-checked="true"');
  await expect.element(page.getByRole("checkbox", TERMS)).toHaveAttribute("aria-checked", "true");
});

it("hydrating Checkbox toggles from the server's button", async () => {
  const hydrated = await hydrate("CheckboxFixture");
  const button = required(hydrated.container.querySelector('[role="checkbox"]'), "the server's checkbox");
  await userEvent.click(page.getByRole("checkbox", TERMS));
  await expect.element(page.getByRole("status")).toHaveTextContent("true");
  await expect.element(page.getByRole("checkbox", TERMS)).toHaveAttribute("aria-checked", "true");
  await userEvent.click(page.getByText("Accept terms"));
  await expect.element(page.getByRole("status")).toHaveTextContent("false");
  expect(hydrated.container.querySelector('[role="checkbox"]')).toBe(button);
});

it("hydrating CheckboxView and CheckboxGroupView claims the server's nodes and keeps their text", async () => {
  const { mismatches } = await hydrate("CheckboxViewFixture");
  expect(mismatches).toStrictEqual({});
  await expect.element(page.getByRole("status", { name: "Accepted" })).toHaveTextContent("Yes");
  await expect.element(page.getByRole("group", { name: "Notify by" })).toHaveTextContent("Notify bySMS, Email");
});
