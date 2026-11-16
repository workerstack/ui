import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { exportMap, NON_UI, uiFolders } from "../scripts/export-map.ts";
import { ARRAY_MESSAGES_EN } from "./components/form/tanstack/array/array.messages.ts";
import { FORM_DIALOG_MESSAGES_EN } from "./components/form/tanstack/dialog/dialog.messages.ts";
import { FIELD_MODULE_ERROR_MESSAGES_EN } from "./components/form/tanstack/form/field-module-error.messages.ts";
import { FORM_ERROR_SUMMARY_MESSAGES_EN } from "./components/form/tanstack/form/form-error-summary.messages.ts";
import { FORM_DRAFT_NOTICE_MESSAGES_EN } from "./components/form/tanstack/unsaved/form-draft-notice.messages.ts";
import { FORM_SAVE_BAR_MESSAGES_EN } from "./components/form/tanstack/unsaved/form-save-bar.messages.ts";
import { FORM_UNSAVED_STATUS_MESSAGES_EN } from "./components/form/tanstack/unsaved/form-unsaved-status.messages.ts";
import { FORM_UNSAVED_MESSAGES_EN } from "./components/form/tanstack/unsaved/form-unsaved.messages.ts";
import { LEAVE_CONFIRM_MESSAGES_EN } from "./components/form/tanstack/unsaved/leave-confirm.messages.ts";
import { UNSAVED_MESSAGES_EN } from "./components/form/tanstack/unsaved/unsaved.messages.ts";
import type { UiMessages } from "./components/provider/ui-messages.ts";
import { buildPackage } from "./test/build-package.ts";
import { reach, SRC } from "./test/bundle.ts";
import { consume as bundleAsApp, specifier } from "./test/consume.ts";

// How an app consumes the package: the build is laid out as a package, linked into an app's node_modules, and bundled
// by Vite with the Solid plugin, importing through the export keys. Every other bare import stays external, so what
// is left is our code. Sizes are what Rollup rendered per module, after minifying.

const PACKAGE_NAME = "@workerstack/ui";
const FORM = "components/form/";
const TANSTACK = /@tanstack\//u;

const TMP = mkdtempSync(join(tmpdir(), "workerstack-consumer-"));
const PACKAGE = join(TMP, "package");
const APP = join(TMP, "app");

/** The modules of ours in a bundle, as paths under src/, with the bytes each put in it, and the bundle's code. */
type Consumed = { code: string; kept: Map<string, number> };

/** The src/ file a built module comes from: the built `.js` or `.jsx` is a `.ts` or `.tsx` there. */
function sourceOf(built: string): string {
  const stem = relative(join(PACKAGE, "dist"), built).replace(/\.jsx?$/u, "");

  return [".ts", ".tsx"].map((ext) => stem + ext).find((path) => existsSync(join(SRC, path))) ?? stem;
}

/** Bundles `source` the way an app does, importing through the package's export keys. */
async function consume(source: string): Promise<Consumed> {
  const { code, modules } = await bundleAsApp(source, APP, PACKAGE);

  return { code, kept: new Map([...modules].map(([id, bytes]) => [sourceOf(id), bytes])) };
}

beforeAll(async () => {
  await buildPackage(PACKAGE);

  mkdirSync(join(APP, "node_modules", "@workerstack"), { recursive: true });
  symlinkSync(realpathSync(PACKAGE), join(APP, "node_modules", PACKAGE_NAME));
}, 120_000);

afterAll(() => rmSync(TMP, { force: true, recursive: true }));

/** The export keys of folders, as import specifiers. */
const FILES = new Set(["./package.json", "./theme.css"]);

const KEYS = [...exportMap(SRC).keys()].filter((key) => !FILES.has(key) && !NON_UI.includes(key.slice(2)));

/** A name imported from an entry, and the module that defines it. */
type NamedCase = [entry: string, name: string, defining: string];

