import { renderServer, tag } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { NameField } from "./__fixtures__/text-input.fixture.tsx";

it("TextInput on the server renders type text and the field's label link, with no warnings", () => {
  const { html, warnings } = renderServer(() => <NameField />);

  const label = tag(html, { "data-slot": "field-label" });
  const input = tag(html, { "data-slot": "input" });
  expect(input.attrs.type).toBe("text");
  expect(label.attrs.for).toBe(input.attrs.id);
  expect(input.attrs["aria-labelledby"]).toBe(label.attrs.id);
  expect(input.attrs.name).toBe("name");
  expect(warnings).toStrictEqual([]);
});
