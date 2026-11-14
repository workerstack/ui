import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { FieldsetLegend } from "../field/index.ts";
import { CheckboxGroupView, CheckboxView } from "./index.ts";

afterEach(cleanup);

it("CheckboxView reads a boolean as Yes or No", () => {
  render(() => (
    <>
      <CheckboxView value />
      <CheckboxView value={false} />
    </>
  ));
  expect(screen.getAllByRole("status").map((view) => view.textContent)).toStrictEqual(["Yes", "No"]);
});

it("CheckboxGroupView joins the checked labels under its legend in a named group", () => {
  render(() => (
    <CheckboxGroupView
      items={[
        { label: "Email", value: "email" },
        { label: "Text message", value: "sms" },
      ]}
      value={["sms", "email"]}
      legend={<FieldsetLegend>Notify by</FieldsetLegend>}
    />
  ));
  expect(screen.getByRole("group", { name: "Notify by" }).textContent).toContain("Text message, Email");
});

it("CheckboxGroupView shows the empty marker when nothing is checked", () => {
  render(() => <CheckboxGroupView value={[]} />);
  expect(screen.getByRole("status").textContent).toBe("—");
});
