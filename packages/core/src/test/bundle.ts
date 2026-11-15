import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Bundles a consumer module with Bun the way an app's bundler would: for the browser, minified, every package
// external, so what lands in the output is only our code.

/** The package's `src/` folder, with a trailing separator. */
export const SRC: string = /* @__PURE__ */ fileURLToPath(/* @__PURE__ */ new URL("../", import.meta.url));

/** What one bundle holds: its code, and the bytes each module put in it, keyed by path relative to the root. */
export type Bundled = {
  code: string;
  bytes: Map<string, number>;
};

/** A Bun metafile, as far as these tests read it. */
type Metafile = { outputs: Record<string, { inputs: Record<string, { bytesInOutput: number }> }> };

/** A relative module specifier in an import or export statement, or in a dynamic import. */
const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(?\s*)"(\.[^"]+)"/gu;

/**
 * Bundles `source`, written to `out/consumer.js`, with paths in the result relative to `root`. JavaScript, so an
 * import whose names go unused stays, as under `verbatimModuleSyntax`, instead of being dropped as a type import.
 */
export function bundle(source: string, out: string, root: string = SRC): Bundled {
  const entry = join(out, "consumer.js");
  const file = join(out, "bundle.js");
  const metafile = join(out, "bundle.meta.json");
  writeFileSync(entry, source);
  const flags = ["--minify", "--target=browser", "--packages=external", `--metafile=${metafile}`];
  execFileSync("bun", ["build", entry, ...flags, "--outfile", file], { cwd: root, stdio: "ignore" });

  const meta = JSON.parse(readFileSync(metafile, "utf8")) /* Bun's metafile format */ as Metafile;
  const [output] = Object.values(meta.outputs);
  const inputs = Object.entries(output?.inputs ?? {});
  const bytes = new Map(inputs.map(([path, input]) => [relative(root, join(root, path)), input.bytesInOutput]));

  return { bytes, code: readFileSync(file, "utf8") };
}

/** The modules `module` (a path under `root`) imports from our code, type-only imports included. */
function importsOf(module: string, root: string): string[] {
  const text = readFileSync(join(root, module), "utf8");

  return [...text.matchAll(SPECIFIER)].map((match) => relative(root, join(root, dirname(module), match[1] ?? "")));
}

/** Every module of ours `from` (a path under `root`) reaches through its imports, itself included. */
export function reach(from: string, root: string = SRC): Set<string> {
  const seen = new Set<string>();
  const queue = [from];

  for (let next = queue.pop(); next !== undefined; next = queue.pop()) {
    if (seen.has(next) || !existsSync(join(root, next))) continue;
    seen.add(next);
    queue.push(...importsOf(next, root));
  }

  return seen;
}
