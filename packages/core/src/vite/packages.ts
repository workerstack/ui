import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, parse } from "node:path";

import { PACKAGE_NAME } from "./package-name.constants.ts";

// The packages an app installs that themselves use @workerstack/ui, found from package.json files.

type Manifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  name?: string;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

/** The package.json under `dir`, or undefined when there is none or it is not JSON. */
function readManifest(dir: string): Manifest | undefined {
  try {
    const text = readFileSync(join(dir, "package.json"), "utf8");
    const parsed = JSON.parse(text) /* an installed package.json */ as Manifest | null;

    return parsed ?? undefined;
  } catch {
    return undefined;
  }
}

/** The folder of package `name` as node resolution finds it from `from`, as a real path, or undefined. */
function findPackage(name: string, from: string): string | undefined {
  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", name);

    if (existsSync(join(candidate, "package.json"))) return realpathSync(candidate);

    if (dirname(dir) === dir || dir === parse(dir).root) return undefined;
  }
}

/** The names a manifest installs. */
function installed(manifest: Manifest): string[] {
  return Object.keys({ ...manifest.dependencies, ...manifest.optionalDependencies });
}

/** The names the app itself installs, which include what it develops with. */
function installedByApp(manifest: Manifest): string[] {
  return [...installed(manifest), ...Object.keys(manifest.devDependencies ?? {})];
}

/** Whether a manifest lists @workerstack/ui as a dependency or a peer. */
function usesPackage(manifest: Manifest): boolean {
  return (
    manifest.name !== PACKAGE_NAME &&
    (manifest.dependencies?.[PACKAGE_NAME] !== undefined || manifest.peerDependencies?.[PACKAGE_NAME] !== undefined)
  );
}

/** What a walk of the app's dependencies found, and the real paths it has seen. */
type Walk = { consumers: string[]; manifests: string[]; seen: Set<string> };

/** What a walk of the app's dependencies found. */
export type Found = Pick<Walk, "consumers" | "manifests">;

/** Walks the packages `names` that `dir` installs, and theirs, adding to `found`. */
function visit(dir: string, names: readonly string[], found: Walk): void {
  for (const name of names) {
    const path = findPackage(name, dir);

    if (path === undefined || name === PACKAGE_NAME || found.seen.has(path)) continue;

    found.seen.add(path);
    found.manifests.push(join(path, "package.json"));
    const manifest = readManifest(path);

    if (manifest === undefined) continue;

    if (usesPackage(manifest)) found.consumers.push(path);

    visit(path, installed(manifest), found);
  }
}

/**
 * The packages reachable from the app at `root` through dependencies that list @workerstack/ui, and every
 * package.json read along the way.
 */
export function findConsumers(root: string): Found {
  const walk: Walk = { consumers: [], manifests: [join(root, "package.json")], seen: new Set() };
  const manifest = readManifest(root);

  if (manifest !== undefined) visit(root, installedByApp(manifest), walk);

  return { consumers: walk.consumers, manifests: walk.manifests };
}
