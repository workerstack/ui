import { expect, it } from "vitest";

import { renderServer, slot, slots, text } from "../test/server.ts";
import { ProjectTabs } from "./__fixtures__/project-tabs.fixture.tsx";

// First in the file: Solid warns once per kind of write per process.
it("Tabs on the server renders without warnings", () => {
  const { warnings } = renderServer(() => <ProjectTabs />);

  expect(warnings).toStrictEqual([]);
});

it("Tabs on the server renders a tablist of tabs with the first enabled one selected", () => {
  const { html } = renderServer(() => <ProjectTabs />);

  expect(slot(html, "tabs-list").attrs.role).toBe("tablist");
  const tabs = slots(html, "tabs-tab");
  expect(tabs.map((tag) => tag.attrs["aria-selected"])).toStrictEqual(["true", "false", "false", "false"]);
  expect(tabs.map((tag) => tag.attrs.tabindex)).toStrictEqual(["0", "-1", "-1", "-1"]);
  expect(tabs.at(2)?.attrs["aria-disabled"]).toBe("true");
});

it("Tabs on the server renders the selected panel and leaves the others out", () => {
  const { html } = renderServer(() => <ProjectTabs defaultValue="billing" />);

  const panels = slots(html, "tabs-panel");
  expect(panels).toHaveLength(1);
  expect(panels.at(0)?.attrs.role).toBe("tabpanel");
  expect(text(html)).toContain("Billing content");
  expect(text(html)).not.toContain("Overview content");
  const selected = slots(html, "tabs-tab").find((tag) => tag.attrs["aria-selected"] === "true");
  expect(panels.at(0)?.attrs["aria-labelledby"]).toBe(selected?.attrs.id);
});

it("Tabs on the server marks a vertical list", () => {
  const { html } = renderServer(() => <ProjectTabs orientation="vertical" />);

  expect(slot(html, "tabs-list").attrs["aria-orientation"]).toBe("vertical");
  expect(slot(html, "tabs").attrs["data-orientation"]).toBe("vertical");
});
