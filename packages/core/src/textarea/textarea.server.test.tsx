import { expect, it } from "vitest";

import { required } from "../test/required.ts";
import { renderServer, slot } from "../test/server.ts";
import { NotesTextarea } from "./__fixtures__/textarea.fixture.tsx";

it("Textarea on the server renders a labelled textarea with its styles and no warnings", () => {
  const { html, warnings } = renderServer(() => <NotesTextarea defaultValue="Hello" placeholder="Write" />);

  const textarea = slot(html, "textarea");
  expect(textarea.name).toBe("textarea");
  expect(textarea.attrs.name).toBe("notes");
  expect(textarea.attrs.placeholder).toBe("Write");
  expect(textarea.attrs.class).toContain("min-h-16");
  expect(textarea.attrs.class).toContain("field-sizing-content");
  expect(html).toContain("Hello</textarea>");
  expect(warnings).toStrictEqual([]);
});

it("Textarea on the server links the field's label to the textarea", () => {
  const { html } = renderServer(() => <NotesTextarea />);
  const id = required(slot(html, "textarea").attrs.id, "an id");
  expect(required(slot(html, "field-label").attrs.for, "a for")).toBe(id);
});
