import { readdirSync } from "node:fs";
import { relative, sep } from "node:path";

import { INDEX_FILE } from "../src/test/index-file.constants.ts";
import { STYLES } from "./theme.constants.ts";

// The package's export map, derived from the folders: one key per public folder, and a `styles.css` key beside it,
// so what an app can import is listed and a folder can't become public by accident.

/** Folders that are never public: helpers, private internals and test fixtures. */
const PRIVATE: readonly string[] = ["__fixtures__", "internal", "test"];

/** A test file, which never ships. */
const TEST_FILE = /\.test\.tsx?$/u;

/** The conditions of one export key. `solid` is there only for a folder that holds JSX. */
export type Conditions = { types: string; solid?: string; default: string };

/** Paths under `root`, as folders-relative strings with `/`, that are not inside a private folder. */
function shipped(root: string): { name: string; folder: string }[] {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => ({ folder: relative(root, entry.parentPath).split(sep).join("/"), name: entry.name }))
    .filter(({ folder }) => !folder.split("/").some((part) => PRIVATE.includes(part)));
}

/** Every public folder under `root`: one that holds an `index.ts`, outside the private folders. */
export function publicFolders(root: string): string[] {
  return shipped(root)
    .filter(({ folder, name }) => name === INDEX_FILE && folder !== "")
    .map(({ folder }) => folder)
    .toSorted();
}

/** The export map for the package whose sources are under `src`: a key per folder, sorted, then the two files. */
export function exportMap(src: string): Map<string, Conditions | string> {
  const files = shipped(src).filter(({ name }) => !TEST_FILE.test(name));

  const entries = publicFolders(src).flatMap((folder): [string, Conditions | string][] => {
    const tree = `${folder}/`;
    const jsx = files.some((file) => file.name.endsWith(".tsx") && `${file.folder}/`.startsWith(tree));
    const js = `./dist/${folder}/index.js`;
    const types = `./dist/${folder}/index.d.ts`;

    return [
      [`./${folder}`, { types, ...(jsx ? { solid: js } : {}), default: js }],
      [`./${folder}/${STYLES}`, `./dist/${folder}/${STYLES}`],
    ];
  });

  return new Map<string, Conditions | string>([
    ...entries,
    ["./package.json", "./package.json"],
    ["./theme.css", "./dist/theme.css"],
  ]);
}
