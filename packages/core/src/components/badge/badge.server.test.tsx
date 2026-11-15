import { renderServer, tag } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { Badge } from "./index.ts";

it("Badge on the server renders a span with its variant classes", () => {
  const { html, warnings } = renderServer(() => <Badge variant="destructive">Failed</Badge>);
  const badge = tag(html, { "data-slot": "badge" });
  expect(badge.name).toBe("span");
  expect(badge.attrs.class).toContain("bg-destructive");
  expect(html).toContain(">Failed</span>");
  expect(warnings).toStrictEqual([]);
});

it("Badge on the server merges the consumer's class over its own", () => {
  const { html } = renderServer(() => <Badge class="px-4">Wide</Badge>);
  const classes = (tag(html, { "data-slot": "badge" }).attrs.class ?? "").split(" ");
  expect(classes).toContain("px-4");
  expect(classes).not.toContain("px-2");
});
