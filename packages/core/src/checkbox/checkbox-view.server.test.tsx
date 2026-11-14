import { expect, it } from "vitest";

import { FieldsetLegend } from "../field/index.ts";
import { renderServer, slot, text } from "../test/server.ts";
import { CheckboxGroupView, CheckboxView } from "./index.ts";

// First in the file: Solid warns once per kind of write per process.
it("CheckboxView on the server renders Yes and No without warnings", () => {
  const { html, warnings } = renderServer(() => (
    <>
      <CheckboxView value />
      <CheckboxView value={false} />
    </>
  ));

  expect(text(html)).toBe("YesNo");
  expect(warnings).toStrictEqual([]);
});

it("CheckboxGroupView on the server joins the checked labels under its legend", () => {
  const { html, warnings } = renderServer(() => (
    <CheckboxGroupView
      items={["Email", "SMS"]}
      value={["SMS", "Email"]}
      legend={<FieldsetLegend>Notify by</FieldsetLegend>}
    />
  ));

  expect(text(html)).toBe("Notify bySMS, Email");
  expect(slot(html, "view").name).toBe("output");
  expect(warnings).toStrictEqual([]);
});

it("CheckboxGroupView on the server shows the empty marker for nothing checked", () => {
  const { html } = renderServer(() => <CheckboxGroupView value={[]} />);
  expect(slot(html, "view").attrs).toHaveProperty("data-empty");
  expect(text(html)).toBe("—");
});
