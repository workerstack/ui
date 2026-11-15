import { expect, it } from "vitest";

import { renderServer, slot, slots } from "../../test/server.ts";
import { ProfileDialog } from "./__fixtures__/form-dialog.fixture.tsx";

it("FormDialog on the server renders only its trigger while closed", () => {
  const { html, warnings } = renderServer(() => <ProfileDialog />);
  expect(slots(html, "dialog-content")).toStrictEqual([]);
  expect(slots(html, "form")).toStrictEqual([]);
  expect(html).toContain("Edit");
  expect(warnings).toStrictEqual([]);
});

it("FormDialog on the server renders an open dialog with its form, title, field and buttons", () => {
  const { html, warnings } = renderServer(() => <ProfileDialog defaultOpen />);
  expect(slot(html, "dialog-content").attrs.role).toBe("dialog");
  expect(slot(html, "form").attrs["aria-labelledby"]).toBe(slot(html, "dialog-title").attrs.id);
  expect(slots(html, "input").map((input) => input.attrs.value)).toStrictEqual(["Ada"]);
  expect(html).toContain("Cancel");
  expect(html).toContain("Save");
  expect(warnings).toStrictEqual([]);
});
