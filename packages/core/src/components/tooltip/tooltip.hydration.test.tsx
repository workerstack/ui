import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { focusPage } from "../../test/browser.ts";
import { hydrator, mismatch } from "../../test/hydration.ts";
import { TooltipFixture } from "./__fixtures__/tooltip.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/tooltip.hydration.fixture.tsx", import.meta.url), { TooltipFixture });

it("hydrating Tooltip claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("TooltipFixture"), ["warnings", "replaced", "added"])).toStrictEqual({});
});

it("hydrating Tooltip shows on focus after hydration", async () => {
  await hydrate("TooltipFixture");
  await focusPage();
  await userEvent.tab();
  await expect.element(page.getByRole("tooltip")).toHaveTextContent("Save your changes");
});
