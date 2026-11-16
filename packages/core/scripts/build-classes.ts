// Writes dist/classes.json: for each public folder, the Tailwind classes each named export's tree-shaken code holds.
// Every export is bundled alone the way an app bundles it, so a module only another export uses adds nothing, and the
// classes are the scanned candidates Tailwind accepts, so an app can be given exactly the classes of what it imports.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { __unstable__loadDesignSystem } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

import { bundleEntry } from "./bundle-entry.ts";
import { publicFolders } from "./export-map.ts";
import { isExternal } from "./kept-modules.ts";
import { CLASSES, INDEX_JS, THEME } from "./theme.constants.ts";

/** The spaces the manifest is indented by. */
const INDENT = 2;

type DesignSystem = Awaited<ReturnType<typeof __unstable__loadDesignSystem>>;

/** The built entry of `folder`, as the specifier a bundle imports. */
function entryOf(dist: string, folder: string): string {
  return JSON.stringify(join(dist, folder, INDEX_JS));
}

/** The names `folder`'s built entry exports, sorted. */
async function exportsOf(dist: string, folder: string): Promise<string[]> {
  const { exports } = await bundleEntry(`export * from ${entryOf(dist, folder)};\n`, dist, isExternal);

  return exports.toSorted();
}

/** The sorted classes of one export: the scanned candidates of its bundle that the design system makes CSS of. */
async function classesOf(dist: string, entry: string, design: DesignSystem): Promise<string[]> {
  const { code } = await bundleEntry(entry, dist, isExternal);
  const candidates = new Scanner({}).scanFiles([{ content: code, extension: "js" }]);
  const valid = candidates.filter((candidate) => design.candidatesToCss([candidate])[0] !== null);

  return [...new Set(valid)].toSorted();
}

/** Writes `classes.json` under `dist` for every public folder found under `src`. */
export async function buildClasses(dist: string, src: string): Promise<void> {
  const root = join(src, "..");
  const css = `@import "tailwindcss"; @import "${join(src, THEME)}";`;

  const [design, folders] = await Promise.all([
    __unstable__loadDesignSystem(css, { base: root }),
    Promise.all(publicFolders(src).map(async (folder) => ({ folder, names: await exportsOf(dist, folder) }))),
  ]);

  const entries = await Promise.all(
    folders.map(async ({ folder, names }) => {
      const classes = await Promise.all(
        names.map((name) => classesOf(dist, `export { ${name} } from ${entryOf(dist, folder)};\n`, design)),
      );

      return [folder, Object.fromEntries(names.map((name, index) => [name, classes[index]]))] as const;
    }),
  );

  mkdirSync(dist, { recursive: true });
  writeFileSync(join(dist, CLASSES), `${JSON.stringify(Object.fromEntries(entries), null, INDENT)}\n`);
}

if (import.meta.main) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  await buildClasses(join(root, "dist"), join(root, "src"));
}
