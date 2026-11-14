import { expect, it } from "vitest";

import { renderServer, slot, slots, type Tag } from "../test/server.ts";
import { ShareDialog } from "./__fixtures__/share-dialog.fixture.tsx";

/** The corner × in the HTML: the dialog-close labelled Close, not the footer's Done. */
function corners(html: string): Tag[] {
  return slots(html, "dialog-close").filter((tag) => tag.attrs["aria-label"] === "Close");
}

it("Dialog on the server renders only the trigger while closed", () => {
  const { html, warnings } = renderServer(() => <ShareDialog />);
  const trigger = slot(html, "dialog-trigger");
  expect(trigger.attrs["aria-haspopup"]).toBe("dialog");
  expect(trigger.attrs).toHaveProperty("data-closed");
  expect(slots(html, "dialog-content")).toStrictEqual([]);
  expect(slots(html, "dialog-backdrop")).toStrictEqual([]);
  expect(warnings).toStrictEqual([]);
});

it("Dialog on the server renders an open dialog: modal, named, described, over its backdrop", () => {
  const { html, warnings } = renderServer(() => <ShareDialog defaultOpen />);
  const content = slot(html, "dialog-content");
  expect(content.attrs.role).toBe("dialog");
  expect(content.attrs["aria-modal"]).toBe("true");
  expect(content.attrs["aria-labelledby"]).toBe(slot(html, "dialog-title").attrs.id);
  expect(content.attrs.class).toContain("rounded-lg");
  expect(slot(html, "dialog-backdrop").attrs.class).toContain("bg-overlay");
  expect(slot(html, "dialog-trigger").attrs["aria-controls"]).toBe(content.attrs.id);
  expect(warnings).toStrictEqual([]);
});

// UI SDK 0.1.0-beta.2 adds aria-describedby after mount, so the server HTML names the dialog by
// its title but leaves the description unconnected until hydration. Drop `.fails` when fixed.
it.fails("Dialog on the server describes an open dialog by its description in the HTML", () => {
  const { html } = renderServer(() => <ShareDialog defaultOpen />);
  expect(slot(html, "dialog-content").attrs["aria-describedby"]).toBe(slot(html, "dialog-description").attrs.id);
});

it("Dialog on the server renders the corner × unless showClose is false", () => {
  expect(corners(renderServer(() => <ShareDialog defaultOpen />).html)).toHaveLength(1);
  expect(corners(renderServer(() => <ShareDialog defaultOpen showClose={false} />).html)).toStrictEqual([]);
});
