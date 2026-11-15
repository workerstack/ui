import type { JSX } from "@solidjs/web";

import { BooleanView, type BooleanViewProps } from "../view/index.ts";

/** A Switch's read-only view: on reads the provider's `viewYes`, off its `viewNo`. */
export function SwitchView(props: BooleanViewProps): JSX.Element {
  return <BooleanView {...props} />;
}
