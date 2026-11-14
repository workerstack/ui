import { expect, it } from "vitest";

import { renderServer, slots, text } from "../test/server.ts";
import { NotesViews } from "./__fixtures__/textarea-view.fixture.tsx";

it("TextareaView on the server renders the lines with their breaks kept and the empty marker, with no warnings", () => {
  const { html, warnings } = renderServer(() => <NotesViews />);
  expect(slots(html, "view").map((tag) => tag.attrs.class)).toStrictEqual([
    expect.stringContaining("whitespace-pre-line"),
    expect.stringContaining("whitespace-pre-line"),
  ]);
  expect(text(html)).toContain("Line one\nLine two");
  expect(text(html)).toContain("—");
  expect(warnings).toStrictEqual([]);
});
