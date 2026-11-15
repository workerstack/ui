import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { Badge, badgeClass } from "./index.ts";

afterEach(cleanup);

it("Badge renders a span with its slot and the primary classes", () => {
  render(() => <Badge>New</Badge>);
  const badge = screen.getByText("New");
  expect(badge.tagName).toBe("SPAN");
  expect(badge.getAttribute("data-slot")).toBe("badge");
  expect(badge.className).toContain("bg-primary");
  expect(badge.className).toContain("rounded-md");
});

it("Badge paints each variant with its own classes", () => {
  render(() => (
    <>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="outline">Outline</Badge>
    </>
  ));
  expect(screen.getByText("Secondary").className).toContain("bg-secondary");
  expect(screen.getByText("Failed").className).toContain("bg-destructive");
  expect(screen.getByText("Outline").className).toContain("text-foreground");
});

it("Badge lets the consumer's class win over its own", () => {
  render(() => <Badge class="px-4">Wide</Badge>);
  const badge = screen.getByText("Wide");
  expect(badge.className).toContain("px-4");
  expect(badge.className).not.toContain("px-2");
});

it("Badge passes other attributes to the span", () => {
  render(() => <Badge aria-label="Status">Live</Badge>);
  expect(screen.getByLabelText("Status").textContent).toBe("Live");
});

it("badgeClass gives a link the badge's look", () => {
  render(() => (
    <a href="/docs" class={badgeClass({ variant: "outline" })}>
      Docs
    </a>
  ));
  const link = screen.getByRole("link", { name: "Docs" });
  expect(link.className).toContain("border-border");
  expect(badgeClass()).toContain("bg-primary");
});
