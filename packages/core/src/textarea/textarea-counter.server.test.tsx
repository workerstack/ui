import { expect, it } from "vitest";

import { renderServer, slot, text } from "../test/server.ts";
import { LimitedNotes } from "./__fixtures__/textarea.fixture.tsx";

it("Textarea on the server renders the counter after the box, with no warnings", () => {
  const { html, warnings } = renderServer(() => <LimitedNotes defaultValue="Hello" />);
  expect(slot(html, "textarea-counter").name).toBe("span");
  expect(text(html)).toContain("5/10");
  expect(warnings).toStrictEqual([]);
});
