import { renderServer, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { ComboboxView } from "./index.ts";

it("ComboboxView on the server shows one label, several joined and the empty marker, without warnings", () => {
  const { html, warnings } = renderServer(() => (
    <>
      <ComboboxView items={["Astro", "Remix"]} value="Remix" />
      <ComboboxView items={["Go", "Rust", "Zig"]} value={["Rust", "Zig"]} />
      <ComboboxView value={[]} />
    </>
  ));

  expect(text(html)).toBe("RemixRust, Zig—");
  expect(warnings).toStrictEqual([]);
});
