import { expect, it } from "vitest";

import { renderServer, slot } from "../../test/server.ts";
import { NameField } from "./__fixtures__/text-input.fixture.tsx";

it("TextInput on the server renders type text and the field's label link, with no warnings", () => {
  const { html, warnings } = renderServer(() => <NameField />);

  const label = slot(html, "field-label");
  const input = slot(html, "input");
  expect(input.attrs.type).toBe("text");
  expect(label.attrs.for).toBe(input.attrs.id);
  expect(input.attrs["aria-labelledby"]).toBe(label.attrs.id);
  expect(input.attrs.name).toBe("name");
  expect(warnings).toStrictEqual([]);
});
