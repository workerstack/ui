import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../test/hydration.ts";
import { required } from "../test/required.ts";
import { SwitchFixture } from "./__fixtures__/switch.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/switch.hydration.fixture.tsx", import.meta.url), { SwitchFixture });

it("hydrating Switch claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("SwitchFixture"))).toStrictEqual({});
});

it("hydrating Switch toggles from the server's node", async () => {
  const hydrated = await hydrate("SwitchFixture");
  const control = required(hydrated.container.querySelector('[role="switch"]'), "the server's switch");
  expect(control.getAttribute("aria-checked")).toBe("true");
  await userEvent.click(page.getByRole("switch", { name: "Notifications" }));
  await expect.element(page.getByRole("status")).toHaveTextContent("off");
  await expect.element(page.getByRole("switch", { name: "Notifications" })).toHaveAttribute("aria-checked", "false");
  expect(hydrated.container.querySelector('[role="switch"]')).toBe(control);
});
