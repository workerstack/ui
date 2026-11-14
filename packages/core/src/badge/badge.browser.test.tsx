import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page } from "vitest/browser";

import { style, token } from "../test/browser.ts";
import { Badge, badgeClass } from "./index.ts";

afterEach(cleanup);

/** The computed style of the element with the text `name`. */
function badge(name: string): CSSStyleDeclaration {
  return style(page.getByText(name).element());
}

it("Badge paints each variant from the theme tokens", () => {
  render(() => (
    <>
      <Badge>Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="outline">Outline</Badge>
    </>
  ));
  expect(badge("Primary").backgroundColor).toBe(token("--ui-primary"));
  expect(badge("Primary").color).toBe(token("--ui-primary-foreground"));
  expect(badge("Secondary").backgroundColor).toBe(token("--ui-muted"));
  expect(badge("Secondary").color).toBe(token("--ui-foreground"));
  expect(badge("Failed").backgroundColor).toBe(token("--ui-destructive"));
  expect(badge("Failed").color).toBe(token("--ui-background"));
  expect(badge("Outline").borderTopColor).toBe(token("--ui-border"));
  expect(badge("Outline").color).toBe(token("--ui-foreground"));
});

it("Badge is a small rounded label", () => {
  render(() => <Badge>Small</Badge>);
  expect(badge("Small").fontSize).toBe("12px");
  expect(badge("Small").fontWeight).toBe("500");
  expect(badge("Small").paddingLeft).toBe("8px");
  expect(badge("Small").paddingTop).toBe("2px");
  expect(badge("Small").borderTopLeftRadius).toBe("6px");
});

it("Badge on a link looks like a badge", () => {
  render(() => (
    <a href="/docs" class={badgeClass({ variant: "destructive" })}>
      Docs
    </a>
  ));
  expect(badge("Docs").backgroundColor).toBe(token("--ui-destructive"));
  expect(badge("Docs").display).toBe("inline-flex");
});
