import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { inputElement, mounted, type } from "../test/dom.ts";
import { NameField } from "./__fixtures__/text-input.fixture.tsx";

afterEach(cleanup);

it("TextInput in a Field is labelled by the field's label and is a text box", () => {
  render(() => <NameField />);
  const input = screen.getByRole("textbox", { name: "Name" });
  expect(input.getAttribute("type")).toBe("text");
  expect(input.getAttribute("name")).toBe("name");
});

it("TextInput trims the ends and strips invisible characters on blur", async () => {
  render(() => <NameField />);
  await mounted();
  const input = inputElement(screen.getByRole("textbox", { name: "Name" }));
  type(input, "  Ada​ Lovelace ⁠");
  expect(input.value).toBe("  Ada​ Lovelace ⁠");
  fireEvent.blur(input);
  expect(input.value).toBe("Ada Lovelace");
  expect(await screen.findByText("[Ada Lovelace]")).toBeTruthy();
});
