import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { required } from "../../test/required.ts";
import { NotesViews } from "./__fixtures__/textarea-view.fixture.tsx";

afterEach(cleanup);

it("TextareaView keeps the line breaks and shows the empty marker", () => {
  render(() => <NotesViews />);
  const output = screen.getByRole("status", { name: "Notes" });
  expect(output.textContent).toBe("Line one\nLine two");
  expect(output.className).toContain("whitespace-pre-line");
  expect(required(screen.getByTestId("empty").querySelector("output"), "an output").textContent).toBe("—");
});
