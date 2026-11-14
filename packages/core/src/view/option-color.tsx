import type { JSX } from "@solidjs/web";

import { Badge } from "../badge/index.ts";
import { cn } from "../cn/index.ts";
import type { OptionColor } from "../internal/index.ts";

// Each color sets `--option`. Status colors follow UI SDK's palette where it has one; the rest
// read their own `--ui-*` token (set it in `:root` to retheme) and fall back to a fixed hue.
const COLORS: Record<OptionColor, string> = {
  accent: "[--option:var(--ui-primary)]",
  "chart-1": "[--option:var(--ui-chart-1,oklch(0.62_0.16_25))]",
  "chart-2": "[--option:var(--ui-chart-2,oklch(0.7_0.15_85))]",
  "chart-3": "[--option:var(--ui-chart-3,oklch(0.65_0.16_145))]",
  "chart-4": "[--option:var(--ui-chart-4,oklch(0.65_0.13_205))]",
  "chart-5": "[--option:var(--ui-chart-5,oklch(0.58_0.18_265))]",
  "chart-6": "[--option:var(--ui-chart-6,oklch(0.62_0.18_325))]",
  danger: "[--option:var(--ui-destructive)]",
  info: "[--option:var(--ui-info,oklch(0.62_0.15_250))]",
  neutral: "[--option:var(--ui-muted-foreground)]",
  success: "[--option:var(--ui-success,oklch(0.64_0.16_150))]",
  warning: "[--option:var(--ui-warning,oklch(0.78_0.15_80))]",
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
