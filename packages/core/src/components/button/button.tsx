import type { JSX } from "@solidjs/web";
import { Button as ButtonPart, type ButtonState } from "@ui-sdk/solid/button";
import { omit, type ComponentProps } from "solid-js";

import { withAfter } from "../../internal/index.ts";
import { cn, cnState } from "../../utils/cn/index.ts";
import { useUiMessages } from "../provider/index.ts";
import { buttonClass, type ButtonInlineSize, type ButtonSize, type ButtonVariant } from "./button-class.ts";
import { BUTTON_MESSAGES_EN } from "./button.messages.ts";

const SPINNER = "pointer-events-none absolute inset-0 flex items-center justify-center";
const RING = "size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none";
const CHEVRON = "[--ui-icon:var(--ui-icon-chevron)] [--ui-icon-size:1rem]";

/** UI SDK's button props, plus how it looks and a `loading` state. */
export type ButtonProps = ComponentProps<typeof ButtonPart> & {
  /** Defaults to `primary`. */
  variant?: ButtonVariant;
  /** Defaults to `md`. */
  size?: ButtonSize;
  /** Defaults to `auto`; `fill` stretches the button to its row. */
  inlineSize?: ButtonInlineSize;
  /** Shows a spinner in place of the content, disables the button and sets `aria-busy`. The width stays. */
  loading?: boolean;
  /** Appends the chevron of a menu trigger. */
  disclosure?: boolean;
};

// The spinner covers the content, which stays in the layout so the width does not change.
function Spinner(): JSX.Element {
  const messages = useUiMessages(BUTTON_MESSAGES_EN);

  return (
    <output data-slot="button-spinner" aria-label={messages.loading} class={SPINNER}>
      <span aria-hidden="true" class={RING} />
    </output>
  );
}

function ButtonBody(props: { busy: boolean; children: JSX.Element }): JSX.Element {
  return (
    <>
      {props.busy ? <Spinner /> : null}
      <span data-slot="button-content" class={cn("inline-flex items-center gap-[inherit]", props.busy && "invisible")}>
        {props.children}
      </span>
    </>
  );
}

/**
 * A button. Return a Promise from `onClick` and it stays pending (`data-pending`) until it settles;
 * mark children `data-show="idle"` / `data-show="pending"` to swap what it shows meanwhile.
 * `loading` and a pending Promise both show the spinner over the content, at the same width.
 */
export function Button(props: ButtonProps): JSX.Element {
  const rest = omit(props, "class", "variant", "size", "inlineSize", "loading", "disclosure", "disabled", "children");
  const chevron = <span data-icon="chevron" aria-hidden="true" class={CHEVRON} />;
  const content = withAfter<ButtonState>(props.children, props.disclosure === true ? chevron : null);

  return (
    <ButtonPart
      {...rest}
      disabled={props.loading === true || props.disabled === true}
      aria-busy={props.loading === true ? "true" : props["aria-busy"]}
      class={cnState<ButtonState>(
        cn("group/button", buttonClass(props), props.loading === true && "data-disabled:opacity-100"),
        props.class,
      )}
    >
      {(state: ButtonState) => <ButtonBody busy={props.loading === true || state.pending}>{content(state)}</ButtonBody>}
    </ButtonPart>
  );
}
