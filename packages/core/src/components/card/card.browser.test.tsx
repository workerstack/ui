import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page } from "vitest/browser";

import { part, rect, style, token } from "../../test/browser.ts";
import { FullCard } from "./__fixtures__/card.fixture.tsx";

afterEach(cleanup);

it("Card paints a bordered, rounded surface from the theme tokens", () => {
  render(FullCard);
  const card = style(page.getByTestId("card").element());
  expect(card.backgroundColor).toBe(token("--ui-background"));
  expect(card.color).toBe(token("--ui-foreground"));
  expect(card.borderTopColor).toBe(token("--ui-border"));
  expect(card.borderTopWidth).toBe("1px");
  expect(card.borderTopLeftRadius).toBe("12px");
  expect(card.paddingTop).toBe("24px");
  expect(card.boxShadow).not.toBe("none");
});

it("Card pads its header, content and footer sideways", () => {
  render(FullCard);
  const card = page.getByTestId("card").element();
  expect(style(part(card, "card-header")).paddingLeft).toBe("24px");
  expect(style(part(card, "card-content")).paddingLeft).toBe("24px");
  expect(style(part(card, "card-footer")).paddingLeft).toBe("24px");
});

it("Card puts the action at the header's end", () => {
  render(FullCard);
  const card = page.getByTestId("card").element();
  const header = rect(part(card, "card-header"));
  const action = rect(part(card, "card-action"));
  const title = rect(part(card, "card-title"));
  expect(action.right).toBeCloseTo(header.right - 24, 0);
  expect(action.top).toBeCloseTo(header.top, 0);
  expect(action.left).toBeGreaterThan(title.right);
});

it("Card mutes its description", () => {
  render(FullCard);
  const card = page.getByTestId("card").element();
  expect(style(part(card, "card-description")).color).toBe(token("--ui-muted-foreground"));
});
