import { renderServer, tag } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { FullCard } from "./__fixtures__/card.fixture.tsx";
import { Card } from "./index.ts";

it("Card on the server renders every part with its slot", () => {
  const { html, warnings } = renderServer(FullCard);
  expect(tag(html, { "data-slot": "card" }).attrs.class).toContain("rounded-xl");
  expect(tag(html, { "data-slot": "card-header" }).name).toBe("div");
  expect(html).toContain(">Plan</div>");
  expect(html).toContain(">Billed monthly</div>");
  expect(html).toContain(">Edit</div>");
  expect(html).toContain(">Body</div>");
  expect(html).toContain(">Foot</div>");
  expect(warnings).toStrictEqual([]);
});

it("Card on the server merges the consumer's class over its own", () => {
  const { html } = renderServer(() => <Card class="py-2" />);
  const classes = (tag(html, { "data-slot": "card" }).attrs.class ?? "").split(" ");
  expect(classes).toContain("py-2");
  expect(classes).not.toContain("py-6");
});
