import type { JSX } from "@solidjs/web";

import { InvitesForm } from "./invites.fixture.tsx";

/** The invites form, editable. */
export function EditableInvites(): JSX.Element {
  return <InvitesForm />;
}

/** The invites form, read-only. */
export function ReadOnlyInvites(): JSX.Element {
  return <InvitesForm readOnly />;
}
