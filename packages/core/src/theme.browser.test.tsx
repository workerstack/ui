import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { MarkFixture, ReadOnlyFixture } from "./__fixtures__/theme.fixture.tsx";
import { settled, style, token } from "./test/browser.ts";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset["focusSource"];
});

/** What a pseudo-element's `content` computes to. */
function afterContent(element: Element): string {
  return getComputedStyle(element, "::after").content;
}

it("theme draws a data-mark element's mark text after it, in the muted or the danger color", () => {
  render(() => <MarkFixture />);
  const required = page.getByTestId("required-label").element();
  const optional = page.getByTestId("optional-label").element();
  expect(afterContent(required)).toContain("*");
  expect(afterContent(optional)).toContain("(optional)");
  expect(getComputedStyle(required, "::after").color).toBe(token("--ui-destructive"));
  expect(getComputedStyle(optional, "::after").color).toBe(token("--ui-muted-foreground"));
  expect(required.textContent).toBe("Name");
});

it("theme rings a read-only input after keyboard focus and drops the ring after a pointer press", async () => {
  render(() => <ReadOnlyFixture />);
  const input = page.getByRole("textbox", { name: "Code" }).element();
  document.documentElement.dataset["focusSource"] = "keyboard";
  await userEvent.tab();
  expect(document.activeElement).toBe(input);
  expect(style(input).boxShadow).not.toBe("none");
  document.documentElement.dataset["focusSource"] = "pointer";
  await settled(input);
  expect(style(input).boxShadow).toBe("none");
  expect(style(input).outlineStyle).toBe("none");
});
