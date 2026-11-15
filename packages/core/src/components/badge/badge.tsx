import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { cn } from "../../utils/cn/index.ts";

/** How a badge looks: `primary` for emphasis, `destructive` for problems, `outline` for a quiet label. */
export type BadgeVariant = "primary" | "secondary" | "destructive" | "outline";

const BASE = [
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border border-transparent",
  "px-2 py-0.5 text-xs font-medium outline-none transition-[color,background-color,border-color,box-shadow]",
  "focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
];

const variants: Record<BadgeVariant, string> = {
  destructive: "bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90",
  outline: "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
  primary: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
};

/** A Badge's classes, for things that should look like one without being one (a link, a count). */
export function badgeClass(
  options: {
    /** Defaults to `primary`. */
    variant?: BadgeVariant | undefined;
  } = {},
): string {
  return cn(BASE, variants[options.variant ?? "primary"]);
}

/** A span's props, plus how it looks. */
export type BadgeProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & {
  /** Extra classes; they win over the badge's own. */
  class?: string;
  /** Defaults to `primary`. */
  variant?: BadgeVariant;
};

/** A short label. To make a link that looks like one, put `badgeClass()` on an `<a>`. */
export function Badge(props: BadgeProps): JSX.Element {
  const rest = omit(props, "class", "variant");

  return <span {...rest} data-slot="badge" class={cn(badgeClass({ variant: props.variant }), props.class)} />;
}
