import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { publicFolders, SRC } from "./test/bundle.ts";

// The export map mirrors the folders: an import path is its folder's path under src/, every public folder (one with an
// index.ts) has one, and nothing else does.

type Conditions = Record<string, string>;

type Manifest = { exports: Record<string, Conditions | string>; sideEffects: unknown };

const MANIFEST = JSON.parse(readFileSync(join(SRC, "../package.json"), "utf8")) /* our package.json */ as Manifest;

/** Export map entries that point at a file rather than a folder's index. */
const FILES = new Set(["./package.json", "./theme.css"]);

const NAMESPACES = ["components/", "features/", "utils/"];

const ENTRIES = Object.entries(MANIFEST.exports).filter(
  (entry): entry is [string, Conditions] => !FILES.has(entry[0]) && typeof entry[1] === "object",
);

const FOLDERS = publicFolders();

/** What `target` (one condition's path, `*` already filled in) names under src/: its folder, from dist/'s layout. */
function sourceFolder(target: string): string {
  return target.replace(/^\.\/dist\//u, "").replace(/\/index\.(?:d\.ts|js)$/u, "");
}

/** The src/ folders importing `./<folder>` resolves to through `key` and its `conditions`, if `key` matches it. */
function resolveThrough(key: string, conditions: Conditions, folder: string): string[] | undefined {
  const [head = "", tail] = key.split("*");
  const path = `./${folder}`;

  if (tail === undefined ? path !== key : !path.startsWith(head) || !path.endsWith(tail)) return undefined;
  const star = tail === undefined ? "" : path.slice(head.length, path.length - tail.length);

  return Object.values(conditions).map((target) => sourceFolder(target.replace("*", star)));
}

function resolve(folder: string): string[] | undefined {
  for (const [key, conditions] of ENTRIES) {
    const folders = resolveThrough(key, conditions, folder);

    if (folders !== undefined) return folders;
  }

  return undefined;
}

/** True when every condition of the export that matches `./<folder>` points at that folder. */
function resolvesToItself(folder: string): boolean {
  return resolve(folder)?.every((each) => each === folder) === true;
}

function inNamespace(folder: string): boolean {
  return NAMESPACES.some((namespace) => folder.startsWith(namespace));
}

/** True when some public folder matches the export `key`. */
function matchesAFolder([key, conditions]: [string, Conditions]): boolean {
  return FOLDERS.some((folder) => resolveThrough(key, conditions, folder) !== undefined);
}

function hasIndex(folder: string): boolean {
  return existsSync(join(SRC, folder, "index.ts"));
}

/** Another folder's index.ts that `folder`'s index.ts re-exports from. */
function crossings(folder: string): string[] {
  const text = readFileSync(join(SRC, folder, "index.ts"), "utf8");
  const specifiers = [...text.matchAll(/^export[^;]*?from "(\.[^"]+)";/gmu)].map((match) => match[1] ?? "");
  const paths = specifiers.map((specifier) => relative(SRC, normalize(join(SRC, folder, specifier))));

  return paths.filter((path) => path.endsWith("index.ts") && dirname(path) !== folder);
}

describe("the export map", () => {
  it("gives every public folder an import path equal to its folder path", () => {
    expect(FOLDERS.filter((folder) => !resolvesToItself(folder))).toStrictEqual([]);
  });

  it("puts every public folder under components/, features/ or utils/", () => {
    expect(FOLDERS.filter((folder) => !inNamespace(folder))).toStrictEqual([]);
  });

  it("points each entry at an index.ts that exists", () => {
    const missing = FOLDERS.flatMap((folder) => resolve(folder) ?? []).filter((folder) => !hasIndex(folder));

    expect({ empty: ENTRIES.filter((entry) => !matchesAFolder(entry)), missing }).toStrictEqual({
      empty: [],
      missing: [],
    });
  });

  it("re-exports no other entry's index from an entry", () => {
    expect(FOLDERS.flatMap(crossings)).toStrictEqual([]);
  });

  it("has no module with side effects", () => {
    expect(MANIFEST.sideEffects).toBe(false);
  });
});
