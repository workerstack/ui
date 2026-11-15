import { renderServer, tag, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { LimitedNotes } from "./__fixtures__/textarea.fixture.tsx";

it("Textarea on the server renders the counter after the box, with no warnings", () => {
  const { html, warnings } = renderServer(() => <LimitedNotes defaultValue="Hello" />);
  expect(tag(html, { "data-slot": "textarea-counter" }).name).toBe("span");
  expect(text(html)).toContain("5/10");
  expect(warnings).toStrictEqual([]);
});
