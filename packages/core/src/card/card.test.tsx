import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { FullCard } from "./__fixtures__/card.fixture.tsx";
import { Card, CardTitle } from "./index.ts";

afterEach(cleanup);

it("Card renders each part with its slot", () => {
  render(FullCard);
  expect(screen.getByText("Plan").getAttribute("data-slot")).toBe("card-title");
  expect(screen.getByText("Billed monthly").getAttribute("data-slot")).toBe("card-description");
  expect(screen.getByText("Edit").getAttribute("data-slot")).toBe("card-action");
  expect(screen.getByText("Body").getAttribute("data-slot")).toBe("card-content");
  expect(screen.getByText("Foot").getAttribute("data-slot")).toBe("card-footer");
  expect(screen.getByText("Body").parentElement?.getAttribute("data-slot")).toBe("card");
});

it("Card has the surface classes", () => {
  render(() => <Card data-testid="card" />);
  const card = screen.getByTestId("card");
  expect(card.className).toContain("rounded-xl");
  expect(card.className).toContain("bg-background");
  expect(card.className).toContain("shadow-sm");
});

it("Card lets the consumer's class win over its own", () => {
  render(() => <Card data-testid="card" class="py-2" />);
  const card = screen.getByTestId("card");
  expect(card.className).toContain("py-2");
  expect(card.className).not.toContain("py-6");
});

it("CardTitle lets the consumer's class win over its own", () => {
  render(() => <CardTitle class="font-normal">Plan</CardTitle>);
  const title = screen.getByText("Plan");
  expect(title.className).toContain("font-normal");
  expect(title.className).not.toContain("font-semibold");
});
