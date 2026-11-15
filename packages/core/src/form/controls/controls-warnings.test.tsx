import { cleanup, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { inputElement } from "../../test/dom.ts";
import { collectWarningsAsync } from "../../test/warnings.ts";
import { settle, submit, typeInto } from "../__fixtures__/form-testing.ts";
import { renderProfile } from "./__fixtures__/profile-testing.tsx";

afterEach(cleanup);

it("the profile form of every wrapper mounts, submits and is fixed with no Solid warning", async () => {
  const { warnings } = await collectWarningsAsync(async () => {
    const { container } = await renderProfile();
    await submit(container);
    // Fixing one field drops its row; the summary keeps the other rows as they were.
    typeInto(inputElement(screen.getByRole("textbox", { name: /^Name/ })), "Ada");
    await settle();
    await submit(container);
  });

  expect(warnings).toStrictEqual([]);
});

it("the read-only profile form shows every View with no Solid warning", async () => {
  const { warnings } = await collectWarningsAsync(() => renderProfile({ readOnly: true }));

  expect(warnings).toStrictEqual([]);
});
