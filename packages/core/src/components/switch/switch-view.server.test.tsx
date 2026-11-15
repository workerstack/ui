import { renderServer, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { UiProvider } from "../provider/index.ts";
import { SwitchView } from "./index.ts";

it("SwitchView on the server reads on and off from the messages, without warnings", () => {
  const { html, warnings } = renderServer(() => (
    <UiProvider messages={{ viewNo: "Ne", viewYes: "Da" }}>
      <SwitchView value />
      <SwitchView value={false} />
    </UiProvider>
  ));

  expect(text(html)).toBe("DaNe");
  expect(warnings).toStrictEqual([]);
});
