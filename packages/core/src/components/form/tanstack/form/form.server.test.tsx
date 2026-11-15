import { expect, it } from "vitest";

import { renderServer, slot, slots, text } from "../../../../test/server.ts";
import { AccountForm } from "./__fixtures__/form.fixture.tsx";

it("Form on the server renders its fields with no Solid warnings", () => {
  const { html, warnings } = renderServer(() => <AccountForm defaults={{ name: "Ada" }} />);
  expect(warnings).toStrictEqual([]);
  expect(slot(html, "form").attrs.novalidate).toBe("");
  expect(slots(html, "input").map((input) => input.attrs.name)).toStrictEqual(["name", "email", "phone"]);
  expect(slots(html, "input")[0]?.attrs.value).toBe("Ada");
  expect(slots(html, "field-error")).toStrictEqual([]);
});

it("Form on the server renders a read-only form as Views", () => {
  const { html } = renderServer(() => <AccountForm readOnly defaults={{ name: "Ada" }} />);
  expect(slots(html, "input")).toStrictEqual([]);
  expect(slots(html, "view")).toHaveLength(3);
  expect(text(html)).toContain("Ada");
});
