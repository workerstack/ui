import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { focusPage } from "../../test/browser.ts";
import { TooltipFixture } from "./__fixtures__/tooltip.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/tooltip.hydration.fixture.tsx", import.meta.url), { TooltipFixture });

it("hydrating Tooltip claims the server's nodes without warnings", async () => {
  const { mismatches } = await hydrate("TooltipFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Tooltip shows on focus after hydration", async () => {
  await hydrate("TooltipFixture");
  await focusPage();
  await userEvent.tab();
  await expect.element(page.getByRole("tooltip")).toHaveTextContent("Save your changes");
});
