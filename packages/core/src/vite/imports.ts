import { extname } from "node:path";

import { parseAst } from "vite";

import { PACKAGE_NAME } from "./package-name.constants.ts";

// What one source file takes from @workerstack/ui, folder by folder: the names it imports, or "all" when it can take
// any of them (a namespace, a re-export of everything, a dynamic import, or text the parser cannot read).

const PREFIX = `${PACKAGE_NAME}/`;

/** The export names a file takes from each folder, or "all" for every export of it. */
export type Used = Map<string, Set<string> | "all">;

type Lang = "js" | "jsx" | "ts" | "tsx";

/** The parser's language for each extension it can read. */
const LANGS = {
  ".cjs": "js",
  ".cts": "ts",
  ".js": "js",
  ".jsx": "jsx",
  ".mjs": "js",
  ".mts": "ts",
  ".ts": "ts",
  ".tsx": "tsx",
} as const satisfies Record<string, Lang>;

/** A folder of the package named in text, for the files the parser cannot read. */
const NAMED_FOLDER = /@workerstack\/ui\/(?<folder>[\w-]+(?:\/[\w-]+)*)/gu;

/** A dynamic import of a folder of the package, written with a plain string. */
const DYNAMIC_IMPORT = /\bimport\s*\(\s*(["'])@workerstack\/ui\/(?<folder>[\w-]+(?:\/[\w-]+)*)\1\s*\)/gu;

/** The name of an identifier or a string-named export. */
type Name = { name?: string; value?: string };

/** One name of an import or export statement, as the parser gives it plus the TypeScript `type` marker. */
type Specifier = {
  type: "ExportSpecifier" | "ImportDefaultSpecifier" | "ImportNamespaceSpecifier" | "ImportSpecifier";
  imported?: Name;
  local?: Name;
  importKind?: "type" | "value";
  exportKind?: "type" | "value";
};

/** A top-level statement of a module, as far as imports and re-exports go. */
type Statement = {
  type: "ExportAllDeclaration" | "ExportNamedDeclaration" | "ImportDeclaration" | "Other";
  source?: { value?: string };
  specifiers?: readonly Specifier[];
  importKind?: "type" | "value";
  exportKind?: "type" | "value";
};

/** The folder of a specifier that names a folder of this package. */
function folderOf(specifier: string | undefined): string | undefined {
  return specifier?.startsWith(PREFIX) === true && specifier.length > PREFIX.length
    ? specifier.slice(PREFIX.length)
    : undefined;
}

/** The text of a name. */
function textOf(name: Name | undefined): string | undefined {
  return name?.name ?? name?.value;
}

/** Records that `names` (or every export, for "all") of `folder` are used. */
function add(used: Used, folder: string, names: readonly string[] | "all"): void {
  const known = used.get(folder);

  if (known === "all") return;

  used.set(folder, names === "all" ? "all" : new Set([...(known ?? []), ...names]));
}

/** The names a statement's specifiers take: the imported name of an import, the source name of a re-export. */
function valueNames(statement: Statement): string[] {
  const isImport = statement.type === "ImportDeclaration";

  return (statement.specifiers ?? [])
    .filter((specifier) => specifier.importKind !== "type" && specifier.exportKind !== "type")
    .flatMap((specifier) => textOf(isImport ? specifier.imported : specifier.local) ?? []);
}

/** Records what one top-level statement takes from the package. */
function addStatement(used: Used, statement: Statement): void {
  const folder = folderOf(statement.source?.value);

  if (folder === undefined || statement.importKind === "type" || statement.exportKind === "type") return;

  const specifiers = statement.specifiers ?? [];

  const takesAll =
    statement.type === "ExportAllDeclaration" ||
    specifiers.some((specifier) => specifier.type === "ImportNamespaceSpecifier");

  const names = valueNames(statement);

  if (takesAll) add(used, folder, "all");
  else if (names.length > 0) add(used, folder, names);
}

/** Every folder of the package that `code` names anywhere, each as "all". */
function named(code: string): Used {
  const used: Used = new Map();

  for (const match of code.matchAll(NAMED_FOLDER)) add(used, match.groups?.folder ?? "", "all");

  return used;
}

/** Records each dynamic `import("@workerstack/ui/<folder>")` in `code` as taking all of the folder. */
function addDynamic(used: Used, code: string): void {
  for (const match of code.matchAll(DYNAMIC_IMPORT)) add(used, match.groups?.folder ?? "", "all");
}

/** What the parsed `code` takes from the package. */
function parsed(code: string, lang: Lang): Used {
  const used: Used = new Map();
  const program = parseAst(code, { lang });
  const body = program.body /* estree statements, plus TypeScript's `type` markers */ as readonly Statement[];

  for (const statement of body) addStatement(used, statement);

  addDynamic(used, code);

  return used;
}

/**
 * What `code`, the text of `file`, takes from the package. A JS or TS file is parsed; any other file, and a file that
 * does not parse (reported to `onUnparsed`), counts as taking every export of each folder it names.
 */
export function usedExports(code: string, file: string, onUnparsed?: () => void): Used {
  const extension = extname(file).toLowerCase();

  if (!(extension in LANGS)) return named(code);

  const lang = LANGS[extension /* checked by `in` above */ as keyof typeof LANGS];

  try {
    return parsed(code, lang);
  } catch {
    const used = named(code);

    if (used.size > 0) onUnparsed?.();

    return used;
  }
}

/** Adds what `from` holds into `into`. */
export function merge(into: Used, from: Used): void {
  for (const [folder, names] of from) add(into, folder, names === "all" ? names : [...names]);
}
