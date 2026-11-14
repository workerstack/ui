import type { JSX } from "@solidjs/web";
import { Button as ButtonPart, type ButtonState } from "@ui-sdk/solid/button";
import { omit, type ComponentProps } from "solid-js";

import { cn, cnState } from "../cn/index.ts";

/** How a button looks: `primary` for the main action, `destructive` for ones that delete. */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";

/** A button's height and padding; `icon` is square, for a lone icon. */
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BASE = [
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm",
  "font-medium outline-none transition-[color,background-color,border-color,box-shadow] delay-0",
  "focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50",
  "data-pending:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
];

const variants: Record<ButtonVariant, string> = {
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/40",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
};

const sizes: Record<ButtonSize, string> = {
  icon: "size-9",
  lg: "h-10 px-6",
  md: "h-9 px-4",
  sm: "h-8 px-3 text-xs",
};

/** A Button's classes, for things that should look like one without being one (a plain link, a trigger). */
export function buttonClass(
  options: {
    /** Defaults to `primary`. */
    variant?: ButtonVariant | undefined;
    /** Defaults to `md`. */
    size?: ButtonSize | undefined;
  } = {},
): string {
  const variant = options.variant ?? "primary";

  return cn(BASE, sizes[options.size ?? "md"], variants[variant]);
}

/** UI SDK's button props, plus how it looks. */
export type ButtonProps = ComponentProps<typeof ButtonPart> & {
  /** Defaults to `primary`. */
  variant?: ButtonVariant;
  /** Defaults to `md`. */
  size?: ButtonSize;
};

/**
 * A button. Return a Promise from `onClick` and it stays pending (`data-pending`) until it settles;
 * mark children `data-show="idle"` / `data-show="pending"` to swap what it shows meanwhile.
 */
export function Button(props: ButtonProps): JSX.Element {
  const rest = omit(props, "class", "variant", "size");

  return (
    <ButtonPart
      {...rest}
      class={cnState<ButtonState>(buttonClass({ size: props.size, variant: props.variant }), props.class)}
    />
  );
}
