import { createSignal } from "solid-js";

import { DimensionsPopover } from "./dimensions-popover.fixture.tsx";

function TrackedPopover(props: { defaultOpen?: boolean }) {
  const [open, setOpen] = createSignal(props.defaultOpen ?? false);

  return (
    <div>
      <DimensionsPopover defaultOpen={props.defaultOpen} onOpenChange={setOpen} />
      <output>{open() ? "open" : "closed"}</output>
    </div>
  );
}

export const PopoverFixture = () => <TrackedPopover />;
export const PopoverOpenFixture = () => <TrackedPopover defaultOpen />;
