import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { required } from "../../test/required.ts";
import { ButtonFixture } from "./__fixtures__/button.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/button.hydration.fixture.tsx", import.meta.url), { ButtonFixture });

it("hydrating Button claims the server's nodes without warnings", async () => {
  const { mismatches } = await hydrate("ButtonFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Button runs the handler on the server's button and updates its text", async () => {
  const hydrated = await hydrate("ButtonFixture");
  const server = required(hydrated.container.querySelector("button"), "the server's button");
  await userEvent.click(page.getByRole("button", { name: "Clicked 0" }));
  await expect.element(page.getByRole("button", { name: "Clicked 1" })).toBeInTheDocument();
  expect(hydrated.container.querySelector("button")).toBe(server);
});

it("hydrating Button keeps the disabled button disabled", async () => {
  await hydrate("ButtonFixture");
  const disabled = page.getByRole("button", { name: "Disabled" }).element();
  expect(disabled).toBeInstanceOf(HTMLButtonElement);
  expect(disabled.matches(":disabled")).toBe(true);
  expect(disabled.hasAttribute("data-disabled")).toBe(true);
});

it("hydrating Button keeps the loading button busy, disabled and showing its spinner", async () => {
  await hydrate("ButtonFixture");
  const loading = page.getByRole("button", { name: /Loading/ }).element();
  expect(loading.getAttribute("aria-busy")).toBe("true");
  expect(loading.matches(":disabled")).toBe(true);
  expect(getComputedStyle(required(loading.querySelector("[data-slot=button-spinner]"), "a spinner")).display).toBe(
    "flex",
  );
});
