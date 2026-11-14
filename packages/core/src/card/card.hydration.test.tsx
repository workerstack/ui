import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch } from "../test/hydration.ts";
import { required } from "../test/required.ts";
import { CardFixture } from "./__fixtures__/card.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/card.hydration.fixture.tsx", import.meta.url), { CardFixture });

it("hydrating Card claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("CardFixture"))).toStrictEqual({});
});

it("hydrating Card runs its action's handler and updates the content", async () => {
  const hydrated = await hydrate("CardFixture");
  const server = required(hydrated.container.querySelector("[data-slot=card]"), "the server's card");
  await userEvent.click(page.getByRole("button", { name: "Add" }));
  await expect.element(page.getByText("Seats 1")).toBeInTheDocument();
  expect(hydrated.container.querySelector("[data-slot=card]")).toBe(server);
});
