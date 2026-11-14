import { expect, it } from "vitest";

import { hydrator, mismatch } from "../test/hydration.ts";
import { required } from "../test/required.ts";
import { MarkedFieldsetFixture } from "./__fixtures__/fieldset.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/fieldset.hydration.fixture.tsx", import.meta.url), {
  MarkedFieldsetFixture,
});

function marks(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll("[data-slot=field-label]")].map((label) => label.getAttribute("data-mark"));
}

it("hydrating a Fieldset with marks claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("MarkedFieldsetFixture"))).toStrictEqual({});
});

it("hydrating a Fieldset keeps its legend's mark and the legend's name for the group", async () => {
  const hydrated = await hydrate("MarkedFieldsetFixture");
  const legend = required(hydrated.container.querySelector("[data-slot=fieldset-legend]"), "the legend");
  const group = required(hydrated.container.querySelector("fieldset"), "the fieldset");
  expect(legend.getAttribute("data-mark")).toBe("required");
  expect(legend.textContent).toBe("Contact");
  await expect.poll(() => group.getAttribute("aria-labelledby")).toBe(legend.id);
});

it("hydrating a Fieldset marks each field's label as the form says once the controls are known", async () => {
  const hydrated = await hydrate("MarkedFieldsetFixture");
  await expect.poll(() => marks(hydrated.container)).toStrictEqual(["required", "optional"]);
});
