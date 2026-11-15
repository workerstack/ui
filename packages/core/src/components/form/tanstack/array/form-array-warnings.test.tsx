import { cleanup } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { collectWarningsAsync } from "../../../../test/warnings.ts";
import { settle, submit } from "../form/__fixtures__/form-testing.ts";
import { emails, press, renderInvites } from "./__fixtures__/invites-testing.tsx";

afterEach(cleanup);

it("FormArray adds, moves and removes items, and submits, with no Solid warning", async () => {
  const { result, warnings } = await collectWarningsAsync(async () => {
    const { container } = await renderInvites();
    await press("Add invite");
    await press("Move item 1 down");
    await press("Move item 2 up");
    await press("Move item 3 up");
    await press("Remove item 1");
    await submit(container);

    return emails(container);
  });

  expect(result).toStrictEqual(["", "grace@acme.dev"]);
  expect(warnings).toStrictEqual([]);
});

it("FormArray takes items written from outside, and unmounts, with no Solid warning", async () => {
  const { warnings } = await collectWarningsAsync(async () => {
    const { form } = await renderInvites();
    form.setFieldValue("invites", [{ email: "linus@acme.dev" }]);
    await settle();
    form.reset();
    await settle();
    cleanup();
  });

  expect(warnings).toStrictEqual([]);
});
