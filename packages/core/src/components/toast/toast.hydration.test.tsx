import { hydrator } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { ToastFixture } from "./__fixtures__/toast.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/toast.hydration.fixture.tsx", import.meta.url), { ToastFixture });

it("hydrating Toast claims the server's nodes without warnings", async () => {
  const { mismatches } = await hydrate("ToastFixture");
  expect(mismatches).toStrictEqual({});
});

it("hydrating Toast shows a toast from the server's button, named and closable", async () => {
  await hydrate("ToastFixture");
  await userEvent.click(page.getByRole("button", { name: "Save" }));
  const region = page.getByRole("region", { name: "Notifications" });
  await expect.poll(() => region.element().textContent).toContain("Saved");
  await userEvent.click(page.getByRole("button", { name: "Close" }));
  await expect.poll(() => document.querySelectorAll('[data-slot="toast"]').length).toBe(0);
});
