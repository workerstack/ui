import { expect, it } from "vitest";

import { renderServer, slot, slots } from "../test/server.ts";
import { DeleteDialog } from "./__fixtures__/delete-dialog.fixture.tsx";

it("AlertDialog on the server renders only the trigger while closed", () => {
  const { html, warnings } = renderServer(() => <DeleteDialog />);
  const trigger = slot(html, "alert-dialog-trigger");
  expect(trigger.attrs["aria-haspopup"]).toBe("dialog");
  expect(trigger.attrs).toHaveProperty("data-closed");
  expect(slots(html, "alert-dialog-content")).toStrictEqual([]);
  expect(slots(html, "alert-dialog-backdrop")).toStrictEqual([]);
  expect(warnings).toStrictEqual([]);
});

it("AlertDialog on the server renders an open alertdialog: modal, named, over its backdrop", () => {
  const { html, warnings } = renderServer(() => <DeleteDialog defaultOpen />);
  const content = slot(html, "alert-dialog-content");
  expect(content.attrs.role).toBe("alertdialog");
  expect(content.attrs["aria-modal"]).toBe("true");
  expect(content.attrs["aria-labelledby"]).toBe(slot(html, "alert-dialog-title").attrs.id);
  expect(content.attrs.class).toContain("rounded-lg");
  expect(slot(html, "alert-dialog-backdrop").attrs.class).toContain("bg-overlay");
  expect(slot(html, "alert-dialog-trigger").attrs["aria-controls"]).toBe(content.attrs.id);
  expect(slots(html, "alert-dialog-close")).toHaveLength(2);
  expect(warnings).toStrictEqual([]);
});

// UI SDK 0.1.0-beta.2 adds aria-describedby after mount, so the server HTML names the alert dialog by
// its title but leaves the description unconnected until hydration. Drop `.fails` when fixed.
it.fails("AlertDialog on the server describes an open alert dialog by its description in the HTML", () => {
  const { html } = renderServer(() => <DeleteDialog defaultOpen />);
  expect(slot(html, "alert-dialog-content").attrs["aria-describedby"]).toBe(
    slot(html, "alert-dialog-description").attrs.id,
  );
});
