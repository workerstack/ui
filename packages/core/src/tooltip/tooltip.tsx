import type { JSX } from "@solidjs/web";
import {
  Tooltip as TooltipPart,
  TooltipArrow as TooltipArrowPart,
  TooltipContent as TooltipContentPart,
  TooltipTrigger as TooltipTriggerPart,
} from "@ui-sdk/solid/tooltip";
import { omit, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";
import { popupMotion } from "../internal/index.ts";

const ARROW = [
  "size-2.5 rotate-45 rounded-[2px] bg-foreground",
  "data-[side=top]:-bottom-1 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1",
];

/**
 * A short label that shows when the pointer rests on the trigger or focus reaches it. Holds state;
 * renders no element. `delay` is the wait before it opens (600 ms); while one tooltip is open the
 * next opens at once, so there is no provider.
 */
export { TooltipPart as Tooltip };

export type { TooltipProps } from "@ui-sdk/solid/tooltip";

/** UI SDK's tooltip trigger props. */
export type TooltipTriggerProps = ComponentProps<typeof TooltipTriggerPart>;

/** The element the tooltip names or describes. Renders a button; compose your own with `render`. */
export function TooltipTrigger(props: TooltipTriggerProps): JSX.Element {
  return <TooltipTriggerPart {...props} />;
}

/** UI SDK's tooltip content props: `side`, `align`, `sideOffset`, `alignOffset`. */
export type TooltipContentProps = ComponentProps<typeof TooltipContentPart>;

/** The tooltip: inverted colors, an arrow on the edge facing the trigger, above it by default. */
export function TooltipContent(props: TooltipContentProps): JSX.Element {
  const rest = omit(props, "class", "children");

  return (
    <TooltipContentPart
      {...rest}
      class={cnState(
        [
          "z-50 w-fit max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background",
          "delay-0",
          popupMotion,
        ],
        props.class,
      )}
    >
      {props.children}
      <TooltipArrowPart class={ARROW} />
    </TooltipContentPart>
  );
}
