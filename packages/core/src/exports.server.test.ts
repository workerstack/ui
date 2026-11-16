import { readFileSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { exportMap, uiFolders } from "../scripts/export-map.ts";
import { SRC } from "./test/bundle.ts";

// The export map lists every public folder (one with an index.ts) as its own key, and nothing else. It is generated
// from the folders, so a folder can't become public by accident.

type Manifest = { exports: unknown; sideEffects: unknown };

const MANIFEST = JSON.parse(readFileSync(join(SRC, "../package.json"), "utf8")) /* our package.json */ as Manifest;

const NAMESPACES = ["components/", "features/", "utils/"];

const FOLDERS = uiFolders(SRC);

function inNamespace(folder: string): boolean {
  return NAMESPACES.some((namespace) => folder.startsWith(namespace));
}

/** Another folder's index.ts that `folder`'s index.ts re-exports from. */
function crossings(folder: string): string[] {
  const text = readFileSync(join(SRC, folder, "index.ts"), "utf8");
  const specifiers = [...text.matchAll(/^export[^;]*?from "(\.[^"]+)";/gmu)].map((match) => match[1] ?? "");
  const paths = specifiers.map((specifier) => relative(SRC, normalize(join(SRC, folder, specifier))));

  return paths.filter((path) => path.endsWith("index.ts") && dirname(path) !== folder);
}

describe("the export map", () => {
  it("is the one generated from the folders", () => {
    // Compared as text so the failure shows the first key that differs and the order of keys counts.
    expect(
      JSON.stringify(MANIFEST.exports, null, 2),
      "package.json `exports` is out of date: run `bun run sync:exports`",
    ).toBe(JSON.stringify(Object.fromEntries(exportMap(SRC)), null, 2));
  });

  it("has no `*` pattern", () => {
    expect([...exportMap(SRC).keys()].filter((key) => key.includes("*"))).toStrictEqual([]);
  });

  it("puts every public folder under components/, features/ or utils/", () => {
    expect(FOLDERS.filter((folder) => !inNamespace(folder))).toStrictEqual([]);
  });

  it("re-exports no other entry's index from an entry", () => {
    expect(FOLDERS.flatMap(crossings)).toStrictEqual([]);
  });

  it("has no module with side effects", () => {
    expect(MANIFEST.sideEffects).toBe(false);
  });
});
