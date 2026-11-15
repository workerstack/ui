import { expect, it } from "vitest";

import { renderServer, slots, text } from "../../test/server.ts";
import { ProfileForm, UnsavedPage } from "./__fixtures__/profile-form.fixture.tsx";

it("unsaved parts on the server render with no Solid warnings and no storage", () => {
  const { html, warnings } = renderServer(() => <UnsavedPage billingDraftKey="billing" />);
  expect(warnings).toStrictEqual([]);
  expect(slots(html, "form-unsaved-status")).toHaveLength(2);
  expect(slots(html, "form-draft-notice")).toHaveLength(2);
  expect(text(html)).not.toContain("Unsaved changes");
  expect(text(html)).not.toContain("Leave with unsaved changes?");
});

it("a save bar on the server renders nothing while the form is unchanged", () => {
  const { html } = renderServer(() => <ProfileForm saveBar draftKey="profile" defaults={{ name: "Ada" }} />);
  expect(slots(html, "form-save-bar")).toStrictEqual([]);
  expect(slots(html, "input")[0]?.attrs.value).toBe("Ada");
});
