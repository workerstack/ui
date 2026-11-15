import type { JSX } from "@solidjs/web";

import { MarkedFieldset } from "./marks.fixture.tsx";

/** A form that marks both kinds, over a fieldset whose legend says it is required. */
export function MarkedFieldsetFixture(): JSX.Element {
  return <MarkedFieldset required />;
}
