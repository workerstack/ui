import { readFileSync } from "node:fs";

import { Scanner } from "@tailwindcss/oxide";

// The CSS files of an app that Tailwind starts from: the ones that `@import "tailwindcss"`.

/** The generated file's name, which an entry imports beside it. */
export const GENERATED_FILE = "ui.generated.css";

const CSS_FILE = /\.css$/u;
const TAILWIND_IMPORT = /@import\s+(["'])tailwindcss\1/u;
const GENERATED_IMPORT = /@import\s+(["'])\.\/ui\.generated\.css\1/u;

/** The CSS files under `root` that import Tailwind, sorted. Git-ignored files and installed packages are skipped. */
export function findEntries(root: string): string[] {
  const { files } = new Scanner({ sources: [{ base: root, negated: false, pattern: "**/*" }] });

  return files.filter((file) => CSS_FILE.test(file) && TAILWIND_IMPORT.test(readFileSync(file, "utf8"))).toSorted();
}

/** Whether the CSS `text` imports the generated file from its own folder. */
export function importsGenerated(text: string): boolean {
  return GENERATED_IMPORT.test(text);
}
