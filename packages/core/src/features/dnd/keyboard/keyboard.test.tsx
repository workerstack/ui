import { cleanup, render, screen } from "@solidjs/testing-library";
import { pointer } from "@workerstack/testing/web/dom";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { mounted } from "../../../test/dom.ts";
import { SortableList } from "../__fixtures__/sortable-list.fixture.tsx";

afterEach(cleanup);

it("keyboard drops with Space and Enter without lifting the item again on the same key", async () => {
  render(() => <SortableList handles ids={["a", "b", "c"]} />);
  await mounted();
  screen.getByTestId("handle-a").focus();
  await userEvent.keyboard(" ");
  await userEvent.keyboard("{ArrowDown}");
  await userEvent.keyboard(" ");
  await pointer.frames();

  expect(screen.getByTestId("item-a").dataset.dndDragging).toBeUndefined();
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard("{ArrowDown}");
  await userEvent.keyboard("{Enter}");
  await pointer.frames();
  expect(screen.getByTestId("item-a").dataset.dndKeyboard).toBeUndefined();
  expect(screen.getAllByRole("listitem").map((item) => item.dataset.testid)).toStrictEqual([
    "item-b",
    "item-c",
    "item-a",
  ]);
});
