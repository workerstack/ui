import type { TOKENS, TokenKind, TokenName } from "./tokens.ts";

// The value types of `ui.config.ts`: what each kind of token holds, so a length given to a color, or a token UI SDK
// does not define, fails in the editor and in `tsc` instead of in the browser.

/** A CSS function with arguments, as a template literal: `fn(${string})`. */
type Fn<Name extends string> = `${Name}(${string})`;

/** A CSS color: a color function, a hex, a `var()`, `transparent` or `currentcolor`; a length is not one. */
export type Color =
  | `#${string}`
  | `var(--${string})`
  | "currentcolor"
  | "transparent"
  | Fn<"color-mix" | "color" | "hsl" | "hsla" | "hwb" | "lab" | "lch" | "light-dark">
  | Fn<"oklab" | "oklch" | "rgb" | "rgba">;

/** A color per scheme, written as CSS `light-dark()`. */
export type LightDark = {
  /** The color in the dark scheme. */
  dark: Color;
  /** The color in the light scheme. */
  light: Color;
};

/** A CSS length unit. */
type Unit =
  | "%"
  | "cap"
  | "ch"
  | "cm"
  | "dvh"
  | "dvw"
  | "em"
  | "ex"
  | "in"
  | "lh"
  | "mm"
  | "pc"
  | "pt"
  | "px"
  | "rem"
  | "rlh"
  | "svh"
  | "svw"
  | "vh"
  | "vmax"
  | "vmin"
  | "vw";

/** A CSS length: a number with a unit, zero, or a `calc()`, `min()`, `max()`, `clamp()` or `var()`. */
export type Length = `${number}${Unit}` | 0 | "0" | Fn<"calc" | "clamp" | "max" | "min" | "var">;

/** A unitless number, or a length. */
export type NumberOrLength = number | Exclude<Length, 0>;

/** A `box-shadow` list, written as CSS. */
export type Shadow = string;

/** A font family list, written as CSS. */
export type Font = string;

/** A CSS image: a `url()`, a gradient, a `var()` or `none`. */
export type Image =
  | "none"
  | `var(--${string})`
  | Fn<"conic-gradient" | "linear-gradient" | "radial-gradient" | "url">
  | Fn<"repeating-conic-gradient" | "repeating-linear-gradient" | "repeating-radial-gradient">;

/** A gradient direction: `to right`, `to bottom left`, or an angle. */
export type Direction =
  | `${number}${"deg" | "grad" | "rad" | "turn"}`
  | `to ${"bottom" | "left" | "right" | "top"}`
  | `to ${"bottom" | "top"} ${"left" | "right"}`
  | `to ${"left" | "right"} ${"bottom" | "top"}`
  | `var(--${string})`;

/** The type each token kind holds; a color also takes a color per scheme. */
type Values = {
  /** A color token. */
  color: Color | LightDark;
  /** A gradient direction token. */
  direction: Direction;
  /** A font family token. */
  font: Font;
  /** An image token. */
  image: Image;
  /** A length token. */
  length: Length;
  /** A unitless number or a length token. */
  number: NumberOrLength;
  /** A shadow token. */
  shadow: Shadow;
};

/** The value a token holds, by its name. */
export type TokenValue<Name extends TokenName> = Values[(typeof TOKENS)[Name] & TokenKind];

/** The tokens an app sets: each is optional, since UI SDK defaults them all. */
export type Tokens = { [Name in TokenName]?: TokenValue<Name> };

/** The app's own colors, by name: `brand` becomes `--ui-brand` and `bg-brand`. A token's name is not one. */
export type Colors = { [Name in TokenName]?: never } & {
  /** An own color: a color, or one per scheme. */
  [name: string]: Color | LightDark;
};

/** What `ui.config.ts` exports. */
export type UiConfig = {
  /** The app's own colors, by name. */
  colors?: Colors;
  /** `"class"` (default): `.dark`, `.light` and `data-theme` force a scheme. `"media"`: the system's only. */
  dark?: "class" | "media";
  /** UI SDK's `--ui-*` tokens, by name without the prefix. */
  tokens?: Tokens;
};
