import { bundleEntry } from "../../scripts/bundle-entry.ts";
import type { Bundled } from "../../scripts/bundle-entry.ts";

// Bundles a consumer module the way an app does: importing through the package's export keys from an app folder that
// links the package into its node_modules. Every other bare import stays external, so what is left is our code.

const PACKAGE_NAME = "@workerstack/ui";
const KEY_PREFIX = "./".length;

/** The specifier of an export key (`./components/button`) as an app writes it. */
export function specifier(key: string): string {
  return `${PACKAGE_NAME}/${key.slice(KEY_PREFIX)}`;
}

/** Rollup's `external`: every bare import stays out of the bundle, except the package under test. */
function isExternal(id: string): boolean {
  const ours = id.startsWith("\0") || id.startsWith(".") || id.startsWith("/") || id.startsWith(PACKAGE_NAME);

  return !ours;
}

/** Bundles `source` from `app`, keeping the modules under `packageDir` that put code in the bundle. */
export async function consume(source: string, app: string, packageDir: string): Promise<Bundled> {
  const { code, exports, modules } = await bundleEntry(source, app, isExternal);

  return { code, exports, modules: new Map([...modules].filter(([id]) => id.startsWith(packageDir))) };
}
