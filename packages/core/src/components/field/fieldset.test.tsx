import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { inputElement, mounted } from "../../test/dom.ts";
import { AddressFieldset, ChoiceFieldset } from "./__fixtures__/fieldset.fixture.tsx";

afterEach(cleanup);

it("Fieldset names its group by the legend and describes it by the description", async () => {
  render(() => <AddressFieldset />);
  await mounted();
  const group = screen.getByRole("group", { name: "Shipping address" });
  expect(group.tagName).toBe("FIELDSET");
  const description = screen.getByText("Where we send the order.");
  expect(group.getAttribute("aria-describedby")?.split(" ")).toContain(description.id);
  expect(group.getAttribute("data-slot")).toBe("fieldset");
});

it("Fieldset disables every control inside when disabled", () => {
  render(() => <AddressFieldset disabled />);
  expect(inputElement(screen.getByRole("textbox", { name: "Street" })).matches(":disabled")).toBe(true);
  expect(inputElement(screen.getByRole("textbox", { name: "City" })).matches(":disabled")).toBe(true);
});

it("FieldsetLegend says its variant and styles each", () => {
  render(() => (
    <>
      <AddressFieldset />
      <ChoiceFieldset />
    </>
  ));
  const legend = screen.getByText("Shipping address");
  const label = screen.getByText("Contact by");
  expect(legend.getAttribute("data-slot")).toBe("fieldset-legend");
  expect(legend.getAttribute("data-variant")).toBe("legend");
  expect(label.getAttribute("data-variant")).toBe("label");
});

it("FieldGroup lays its fields out without naming a group", () => {
  const view = render(() => <AddressFieldset />);
  const group = view.container.querySelector("[data-slot=field-group]");
  expect(group?.querySelectorAll("[data-slot=field]")).toHaveLength(2);
  expect(group?.hasAttribute("role")).toBe(false);
});
