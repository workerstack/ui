import { cn } from "../cn/index.ts";

/**
 * How a button looks: `primary` for the main action, `soft` for a tint of it, `destructive` for
 * ones that delete.
 */
export type ButtonVariant = "primary" | "secondary" | "soft" | "outline" | "ghost" | "destructive" | "link";

/** A button's height and padding; `icon` is square, for a lone icon. */
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "icon";

/** How wide a button is: its content (`auto`), its row (`fill`), or its content and no wider (`fit-content`). */
export type ButtonInlineSize = "auto" | "fill" | "fit-content";

const BASE = [
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm",
  "font-medium outline-none transition-[color,background-color,border-color,box-shadow,translate] delay-0",
  "focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50",
  "data-pending:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  // A coarse pointer's tap target: at least 44px, centered on the box, whatever its size.
  "pointer-coarse:after:absolute pointer-coarse:after:inset-[min(0px,calc((100%-2.75rem)/2))]",
  "pointer-coarse:after:content-['']",
];

// A press moves the button down 1px, unless it opens a popup (a menu trigger).
const PRESS = "active:not-aria-[haspopup]:translate-y-px";

const HOVER_ACCENT =
  "hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground";

const variants: Record<ButtonVariant, string> = {
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 " +
    "aria-expanded:bg-destructive/90 focus-visible:ring-destructive/40",
  ghost: HOVER_ACCENT,
  link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
  outline: `border border-input bg-background ${HOVER_ACCENT}`,
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 aria-expanded:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary/80",
  soft: "bg-primary/10 text-primary hover:bg-primary/15 aria-expanded:bg-primary/20 active:bg-primary/20",
};

const sizes: Record<ButtonSize, string> = {
  icon: "size-9",
  lg: "h-10 px-6",
  md: "h-9 px-4",
  sm: "h-8 px-3 text-xs",
  xl: "h-11 px-8 text-base",
  xs: "h-6 gap-1 px-2 text-xs",
};

const inlineSizes: Record<ButtonInlineSize, string | undefined> = {
  auto: undefined,
  fill: "w-full",
  "fit-content": "w-fit",
};

/** A Button's classes, for things that should look like one without being one (a plain link, a trigger). */
export function buttonClass(
  options: {
    /** Defaults to `primary`. */
    variant?: ButtonVariant | undefined;
    /** Defaults to `md`. */
    size?: ButtonSize | undefined;
    /** Defaults to `auto`. */
    inlineSize?: ButtonInlineSize | undefined;
  } = {},
): string {
  const variant = options.variant ?? "primary";

  return cn(
    BASE,
    sizes[options.size ?? "md"],
    variants[variant],
    variant !== "link" && PRESS,
    inlineSizes[options.inlineSize ?? "auto"],
  );
}
