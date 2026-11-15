import type { JSX } from "@solidjs/web";

import { ProfileDialog } from "./form-dialog.fixture.tsx";

/** The profile dialog, closed, with its trigger. */
export function ClosedProfile(): JSX.Element {
  return <ProfileDialog />;
}

/** The profile dialog, open. */
export function OpenProfile(): JSX.Element {
  return <ProfileDialog defaultOpen />;
}
