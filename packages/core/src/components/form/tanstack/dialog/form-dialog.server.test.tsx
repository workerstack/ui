import { renderServer, tag, tags } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { ProfileDialog } from "./__fixtures__/form-dialog.fixture.tsx";

it("FormDialog on the server renders only its trigger while closed", () => {
  const { html, warnings } = renderServer(() => <ProfileDialog />);
  expect(tags(html, { "data-slot": "dialog-content" })).toStrictEqual([]);
  expect(tags(html, { "data-slot": "form" })).toStrictEqual([]);
  expect(html).toContain("Edit");
  expect(warnings).toStrictEqual([]);
});

it("FormDialog on the server renders an open dialog with its form, title, field and buttons", () => {
  const { html, warnings } = renderServer(() => <ProfileDialog defaultOpen />);
  expect(tag(html, { "data-slot": "dialog-content" }).attrs.role).toBe("dialog");
  expect(tag(html, { "data-slot": "form" }).attrs["aria-labelledby"]).toBe(
    tag(html, { "data-slot": "dialog-title" }).attrs.id,
  );
  expect(tags(html, { "data-slot": "input" }).map((input) => input.attrs.value)).toStrictEqual(["Ada"]);
  expect(html).toContain("Cancel");
  expect(html).toContain("Save");
  expect(warnings).toStrictEqual([]);
});
