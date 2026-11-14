import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { required } from "../test/required.ts";
import { NameViews } from "./__fixtures__/text-input-view.fixture.tsx";

afterEach(cleanup);

it("TextInputView shows the text, or the empty marker", () => {
  render(() => <NameViews />);
  expect(screen.getByRole("status", { name: "Name" }).textContent).toBe("Ada Lovelace");
  expect(required(screen.getByTestId("empty").querySelector("output"), "an output").textContent).toBe("—");
  expect(required(screen.getByTestId("null").querySelector("output"), "an output").textContent).toBe("—");
});
