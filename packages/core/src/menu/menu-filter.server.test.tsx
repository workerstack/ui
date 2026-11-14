import { expect, it } from "vitest";

import { renderServer, slot, slots, text } from "../test/server.ts";
import { ProjectMenu } from "./__fixtures__/project-menu.fixture.tsx";

// UI SDK 0.1.0-beta.2: MenuContent registers itself with the Menu while rendering, a signal write
// Solid warns about on the server (SERVER_WRITE); menu.server.test.tsx pins it. A menu with a
// filter writes nothing of its own, so the warnings are that one and no other.
const SERVER_WRITE = /SERVER_WRITE/;

// First in the file: Solid warns once per kind of write per process.
it("MenuFilter on the server renders without warnings of its own", () => {
  const { warnings } = renderServer(() => <ProjectMenu defaultOpen />);

  expect(warnings.filter((warning) => !SERVER_WRITE.test(warning))).toStrictEqual([]);
});

it("MenuFilter on the server renders the input, every item and no empty state", () => {
  const { html } = renderServer(() => <ProjectMenu defaultOpen />);

  const filter = slot(html, "menu-filter");
  expect(filter.name).toBe("input");
  expect(filter.attrs.role).toBe("searchbox");
  expect(filter.attrs["aria-label"]).toBe("Filter");
  expect(filter.attrs.placeholder).toBe("Filter");
  expect(slots(html, "menu-item").map((item) => item.attrs.role)).toStrictEqual(["menuitem", "menuitem", "menuitem"]);
  expect(slots(html, "menu-list")).toHaveLength(1);
  expect(slots(html, "menu-empty")).toStrictEqual([]);
  const groups = slots(html, "menu-group");
  expect(groups).toHaveLength(2);
  expect(groups.some((group) => "hidden" in group.attrs)).toBe(false);
  expect(text(html)).toContain("Café redesign");
});
