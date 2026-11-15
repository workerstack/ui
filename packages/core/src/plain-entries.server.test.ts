import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { publicFolders } from "../scripts/export-map.ts";
import { bundle, reach, SRC } from "./test/bundle.ts";

// A plain entry never pulls in a form library: everything outside components/form/ bundles, all of it kept, with no
// @tanstack import, and no module it reaches names @tanstack, not even for a type.

const OUT = mkdtempSync(join(tmpdir(), "workerstack-plain-entries-"));
const FORM = "components/form/";
const TANSTACK_IMPORT = /from\s*"@tanstack\//u;

afterAll(() => rmSync(OUT, { force: true, recursive: true }));

const PLAIN = publicFolders(SRC).filter((folder) => !folder.startsWith(FORM));

/** The @tanstack imports of `folder`'s entry: in its bundle, and in the source of every module it reaches. */
function tanstackImports(folder: string): string[] {
  const entry = `${folder}/index.ts`;
  const bundled = bundle(`export * from ${JSON.stringify(join(SRC, entry))};\n`, OUT);
  const inBundle = TANSTACK_IMPORT.test(bundled.code) ? ["(bundle)"] : [];

  const inSource = [...reach(entry)].filter((module) => TANSTACK_IMPORT.test(readFileSync(join(SRC, module), "utf8")));

  return [...inBundle, ...inSource];
}

describe("a plain entry", () => {
  it("is every public folder outside components/form/", () => {
    expect(PLAIN.length).toBeGreaterThan(0);
  });

  it.each(PLAIN)("%s imports nothing from @tanstack", (folder) => {
    expect(tanstackImports(folder)).toStrictEqual([]);
  });
});
