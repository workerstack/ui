import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../test/hydration.ts";
import { CounterFixture, ViewsFixture } from "./__fixtures__/textarea.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/textarea.hydration.fixture.tsx", import.meta.url), {
  CounterFixture,
  ViewsFixture,
});

it("hydrating a Textarea with a counter claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("CounterFixture"), ["serverWarnings", "warnings", "replaced"])).toStrictEqual({});
  await expect.element(page.getByText("17/10")).toBeVisible();
});

it("hydrating a Textarea keeps the counter live", async () => {
  await hydrate("CounterFixture");
  await userEvent.click(page.getByRole("textbox", { name: "Notes" }));
  await userEvent.keyboard("{Backspace}{Backspace}");
  await expect.element(page.getByText("15/10")).toBeVisible();
});

it("hydrating TextareaView claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("ViewsFixture"))).toStrictEqual({});
});
