import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../../test/hydration.ts";
import { required } from "../../test/required.ts";
import { BadgeFixture } from "./__fixtures__/badge.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/badge.hydration.fixture.tsx", import.meta.url), { BadgeFixture });

it("hydrating Badge claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("BadgeFixture"))).toStrictEqual({});
});

it("hydrating Badge updates its text on the server's span", async () => {
  const hydrated = await hydrate("BadgeFixture");
  const server = required(hydrated.container.querySelector("button [data-slot=badge]"), "the server's count badge");
  await userEvent.click(page.getByRole("button", { name: "Count 0" }));
  await expect.element(page.getByText("Count 1")).toBeInTheDocument();
  expect(hydrated.container.querySelector("button [data-slot=badge]")).toBe(server);
});
