import type { JSX } from "@solidjs/web";

import { ProjectMenu } from "./project-menu.fixture.tsx";

/** The filtered menu with its popup open from the start, as the server renders it. */
export function ProjectMenuOpenFixture(): JSX.Element {
  return <ProjectMenu defaultOpen />;
}

/** The filtered menu while closed. */
export function ProjectMenuFixture(): JSX.Element {
  return <ProjectMenu />;
}
