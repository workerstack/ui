import { expect, it } from "vitest";

import { collectWarningsAsync } from "../../test/warnings.ts";
import { settle, submit } from "./form-testing.ts";
import type { ProfileField } from "./profile.fixture.ts";
import { renderProfile } from "./profile-testing.tsx";

// The warning checks every control field keeps, run against its field in the profile form. Solid
// warns once per kind of warning per process, so a field's test file registers these first.

/** A control field, and how a person fixes it after an empty submit. */
export type WarningsCase = {
  /** The field's name, for the test titles. */
  title: string;
  /** The profile's field (or fields) under test. */
  field: ProfileField;
  /** Fixes the field after the empty submit, before the next one. */
  fix?: () => void;
};

/** Registers the field's editable and read-only warning checks. */
export function testFieldWarnings(c: WarningsCase): void {
  it(`${c.title} mounts, submits and is fixed with no Solid warning`, async () => {
    const { warnings } = await collectWarningsAsync(async () => {
      const { container } = await renderProfile(c.field);
      await submit(container);
      c.fix?.();
      await settle();
      await submit(container);
    });

    expect(warnings).toStrictEqual([]);
  });

  it(`${c.title} in a read-only form shows its View with no Solid warning`, async () => {
    const { warnings } = await collectWarningsAsync(() => renderProfile(c.field, { readOnly: true }));

    expect(warnings).toStrictEqual([]);
  });
}
