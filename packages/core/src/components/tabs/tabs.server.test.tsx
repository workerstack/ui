import { renderServer, tag, tags, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { ProjectTabs } from "./__fixtures__/project-tabs.fixture.tsx";

// First in the file: Solid warns once per kind of write per process.
it("Tabs on the server renders without warnings", () => {
  const { warnings } = renderServer(() => <ProjectTabs />);

  expect(warnings).toStrictEqual([]);
});

it("Tabs on the server renders a tablist of tabs with the first enabled one selected", () => {
  const { html } = renderServer(() => <ProjectTabs />);

  expect(tag(html, { "data-slot": "tabs-list" }).attrs.role).toBe("tablist");
  const tabs = tags(html, { "data-slot": "tabs-tab" });
  expect(tabs.map((found) => found.attrs["aria-selected"])).toStrictEqual(["true", "false", "false", "false"]);
  expect(tabs.map((found) => found.attrs.tabindex)).toStrictEqual(["0", "-1", "-1", "-1"]);
  expect(tabs.at(2)?.attrs["aria-disabled"]).toBe("true");
});

it("Tabs on the server renders the selected panel and leaves the others out", () => {
  const { html } = renderServer(() => <ProjectTabs defaultValue="billing" />);

  const panels = tags(html, { "data-slot": "tabs-panel" });
  expect(panels).toHaveLength(1);
  expect(panels.at(0)?.attrs.role).toBe("tabpanel");
  expect(text(html)).toContain("Billing content");
  expect(text(html)).not.toContain("Overview content");
  const selected = tags(html, { "data-slot": "tabs-tab" }).find((found) => found.attrs["aria-selected"] === "true");
  expect(panels.at(0)?.attrs["aria-labelledby"]).toBe(selected?.attrs.id);
});

it("Tabs on the server marks a vertical list", () => {
  const { html } = renderServer(() => <ProjectTabs orientation="vertical" />);

  expect(tag(html, { "data-slot": "tabs-list" }).attrs["aria-orientation"]).toBe("vertical");
  expect(tag(html, { "data-slot": "tabs" }).attrs["data-orientation"]).toBe("vertical");
});
