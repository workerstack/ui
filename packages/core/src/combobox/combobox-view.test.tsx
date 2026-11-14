import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { ComboboxView } from "./index.ts";

afterEach(cleanup);

type Member = { id: string; name: string };

it("ComboboxView shows one label, several joined, an object's label and the empty marker", () => {
  const ada: Member = { id: "1", name: "Ada" };
  render(() => (
    <>
      <ComboboxView items={["Astro", "Remix"]} value="Remix" />
      <ComboboxView items={["Go", "Rust", "Zig"]} value={["Rust", "Zig"]} />
      <ComboboxView<Member> value={ada} itemToStringLabel={(member) => member.name} />
      <ComboboxView value={[]} />
    </>
  ));
  expect(screen.getAllByRole("status").map((view) => view.textContent)).toStrictEqual([
    "Remix",
    "Rust, Zig",
    "Ada",
    "—",
  ]);
});

it("ComboboxView shows a colored value as a badge from itemToColor", () => {
  render(() => <ComboboxView value="open" itemToColor={() => "success"} />);
  const badge = screen.getByRole("status").querySelector<HTMLElement>("[data-slot=badge]");
  expect(badge?.dataset.color).toBe("success");
  expect(badge?.textContent).toBe("open");
});
