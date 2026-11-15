import type { JSX } from "@solidjs/web";
import { Switch as SwitchPart, SwitchThumb as SwitchThumbPart } from "@ui-sdk/solid/switch";
import { omit, type ComponentProps } from "solid-js";

import { createRequiredToggle } from "../../internal/index.ts";
import { VALIDITY_MESSAGES_EN } from "../../internal/validity.messages.ts";
import { cnState } from "../../utils/cn/index.ts";
import { useUiMessages } from "../provider/index.ts";

/** How big a Switch is: `default` is 1.15rem by 2rem, `sm` is 0.875rem by 1.5rem. */
export type SwitchSize = "default" | "sm";

/** UI SDK's switch props: `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `name`, `value`, … */
export type SwitchProps = Omit<ComponentProps<typeof SwitchPart>, "children"> & {
  /**
   * The switch's size.
   * @default "default"
   */
  size?: SwitchSize;
};

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
          "group-data-[size=sm]/switch:size-3",
          "data-checked:ms-0 data-checked:translate-x-[calc(100%-2px)] rtl:data-checked:-translate-x-[calc(100%-2px)]",
        ],
        props.class,
      )}
    />
  );
}

const TRACK = [
  "group/switch inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full",
  "border border-transparent",
  "p-0 bg-input shadow-xs outline-none transition-all delay-0 focus-visible:border-ring focus-visible:ring-3",
  "focus-visible:ring-ring/50 data-checked:bg-primary data-disabled:cursor-not-allowed",
  "data-disabled:opacity-50 aria-invalid:border-destructive",
  "data-[size=sm]:h-3.5 data-[size=sm]:w-6",
  // Read-only keeps the look and loses the feedback: no pointer, no resting shadow.
  "data-readonly:cursor-default data-readonly:shadow-none",
];

/**
 * A control that turns a setting on or off. Inside a Field it takes the field's label, name and
 * disabled state. It draws its own thumb. While `required` and off it reports the provider's
 * `requiredTick`.
 */
export function Switch(props: SwitchProps): JSX.Element {
  const rest = omit(props, "class", "size", "onCheckedChange", "ref");
  const messages = useUiMessages(VALIDITY_MESSAGES_EN);
  const toggle = createRequiredToggle(props, { message: () => messages.requiredTick, part: "switch-input" });

  return (
    <SwitchPart
      {...rest}
      data-size={props.size ?? "default"}
      ref={toggle.ref}
      onCheckedChange={toggle.onCheckedChange}
      class={cnState(TRACK, props.class)}
    >
      <SwitchThumb />
    </SwitchPart>
  );
}
