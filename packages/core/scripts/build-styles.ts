// Writes one styles.css per public folder into the build: `@source` lines naming the built files that folder's entry
// reaches, so an app's Tailwind builds the classes of the entries it imports and no others.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

import { publicFolders } from "./export-map.ts";
import { keptModules } from "./kept-modules.ts";
import { STYLES } from "./theme.constants.ts";

/** A path made explicitly relative, as `@source` reads it from the stylesheet's own folder. */
function explicit(path: string): string {
  return path.startsWith(".") ? path : `./${path}`;
}

/** The stylesheet for `folder`: one `@source` line per built module its tree-shaken bundle keeps. */
async function stylesheet(dist: string, folder: string): Promise<string> {
  const kept = await keptModules(dist, folder);
  const lines = kept.map((file) => `@source "${explicit(posix.relative(folder, file))}";`);

  return `${lines.join("\n")}\n`;
}

/** Writes `<folder>/styles.css` under `dist` for every public folder found under `src`. */
export async function buildStyles(dist: string, src: string): Promise<void> {
  await Promise.all(
    publicFolders(src).map(async (folder) => {
      const css = await stylesheet(dist, folder);
      mkdirSync(join(dist, folder), { recursive: true });
      writeFileSync(join(dist, folder, STYLES), css);
    }),
  );
}

if (import.meta.main) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  await buildStyles(join(root, "dist"), join(root, "src"));
}
