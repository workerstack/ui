import { dirname } from "node:path";

import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

// The files Tailwind scans for an entry's CSS, found as Tailwind's own Vite plugin finds them.

type Source = { base: string; pattern: string; negated: boolean };

/** The sources Tailwind detects on its own for a compiler root: none, the whole app, or one given base. */
function detectedOf(compilerRoot: Awaited<ReturnType<typeof compile>>["root"], root: string): Source[] {
  if (compilerRoot === "none") return [];

  if (compilerRoot === null) return [{ base: root, negated: false, pattern: "**/*" }];

  return [{ ...compilerRoot, negated: false }];
}

/** The files Tailwind scans for the entry CSS `css` at `entry`. */
export async function sourcesOf(css: string, entry: string, root: string): Promise<string[]> {
  const compiler = await compile(css, { base: dirname(entry), onDependency: () => undefined });
  const sources = [...detectedOf(compiler.root, root), ...compiler.sources];

  return new Scanner({ sources }).files;
}

/** The files under `base`, as Tailwind's scanner lists them. */
export function filesUnder(base: string): string[] {
  return new Scanner({ sources: [{ base, negated: false, pattern: "**/*" }] }).files;
}
