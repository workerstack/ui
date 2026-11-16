import { join, relative } from "node:path";

import { bundleEntry } from "./bundle-entry.ts";
import { INDEX_JS } from "./theme.constants.ts";

// What an app can get from one entry: the entry is bundled the way an app bundles it, with every bare import external,
// and the modules of ours that put code in the bundle are the ones whose class strings can reach the app's CSS.

/** A bare import is a package, which stays out of the bundle. */
export function isExternal(id: string): boolean {
  return !(id.startsWith("\0") || id.startsWith(".") || id.startsWith("/"));
}

/** The modules of the built `folder` entry under `dist` that keep code in its bundle, as paths under `dist`, sorted. */
export async function keptModules(dist: string, folder: string): Promise<string[]> {
  const source = `export * from ${JSON.stringify(join(dist, folder, INDEX_JS))};\n`;
  const { modules } = await bundleEntry(source, dist, isExternal);

  return [...modules.keys()]
    .filter((id) => id.startsWith(dist))
    .map((id) => relative(dist, id))
    .toSorted();
}
