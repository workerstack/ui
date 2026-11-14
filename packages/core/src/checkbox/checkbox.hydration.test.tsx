import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../test/hydration.ts";
import { required } from "../test/required.ts";
import { CheckboxFixture, CheckedCheckboxFixture } from "./__fixtures__/checkbox.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/checkbox.hydration.fixture.tsx", import.meta.url), {
  CheckboxFixture,
  CheckedCheckboxFixture,
});

const TERMS = { name: "Accept terms" };

it("hydrating Checkbox claims the server's nodes without a mismatch", async () => {
  expect(mismatch(await hydrate("CheckboxFixture"))).toStrictEqual({});
});

it("hydrating a checked Checkbox claims the server's nodes without a mismatch", async () => {
  expect(mismatch(await hydrate("CheckedCheckboxFixture"))).toStrictEqual({});
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
