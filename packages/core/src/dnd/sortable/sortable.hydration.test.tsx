import { expect, it } from "vitest";

import { mounted } from "../../test/dom.ts";
import { hydrator, mismatch } from "../../test/hydration.ts";
import { SortableFixture } from "../__fixtures__/sortable.hydration.fixture.tsx";

const hydrate = hydrator(new URL("../__fixtures__/sortable.hydration.fixture.tsx", import.meta.url), {
  SortableFixture,
});

// Bindings create no computeds, so they shift no hydration ids: the server's nodes are claimed and the handles come
// out wired.
it("hydrating a sortable list claims every node", async () => {
  expect(mismatch(await hydrate("SortableFixture"))).toStrictEqual({});
});

it("hydrating a sortable list wires the handles", async () => {
  const hydrated = await hydrate("SortableFixture");
  // Handles are wired once their row sits in the list (a microtask after the ref).
  await mounted();
  const buttons = [...hydrated.container.querySelectorAll("button")];

  expect(buttons.map((button) => button.getAttribute("aria-describedby"))).toStrictEqual([
    "dnd-instructions",
    "dnd-instructions",
    "dnd-instructions",
  ]);
  expect(hydrated.container.querySelector("li")?.textContent).toBe("Move aresting");
});
