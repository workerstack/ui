import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { UiProvider } from "../provider/index.ts";
import { SwitchView } from "./index.ts";

afterEach(cleanup);

it("SwitchView reads on and off from the messages", () => {
  render(() => (
    <UiProvider messages={{ viewNo: "Ne", viewYes: "Da" }}>
      <SwitchView value />
      <SwitchView value={false} />
    </UiProvider>
  ));
  expect(screen.getAllByRole("status").map((view) => view.textContent)).toStrictEqual(["Da", "Ne"]);
});
