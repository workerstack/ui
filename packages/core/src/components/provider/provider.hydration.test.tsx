import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page } from "vitest/browser";

import { ProviderFixture } from "./__fixtures__/provider.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/provider.hydration.fixture.tsx", import.meta.url), {
  ProviderFixture,
});

it("UiProvider hydration claims the server's nodes without warnings", async () => {
  const { mismatches } = await hydrate("ProviderFixture");
  expect(mismatches).toStrictEqual({});
});

it("UiProvider hydration keeps the translated message and the locale", async () => {
  await hydrate("ProviderFixture");
  await expect.element(page.getByTestId("close")).toHaveTextContent("Zatvori");
  await expect.element(page.getByTestId("clear")).toHaveTextContent("Clear");
  await expect.element(page.getByTestId("locale")).toHaveTextContent("hr-HR");
});
