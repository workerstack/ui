import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../../test/hydration.ts";
import { required } from "../../test/required.ts";
import { RadioGroupFixture, RadioGroupViewFixture } from "./__fixtures__/radio-group.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/radio-group.hydration.fixture.tsx", import.meta.url), {
  RadioGroupFixture,
  RadioGroupViewFixture,
});

function radio(name: string): ReturnType<typeof page.getByRole> {
  return page.getByRole("radio", { name });
}

it("hydrating RadioGroup claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("RadioGroupFixture"))).toStrictEqual({});
});

it("hydrating RadioGroup keeps the server's selected radio", async () => {
  const hydrated = await hydrate("RadioGroupFixture");
  expect(hydrated.server.html).toContain('aria-checked="true"');
  await expect.element(radio("Pro")).toBeChecked();
  await expect.element(radio("Free")).not.toBeChecked();
});

it("hydrating RadioGroup selects with a click after hydration", async () => {
  const hydrated = await hydrate("RadioGroupFixture");
  const team = required(hydrated.container.querySelectorAll('[role="radio"]')[2], "the server's Team radio");
  await userEvent.click(radio("Team"));
  await expect.element(radio("Team")).toBeChecked();
  await expect.element(radio("Pro")).not.toBeChecked();
  await expect.element(page.getByRole("status")).toHaveTextContent("team");
  expect(hydrated.container.querySelectorAll('[role="radio"]')[2]).toBe(team);
});

it("hydrating RadioGroup moves the selection with the arrow keys after hydration", async () => {
  await hydrate("RadioGroupFixture");
  await userEvent.tab();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(radio("Team")).toBeChecked();
  await expect.element(page.getByRole("status")).toHaveTextContent("team");
});

it("hydrating RadioGroupView claims the server's nodes and keeps its text", async () => {
  expect(mismatch(await hydrate("RadioGroupViewFixture"))).toStrictEqual({});
  await expect.element(page.getByRole("group", { name: "Plan" })).toHaveTextContent("PlanBusiness");
});