const NAMED: NamedCase[] = [
  ["components/button", "Button", "components/button/button.tsx"],
  ["components/checkbox", "Checkbox", "components/checkbox/checkbox.tsx"],
  ["components/field", "FieldLabel", "components/field/field-label.tsx"],
  ["components/form/tanstack/form", "SubmitButton", "components/form/tanstack/form/form-parts.tsx"],
  ["features/dnd/sortable", "createSortable", "features/dnd/sortable/create-sortable.ts"],
  ["utils/cn", "cnState", "utils/cn/cn.ts"],
];

/** Shorter strings ("Cancel", "Save") are words other parts say too, so they prove nothing. */
const MIN_LENGTH = 6;

/** The plain strings of an English object that are long enough to be telling. */
function longTexts(english: Partial<UiMessages>): string[] {
  return Object.values(english).filter((text): text is string => typeof text === "string" && text.length > MIN_LENGTH);
}

/** The English strings only the form layer shows: each plain string, and a phrase from each function's text. */
const FORM_STRINGS: string[] = [
  ARRAY_MESSAGES_EN,
  FIELD_MODULE_ERROR_MESSAGES_EN,
  FORM_DIALOG_MESSAGES_EN,
  FORM_DRAFT_NOTICE_MESSAGES_EN,
  FORM_ERROR_SUMMARY_MESSAGES_EN,
  FORM_SAVE_BAR_MESSAGES_EN,
  FORM_UNSAVED_MESSAGES_EN,
  FORM_UNSAVED_STATUS_MESSAGES_EN,
  LEAVE_CONFIRM_MESSAGES_EN,
  UNSAVED_MESSAGES_EN,
]
  .flatMap(longTexts)
  .concat(["Move item", "Restored your unsaved changes", "will be lost.", "Saved on this device"]);

/** The English of other parts, which a Button has no use for. */
const NOT_BUTTONS: string[] = ["Choose an option.", "Type to create an option", "(optional)", "No results", "Clear"];

const PLAIN = uiFolders(SRC).filter((folder) => !folder.startsWith(FORM));

describe("an app's build through the export keys", () => {
  it("lists a key for every public folder", () => {
    expect(KEYS).toStrictEqual(uiFolders(SRC).map((folder) => `./${folder}`));
  });

  it.each(KEYS)("%s imported for nothing keeps no code", async (key) => {
    const { kept } = await consume(`import ${JSON.stringify(specifier(key))};\n`);

    expect([...kept]).toStrictEqual([]);
  });

  it.each(NAMED)("%s keeps only %s and what %s imports", async (entry, name, defining) => {
    const { kept } = await consume(
      `import { ${name} } from ${JSON.stringify(specifier(`./${entry}`))};\nconsole.info(${name});\n`,
    );

    const related = reach(defining);

    expect({
      defining: kept.has(defining),
      unrelated: [...kept.keys()].filter((module) => !related.has(module)),
    }).toStrictEqual({ defining: true, unrelated: [] });
  });

  it.each(PLAIN)("%s, bundled whole, holds no @tanstack import", async (folder) => {
    const { code } = await consume(`export * from ${JSON.stringify(specifier(`./${folder}`))};\n`);

    expect(TANSTACK.test(code)).toBe(false);
  });
});

describe("an app's English strings", () => {
  it("keeps Button's own string and no other part's, for a Button alone", async () => {
    const { code } = await consume(
      `import { Button } from ${JSON.stringify(specifier("./components/button"))};\nconsole.info(Button);\n`,
    );

    expect({
      loading: code.includes("Loading"),
      others: [...NOT_BUTTONS, ...FORM_STRINGS].filter((text) => code.includes(text)),
    }).toStrictEqual({ loading: true, others: [] });
  });

  it.each(PLAIN)("%s, bundled whole, holds no English string of the form layer", async (folder) => {
    const { code } = await consume(`export * from ${JSON.stringify(specifier(`./${folder}`))};\n`);

    expect(FORM_STRINGS.filter((text) => code.includes(text))).toStrictEqual([]);
  });
});
