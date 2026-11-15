import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { choiceText } from "../view/index.ts";
import { ROLE_ITEMS, SelectViewFixture } from "./__fixtures__/select-view.fixture.tsx";
import { SelectView } from "./index.ts";

afterEach(cleanup);

it("SelectView shows the chosen item's label from items as the select names it", () => {
  render(() => <SelectViewFixture />);
  const output = screen.getByRole("status", { name: "Role" });
  expect(output.textContent).toBe(choiceText("member", ROLE_ITEMS));
  expect(output.textContent).toBe("Member");
});

it("SelectView joins several values and shows the empty marker for none", () => {
  render(() => (
    <>
      <SelectView items={ROLE_ITEMS} value={["admin", "member"]} />
      <SelectView items={ROLE_ITEMS} value={null} />
    </>
  ));
  expect(screen.getAllByRole("status").map((view) => view.textContent)).toStrictEqual(["Admin, Member", "—"]);
});

it("SelectView looks an object value up with itemToStringLabel", () => {
  render(() => <SelectView value={{ name: "Ada" }} itemToStringLabel={(person) => person.name} />);
  expect(screen.getByRole("status").textContent).toBe("Ada");
});
