// UI SDK's `--ui-*` tokens, each with the kind of value it holds. The drift test parses UI SDK's web.css and checks
// these names equal the properties it defines, so a token UI SDK adds or drops fails there until this list follows.
// `--ui-icon` is a part's own slot, not a token, and is left out.

/** The kinds of value a token holds; `index.ts` maps each to a type. */
export type TokenKind = "color" | "direction" | "font" | "image" | "length" | "number" | "shadow";

/** Each token's name, without the `--ui-` prefix, with its kind. */
export const TOKENS = {
  background: "color",
  border: "color",
  checker: "image",
  destructive: "color",
  "font-mono": "font",
  "font-sans": "font",
  "font-size": "length",
  foreground: "color",
  "grid-line": "color",
  "icon-calendar": "image",
  "icon-check": "image",
  "icon-chevron": "image",
  "icon-eye": "image",
  "icon-eye-off": "image",
  "icon-minus": "image",
  "icon-pipette": "image",
  "icon-plus": "image",
  "icon-size": "length",
  "icon-star": "image",
  "icon-x": "image",
  input: "color",
  "line-height": "number",
  muted: "color",
  "muted-foreground": "color",
  overlay: "color",
  primary: "color",
  "primary-foreground": "color",
  radius: "length",
  "rating-color": "color",
  "rating-direction": "direction",
  ring: "color",
  "ring-border": "color",
  shadow: "shadow",
  spacing: "length",
  "tree-indent": "length",
} as const;

/** A token's name, without the `--ui-` prefix. */
export type TokenName = keyof typeof TOKENS;
