import { expect, it } from "vitest";

import { renderServer, slot, slots } from "../../test/server.ts";
import { DimensionsPopover } from "./__fixtures__/dimensions-popover.fixture.tsx";

it("Popover on the server renders only the trigger while closed", () => {
  const { html, warnings } = renderServer(() => <DimensionsPopover />);
  const trigger = slot(html, "popover-trigger");
  expect(trigger.attrs["aria-haspopup"]).toBe("dialog");
  expect(trigger.attrs["aria-expanded"]).toBe("false");
  expect(slots(html, "popover-content")).toStrictEqual([]);
  expect(warnings).toStrictEqual([]);
});

it("Popover on the server renders an open popover with its content, linked to its trigger", () => {
  const { html, warnings } = renderServer(() => <DimensionsPopover defaultOpen />);
  const content = slot(html, "popover-content");
  expect(content.attrs.role).toBe("dialog");
  expect(content.attrs.class).toContain("w-72");
  expect(slot(html, "popover-trigger").attrs["aria-controls"]).toBe(content.attrs.id);
  expect(slot(html, "popover-trigger").attrs["aria-expanded"]).toBe("true");
  expect(warnings).toStrictEqual([]);
});

// UI SDK 0.1.0-beta.2 points an open popover's aria-labelledby at its trigger in the server HTML, and
// at the title only after mount. Drop `.fails` when the server HTML names it by its title.
it.fails("Popover on the server names an open popover by its title in the HTML", () => {
  const { html } = renderServer(() => <DimensionsPopover defaultOpen />);
  expect(slot(html, "popover-content").attrs["aria-labelledby"]).toBe(slot(html, "popover-title").attrs.id);
});
