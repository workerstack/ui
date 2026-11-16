// The text of the generated CSS file and the classes it lists, from what an app imports and what the build recorded
// for each export (dist/classes.json).

import type { Theme } from "./config.ts";
import type { Used } from "./imports.ts";
import { PACKAGE_NAME } from "./package-name.constants.ts";

/** The classes of each export of each folder: folder, then export name. */
export type Manifest = Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;

const HEADER =
  "/* ui.generated.css, written by @workerstack/ui/vite from ui.config.ts and what this app imports. Do not edit. */\n";

/** The manifest in `text`, or undefined when it is not JSON. */
export function parseManifest(text: string): Manifest | undefined {
  try {
    return JSON.parse(text) /* the build wrote this shape: folder, then export name, then classes */ as Manifest;
  } catch {
    return undefined;
  }
}

/** The sorted classes of everything `used` takes; a folder or name the manifest lacks adds nothing. */
export function classesOf(manifest: Manifest, used: Used): string[] {
  const classes = new Set<string>();

  for (const [folder, names] of used) {
    const exports = manifest[folder] ?? {};
    const wanted = names === "all" ? Object.keys(exports) : [...names];

    for (const candidate of wanted.flatMap((name) => exports[name] ?? [])) classes.add(candidate);
  }

  return [...classes].toSorted();
}

/** The rules that make `.dark`, `.light` and `data-theme` force a color scheme. */
const SCHEME_RULES = [
  `.dark, [data-theme="dark"] { color-scheme: dark; }`,
  `.light, [data-theme="light"] { color-scheme: light; }`,
];

/** The `:root` rule of the theme's tokens and own colors, or nothing when none is set. */
function rootRule(theme: Theme): string[] {
  const lines = [...theme.tokens, ...theme.colors].map(([name, value]) => `  --ui-${name}: ${value};`);

  return lines.length === 0 ? [] : [`:root {\n${lines.join("\n")}\n}`];
}

/** The `@theme inline` rule that makes each own color a Tailwind color, or nothing without one. */
function themeRule(theme: Theme): string[] {
  if (theme.colors.length === 0) return [];

  const lines = theme.colors.map(([name]) => `--color-${name}: var(--ui-${name});`);

  return [`@theme inline { ${lines.join(" ")} }`];
}

/** The `@source inline()` listing `classes`, or nothing for none. */
function sourceRule(classes: readonly string[]): string[] {
  if (classes.length === 0) return [];

  const list = classes.join(" ").replaceAll("\\", "\\\\").replaceAll('"', '\\"');

  return [`@source inline("${list}");`];
}

/** The CSS file text: a note, UI SDK's base.css, the theme's rules, and one `@source inline()` for `classes`. */
export function generatedText(theme: Theme, classes: readonly string[]): string {
  const rules = [
    `@import "${PACKAGE_NAME}/base.css";`,
    ...rootRule(theme),
    ...themeRule(theme),
    ...(theme.dark === "class" ? SCHEME_RULES : []),
    ...sourceRule(classes),
  ];

  return `${HEADER}${rules.join("\n")}\n`;
}
