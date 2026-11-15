import { renderServer, tag, tags, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { AccountForm } from "./__fixtures__/form.fixture.tsx";

it("Form on the server renders its fields with no Solid warnings", () => {
  const { html, warnings } = renderServer(() => <AccountForm defaults={{ name: "Ada" }} />);
  expect(warnings).toStrictEqual([]);
  expect(tag(html, { "data-slot": "form" }).attrs.novalidate).toBe("");
  expect(tags(html, { "data-slot": "input" }).map((input) => input.attrs.name)).toStrictEqual([
    "name",
    "email",
    "phone",
  ]);
  expect(tags(html, { "data-slot": "input" })[0]?.attrs.value).toBe("Ada");
  expect(tags(html, { "data-slot": "field-error" })).toStrictEqual([]);
});

it("Form on the server renders a read-only form as Views", () => {
  const { html } = renderServer(() => <AccountForm readOnly defaults={{ name: "Ada" }} />);
  expect(tags(html, { "data-slot": "input" })).toStrictEqual([]);
  expect(tags(html, { "data-slot": "view" })).toHaveLength(3);
  expect(text(html)).toContain("Ada");
});
