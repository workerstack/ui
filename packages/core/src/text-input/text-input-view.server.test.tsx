import { expect, it } from "vitest";

import { renderServer, slots, text } from "../test/server.ts";
import { NameViews } from "./__fixtures__/text-input-view.fixture.tsx";

it("TextInputView on the server renders its text and the empty marker, with no warnings", () => {
  const { html, warnings } = renderServer(() => <NameViews />);
  expect(slots(html, "view").map((tag) => tag.name)).toStrictEqual(["output", "output", "output"]);
  expect(text(html)).toContain("Ada Lovelace");
  expect(text(html)).toContain("—");
  expect(warnings).toStrictEqual([]);
});
