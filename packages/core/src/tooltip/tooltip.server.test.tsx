import { expect, it } from "vitest";

import { renderServer, slot, slots, text } from "../test/server.ts";
import { SaveTooltip } from "./__fixtures__/save-tooltip.fixture.tsx";

// First in the file: Solid warns once per kind of write per process.
it("Tooltip on the server renders without warnings", () => {
  expect(renderServer(() => <SaveTooltip />).warnings).toStrictEqual([]);
});

it("Tooltip on the server renders the trigger and a hidden tooltip", () => {
  const { html } = renderServer(() => <SaveTooltip />);
  expect(slot(html, "tooltip-trigger").name).toBe("button");
  expect(text(html)).toContain("Save");
  expect(slot(html, "tooltip-content").attrs).toHaveProperty("hidden");
  expect(slots(html, "tooltip-arrow")).toHaveLength(1);
});
