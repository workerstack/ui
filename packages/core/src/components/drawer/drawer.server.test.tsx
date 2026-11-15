import { renderServer, tag, tags } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { ShareDrawer } from "./__fixtures__/share-drawer.fixture.tsx";

it("Drawer on the server renders only the trigger while closed", () => {
  const { html, warnings } = renderServer(() => <ShareDrawer />);
  const trigger = tag(html, { "data-slot": "drawer-trigger" });
  expect(trigger.attrs["aria-haspopup"]).toBe("dialog");
  expect(trigger.attrs).toHaveProperty("data-closed");
  expect(tags(html, { "data-slot": "drawer-content" })).toStrictEqual([]);
  expect(tags(html, { "data-slot": "drawer-backdrop" })).toStrictEqual([]);
  expect(warnings).toStrictEqual([]);
});

it("Drawer on the server renders an open drawer: named, over its backdrop", () => {
  const { html, warnings } = renderServer(() => <ShareDrawer defaultOpen />);
  const content = tag(html, { "data-slot": "drawer-content" });
  expect(content.attrs.role).toBe("dialog");
  expect(content.attrs["aria-labelledby"]).toBe(tag(html, { "data-slot": "drawer-title" }).attrs.id);
  expect(content.attrs.class).toContain("bg-background");
  expect(tag(html, { "data-slot": "drawer-backdrop" }).attrs.class).toContain("bg-overlay");
  expect(tag(html, { "data-slot": "drawer-trigger" }).attrs["aria-controls"]).toBe(content.attrs.id);
  expect(warnings).toStrictEqual([]);
});
