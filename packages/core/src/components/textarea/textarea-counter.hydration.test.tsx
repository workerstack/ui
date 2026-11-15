import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { CounterFixture, ViewsFixture } from "./__fixtures__/textarea.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/textarea.hydration.fixture.tsx", import.meta.url), {
  CounterFixture,
  ViewsFixture,
});

it("hydrating a Textarea with a counter claims the server's nodes without warnings", async () => {
  const { mismatches } = await hydrate("CounterFixture");
  expect(mismatches).toStrictEqual({});
  await expect.element(page.getByText("17/10")).toBeVisible();
});

it("hydrating a Textarea keeps the counter live", async () => {
  await hydrate("CounterFixture");
  await userEvent.click(page.getByRole("textbox", { name: "Notes" }));
  await userEvent.keyboard("{Backspace}{Backspace}");
  await expect.element(page.getByText("15/10")).toBeVisible();
});

it("hydrating TextareaView claims the server's nodes without warnings", async () => {
  const { mismatches } = await hydrate("ViewsFixture");
  expect(mismatches).toStrictEqual({});
});
