import { renderServer, tag, tags } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { DimensionsPopover } from "./__fixtures__/dimensions-popover.fixture.tsx";

it("Popover on the server renders only the trigger while closed", () => {
  const { html, warnings } = renderServer(() => <DimensionsPopover />);
  const trigger = tag(html, { "data-slot": "popover-trigger" });
  expect(trigger.attrs["aria-haspopup"]).toBe("dialog");
  expect(trigger.attrs["aria-expanded"]).toBe("false");
  expect(tags(html, { "data-slot": "popover-content" })).toStrictEqual([]);
  expect(warnings).toStrictEqual([]);
});

it("Popover on the server renders an open popover with its content, linked to its trigger", () => {
  const { html, warnings } = renderServer(() => <DimensionsPopover defaultOpen />);
  const content = tag(html, { "data-slot": "popover-content" });
  expect(content.attrs.role).toBe("dialog");
  expect(content.attrs.class).toContain("w-72");
  expect(tag(html, { "data-slot": "popover-trigger" }).attrs["aria-controls"]).toBe(content.attrs.id);
  expect(tag(html, { "data-slot": "popover-trigger" }).attrs["aria-expanded"]).toBe("true");
  expect(warnings).toStrictEqual([]);
});

// UI SDK 0.1.0-beta.2 points an open popover's aria-labelledby at its trigger in the server HTML, and
// at the title only after mount. Drop `.fails` when the server HTML names it by its title.
it.fails("Popover on the server names an open popover by its title in the HTML", () => {
  const { html } = renderServer(() => <DimensionsPopover defaultOpen />);
  expect(tag(html, { "data-slot": "popover-content" }).attrs["aria-labelledby"]).toBe(
    tag(html, { "data-slot": "popover-title" }).attrs.id,
  );
});
