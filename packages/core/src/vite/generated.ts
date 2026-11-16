// The text of the generated CSS file and the classes it lists, from what an app imports and what the build recorded
// for each export (dist/classes.json).

import type { Used } from "./imports.ts";

/** The classes of each export of each folder: folder, then export name. */
export type Manifest = Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;

const HEADER = "/* ui.generated.css, written by @workerstack/ui/vite from what this app imports. Do not edit. */\n";

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

/** The CSS file text for `classes`: a note and one `@source inline()` listing them, or only the note for none. */
export function generatedText(classes: readonly string[]): string {
  if (classes.length === 0) return HEADER;

  const list = classes.join(" ").replaceAll("\\", "\\\\").replaceAll('"', '\\"');

  return `${HEADER}@source inline("${list}");\n`;
}
