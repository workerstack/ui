import { readFileSync } from "node:fs";

import { Scanner } from "@tailwindcss/oxide";

// The CSS files of an app that Tailwind starts from: the ones that `@import "tailwindcss"`.

/** The generated file's name, which an entry imports beside it. */
export const GENERATED_FILE = "ui.generated.css";

const CSS_FILE = /\.css$/u;
const TAILWIND_IMPORT = /@import\s+(["'])tailwindcss\1/u;
const TAILWIND_STATEMENT = /@import\s+(["'])tailwindcss\1[^;]*;/u;
const GENERATED_STATEMENT = /^[ \t]*@import\s+(["'])\.\/ui\.generated\.css\1[^;]*;[ \t]*\r?\n?/mu;
const GENERATED_IMPORT = `@import "./${GENERATED_FILE}";`;

/** The CSS files under `root` that import Tailwind, sorted. Git-ignored files and installed packages are skipped. */
export function findEntries(root: string): string[] {
  const { files } = new Scanner({ sources: [{ base: root, negated: false, pattern: "**/*" }] });

  return files.filter((file) => CSS_FILE.test(file) && TAILWIND_IMPORT.test(readFileSync(file, "utf8"))).toSorted();
}

/** The entry CSS `css` with `@import "./ui.generated.css";` on the line after its `@import "tailwindcss"`: added when
 *  missing, moved when above it, and `css` itself when it already sits below. */
export function withGeneratedImport(css: string): string {
  const tailwind = TAILWIND_STATEMENT.exec(css);

  if (tailwind === null) return css;

  const generated = GENERATED_STATEMENT.exec(css);

  if (generated !== null && generated.index > tailwind.index) return css;

  const without = generated === null ? css : css.replace(GENERATED_STATEMENT, "");
  const after = TAILWIND_STATEMENT.exec(without);

  if (after === null) return css;

  const end = after.index + after[0].length;

  return `${without.slice(0, end)}\n${GENERATED_IMPORT}${without.slice(end)}`;
}
