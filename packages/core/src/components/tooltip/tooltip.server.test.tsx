import { renderServer, tag, tags, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { SaveTooltip } from "./__fixtures__/save-tooltip.fixture.tsx";

// First in the file: Solid warns once per kind of write per process.
it("Tooltip on the server renders without warnings", () => {
  expect(renderServer(() => <SaveTooltip />).warnings).toStrictEqual([]);
});

it("Tooltip on the server renders the trigger and a hidden tooltip", () => {
  const { html } = renderServer(() => <SaveTooltip />);
  expect(tag(html, { "data-slot": "tooltip-trigger" }).name).toBe("button");
  expect(text(html)).toContain("Save");
  expect(tag(html, { "data-slot": "tooltip-content" }).attrs).toHaveProperty("hidden");
  expect(tags(html, { "data-slot": "tooltip-arrow" })).toHaveLength(1);
});
