import type { JSX } from "@solidjs/web";
import { Switch as SwitchPart, SwitchThumb as SwitchThumbPart } from "@ui-sdk/solid/switch";
import { omit, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";

/** UI SDK's switch props: `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `name`, `value`, … */
export type SwitchProps = Omit<ComponentProps<typeof SwitchPart>, "children">;

/** UI SDK's switch thumb props. */
export type SwitchThumbProps = ComponentProps<typeof SwitchThumbPart>;

/** The round thumb that slides toward the end edge while the switch is on. */
export function SwitchThumb(props: SwitchThumbProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <SwitchThumbPart
      {...rest}
      class={cnState(
        [
          "pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform delay-0",
          "data-checked:ms-0 data-checked:translate-x-[calc(100%-2px)] rtl:data-checked:-translate-x-[calc(100%-2px)]",
        ],
        props.class,
      )}
    />
  );
}

/**
 * A control that turns a setting on or off. Inside a Field it takes the field's label, name and
 * disabled state. It draws its own thumb.
 */
export function Switch(props: SwitchProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <SwitchPart
      {...rest}
      class={cnState(
        [
          "inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0",
          "bg-input shadow-xs outline-none transition-all delay-0 focus-visible:border-ring focus-visible:ring-3",
          "focus-visible:ring-ring/50 data-checked:bg-primary data-disabled:cursor-not-allowed",
          "data-disabled:opacity-50 aria-invalid:border-destructive",
        ],
        props.class,
      )}
    >
      <SwitchThumb />
    </SwitchPart>
  );
}
