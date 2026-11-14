import { expect, it } from "vitest";

import { renderServer, slot, text } from "../test/server.ts";
import { ROLE_ITEMS, SelectViewFixture } from "./__fixtures__/select-view.fixture.tsx";
import { SelectView } from "./index.ts";

it("SelectView on the server renders the label the field's label names, with no warnings", () => {
  const { html, warnings } = renderServer(() => <SelectViewFixture />);

  expect(slot(html, "view").attrs["aria-labelledby"]).toBe(slot(html, "field-label").attrs.id);
  expect(text(html)).toContain("Member");
  expect(warnings).toStrictEqual([]);
});

it("SelectView on the server joins several values and marks none empty", () => {
  const many = renderServer(() => <SelectView items={ROLE_ITEMS} value={["admin", "member"]} />);
  const none = renderServer(() => <SelectView items={ROLE_ITEMS} value={null} />);

  expect(text(many.html)).toBe("Admin, Member");
  expect(slot(none.html, "view").attrs).toHaveProperty("data-empty");
});
