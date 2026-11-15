import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bundle, publicFolders, reach, SRC } from "./test/bundle.ts";

// Every entry tree-shakes. A named import keeps only the module that defines the name and what that module imports,
// never the entry's other modules. An entry imported for nothing keeps no code at all: no module runs anything on
// import. That second check bundles a copy of src/ with no package.json above it, so the package's `sideEffects` hint
// can't hide a module that does run something; only the code itself and its `@__PURE__` marks count.

const OUT = mkdtempSync(join(tmpdir(), "workerstack-tree-shake-"));
const COPY = join(OUT, "src");

beforeAll(() => {
  cpSync(SRC, COPY, { recursive: true });
  const compilerOptions = { jsx: "react-jsx", jsxImportSource: "@solidjs/web" };
  writeFileSync(join(OUT, "tsconfig.json"), JSON.stringify({ compilerOptions }));
});

afterAll(() => rmSync(OUT, { force: true, recursive: true }));

// A package import stays in the bundle because the bundler can't look inside a package kept external; the app's
// bundler drops it by that package's own `sideEffects`. What is left after those is our code.
const PACKAGE_IMPORT = /import\s*(?:[\w$*\s{},]+?\s*from\s*)?"[^".][^"]*";?/gu;

// Zero: any byte left is code of ours that runs when the entry loads, which is what this guards against. A module
// whose top level only declares (functions, literals, `@__PURE__` calls) leaves nothing.
const MAX_IMPORT_ONLY_BYTES = 0;

/** A name imported from an entry, and the module that defines it. */
type NamedCase = [entry: string, name: string, defining: string];

const NAMED: NamedCase[] = [
  ["components/button", "Button", "components/button/button.tsx"],
  ["components/field", "FieldLabel", "components/field/field-label.tsx"],
  ["components/form/tanstack/form", "SubmitButton", "components/form/tanstack/form/form-parts.tsx"],
  ["features/dnd/sortable", "createSortable", "features/dnd/sortable/create-sortable.ts"],
];

/** The modules of ours that put code in a bundle of `name` from `entry` and that `defining` doesn't import. */
function unrelated(entry: string, name: string, defining: string): string[] {
  const path = JSON.stringify(join(SRC, entry, "index.ts"));
  const bundled = bundle(`import { ${name} } from ${path};\nconsole.info(${name});\n`, OUT);
  const related = reach(defining);
  const kept = [...bundled.bytes].filter(([module, bytes]) => bytes > 0 && !module.startsWith(".."));

  const outside = kept.map(([module]) => module).filter((module) => !related.has(module));

  return related.has(defining) ? outside : [...outside, defining];
}

/** The code of ours left in a bundle of `source`, run against the copy of src/. */
function ownCode(source: string): string {
  return bundle(source, OUT, COPY).code.replaceAll(PACKAGE_IMPORT, "").trim();
}

describe("tree-shaking", () => {
  it.each(NAMED)("%s keeps only %s and what %s imports", (entry, name, defining) => {
    expect(unrelated(entry, name, defining)).toStrictEqual([]);
  });

  it.each(publicFolders())("%s imported for nothing keeps no code", (folder) => {
    const code = ownCode(`import ${JSON.stringify(join(COPY, folder, "index.ts"))};\n`);

    expect(code.length, code).toBeLessThanOrEqual(MAX_IMPORT_ONLY_BYTES);
  });

  it("keeps no code for a name imported and never used", () => {
    const code = ownCode(`import { Dialog } from ${JSON.stringify(join(COPY, "components/dialog/index.ts"))};\n`);

    expect(code.length, code).toBeLessThanOrEqual(MAX_IMPORT_ONLY_BYTES);
  });
});
