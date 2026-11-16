import { existsSync } from "node:fs";
import { basename, join } from "node:path";

import { runnerImport } from "vite";

import type { Colors, LightDark, Tokens, UiConfig } from "../config/index.ts";
import { TOKENS } from "../config/tokens.ts";

// `ui.config.ts` at the Vite root: loaded with Vite's own runner, then parsed. The parse is the boundary: what the
// types of `@workerstack/ui/config` refuse is refused here again, since a config written in JavaScript or cast past
// the types still reaches the CSS. Past it, the theme is plain data.

/** The config file names, in the order they are looked for. */
const CONFIG_EXTENSIONS: readonly string[] = ["ts", "mts", "js", "mjs"];

const COLOR_NAME = /^[a-z][a-z0-9-]*$/u;
const UNSAFE = /[;{}]/u;
const DARK_MODES = ["class", "media"] as const;
const DEFAULT_DARK: Dark = DARK_MODES[0];
const COLORS_PATH = "colors";
const TOKENS_PATH = "tokens";

/** How dark mode is chosen: `class` also lets `.dark`, `.light` and `data-theme` force a scheme. */
type Dark = (typeof DARK_MODES)[number];

/** The theme the config sets: each value is the CSS text written after `--ui-<name>:`. */
export type Theme = {
  colors: readonly (readonly [name: string, value: string])[];
  dark: Dark;
  tokens: readonly (readonly [name: string, value: string])[];
};

/** What loading found: the theme, the config file when there is one, and the files it imported. */
export type Loaded = { dependencies: readonly string[]; file: string | undefined; theme: Theme };

/** The theme when there is no config file: no tokens, and the class strategy. */
const DEFAULT_THEME: Theme = { colors: [], dark: DEFAULT_DARK, tokens: [] };

/** CSS text or a number. */
type Scalar = number | string;

/** A value of the config: a scalar, or one color per scheme. */
type Raw = LightDark | Scalar;

/** The CSS text of one string or finite number; throws a message that starts with `where` when it is neither. */
function textOf(part: Scalar | undefined, where: string): string {
  const text = `${part}`.trim();
  const isNumber = Number.isFinite(part);
  const isText = part?.constructor === String && text.length > 0;

  if (!isNumber && !isText) throw new Error(`${where} must be a CSS string, a number, or { light, dark }`);

  if (UNSAFE.test(text)) throw new Error(`${where} holds ";", "{" or "}"; give one CSS value`);

  return text;
}

/** The CSS text of a token or color value at `path` in the file named `file`. */
function cssOf(value: Raw, path: string, file: string): string {
  const where = `ui: ${file} ${path}`;

  if (!(value instanceof Object)) return textOf(value, where);

  return `light-dark(${textOf(value.light, where)}, ${textOf(value.dark, where)})`;
}

/** The entries of `values`, which is `path` of the config; throws when it is set and not an object. */
function entriesOf(values: Colors | Tokens | undefined, path: string, file: string): [string, Raw][] {
  if (values === undefined) return [];

  if (!(values instanceof Object)) throw new Error(`ui: ${file} ${path} must be an object`);

  return Object.entries(values) /* the types of UiConfig: each value is a Raw */ as [string, Raw][];
}

/** The theme of the default export `config` of the file named `file`; throws a message that says what to fix. */
function parseTheme(config: UiConfig | undefined, file: string): Theme {
  if (config === undefined || !(config instanceof Object))
    throw new Error(`ui: ${file} has no default export; export default defineConfig({ ... })`);

  const { colors, dark = DEFAULT_DARK, tokens } = config;

  if (!DARK_MODES.includes(dark)) throw new Error(`ui: ${file} dark must be "class" or "media"`);

  const parsedTokens = entriesOf(tokens, TOKENS_PATH, file).map(([name, value]): [string, string] => {
    if (!Object.hasOwn(TOKENS, name))
      throw new Error(`ui: ${file} tokens.${name} is not a token; the tokens are listed in @workerstack/ui/config`);

    return [name, cssOf(value, `tokens.${name}`, file)];
  });

  const parsedColors = entriesOf(colors, COLORS_PATH, file).map(([name, value]): [string, string] => {
    if (Object.hasOwn(TOKENS, name)) throw new Error(`ui: ${file} colors.${name} is a token; set it under tokens`);

    if (!COLOR_NAME.test(name))
      throw new Error(`ui: ${file} colors.${name} is not a lowercase name like "brand" or "brand-muted"`);

    return [name, cssOf(value, `colors.${name}`, file)];
  });

  return { colors: parsedColors, dark, tokens: parsedTokens };
}

/** Loads and parses the config in `root`; no config file gives the defaults. Throws the message of a bad config. */
export async function loadConfig(root: string): Promise<Loaded> {
  const paths = CONFIG_EXTENSIONS.map((extension) => join(root, `ui.config.${extension}`));
  const file = paths.find((path) => existsSync(path));

  if (file === undefined) return { dependencies: [], file: undefined, theme: DEFAULT_THEME };

  const name = basename(file);

  const loaded = await runnerImport<{ default?: UiConfig }>(file, { root }).catch((error: Error) => {
    throw new Error(`ui: ${name} could not load: ${error.message}`, { cause: error });
  });

  return { dependencies: loaded.dependencies, file, theme: parseTheme(loaded.module.default, name) };
}
