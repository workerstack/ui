import { expect, it } from "vitest";

import { renderServer, slot, slots } from "../test/server.ts";
import { ShareDrawer } from "./__fixtures__/share-drawer.fixture.tsx";

it("Drawer on the server renders only the trigger while closed", () => {
  const { html, warnings } = renderServer(() => <ShareDrawer />);
  const trigger = slot(html, "drawer-trigger");
  expect(trigger.attrs["aria-haspopup"]).toBe("dialog");
  expect(trigger.attrs).toHaveProperty("data-closed");
  expect(slots(html, "drawer-content")).toStrictEqual([]);
  expect(slots(html, "drawer-backdrop")).toStrictEqual([]);
  expect(warnings).toStrictEqual([]);
});

it("Drawer on the server renders an open drawer: named, over its backdrop", () => {
  const { html, warnings } = renderServer(() => <ShareDrawer defaultOpen />);
  const content = slot(html, "drawer-content");
  expect(content.attrs.role).toBe("dialog");
  expect(content.attrs["aria-labelledby"]).toBe(slot(html, "drawer-title").attrs.id);
  expect(content.attrs.class).toContain("bg-background");
  expect(slot(html, "drawer-backdrop").attrs.class).toContain("bg-overlay");
  expect(slot(html, "drawer-trigger").attrs["aria-controls"]).toBe(content.attrs.id);
  expect(warnings).toStrictEqual([]);
});
