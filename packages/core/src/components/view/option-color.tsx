import type { JSX } from "@solidjs/web";

import type { OptionColor } from "../../internal/index.ts";
import { cn } from "../../utils/cn/index.ts";
import { Badge } from "../badge/index.ts";

// Each color sets `--option`. Status colors follow UI SDK's palette where it has one; the rest
// read their own `--ui-*` token, which base.css defaults (set it in `:root` to retheme).
const COLORS: Record<OptionColor, string> = {
  accent: "[--option:var(--ui-primary)]",
  "chart-1": "[--option:var(--ui-chart-1)]",
  "chart-2": "[--option:var(--ui-chart-2)]",
  "chart-3": "[--option:var(--ui-chart-3)]",
  "chart-4": "[--option:var(--ui-chart-4)]",
  "chart-5": "[--option:var(--ui-chart-5)]",
  "chart-6": "[--option:var(--ui-chart-6)]",
  danger: "[--option:var(--ui-destructive)]",
  info: "[--option:var(--ui-info)]",
  neutral: "[--option:var(--ui-muted-foreground)]",
  success: "[--option:var(--ui-success)]",
  warning: "[--option:var(--ui-warning)]",
};

/** What `OptionDot` takes. */
export type OptionDotProps = {
  /** The option's color. */
  color: OptionColor;
  /** Extra classes; they win over the dot's own. */
  class?: string;
};

/** A small dot in the option's color, for lists, triggers and chips. The label carries the meaning. */
export function OptionDot(props: OptionDotProps): JSX.Element {
  return (
    <span
      aria-hidden="true"
      data-slot="option-dot"
      data-color={props.color}
      class={cn("inline-block size-2 shrink-0 rounded-full bg-(--option)", COLORS[props.color], props.class)}
    />
  );
}

/** What `OptionBadge` takes. */
export type OptionBadgeProps = {
  /** The option's color; neutral when it has none. */
  color?: OptionColor | undefined;
  /** The option's label. */
  children: JSX.Element;
  /** Extra classes; they win over the badge's own. */
  class?: string;
};

/** The option read as a badge tinted in its color, for views and table cells. */
export function OptionBadge(props: OptionBadgeProps): JSX.Element {
  function color(): OptionColor {
    return props.color ?? "neutral";
  }

  return (
    <Badge
      variant="outline"
      data-color={color()}
      class={cn("border-(--option)/30 bg-(--option)/15", COLORS[color()], props.class)}
    >
      {props.children}
    </Badge>
  );
}
