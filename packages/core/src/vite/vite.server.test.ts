import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import type { ViteDevServer } from "vite";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { buildPackage } from "../test/build-package.ts";
import { SRC } from "../test/bundle.ts";
import {
  buildCss,
  closeAll,
  FIXTURES,
  GENERATED,
  generatedClasses,
  MAIN,
  makeApp,
  removeAll,
  serve,
  STYLES,
  until,
  write,
} from "../test/vite-app.ts";
import type { Env } from "../test/vite-app.ts";
import type { ui } from "./ui.ts";

// The plugin on real apps, as the built package ships it: the test builds the package, imports `ui` from the built
// dist/vite/index.js, and runs it on fixture apps.

const ROOT = join(SRC, "..");
const CACHE = join(ROOT, "node_modules", ".cache", "ui-vite");
const PACKAGE = join(CACHE, "package");
const APPS = mkdtempSync(join(tmpdir(), "ui-vite-"));
const MANIFEST = "classes.json";

/** A class Button's own file sets. */
const BUTTON_CLASS = "cursor-pointer";

/** A class only Dialog's footer sets. */
const DIALOG_ONLY_CLASS = "flex-col-reverse";

/** A main.tsx that imports Button and Dialog. */
const BUTTON_AND_DIALOG = [
  `import "./styles.css";`,
  `import { Button } from "@workerstack/ui/components/button";`,
  `import { Dialog } from "@workerstack/ui/components/dialog";`,
  ``,
  `export { Button, Dialog };`,
  ``,
].join("\n");

/** The classes of each export of each folder: folder, then export name. */
type Manifest = Record<string, Record<string, string[]>>;

let manifest: Manifest = {};
let env: Env = { apps: APPS, built: PACKAGE, ui: () => ({ name: "unset" }) };
const servers: ViteDevServer[] = [];

beforeAll(async () => {
  rmSync(CACHE, { force: true, recursive: true });
  mkdirSync(CACHE, { recursive: true });
  const dist = await buildPackage(PACKAGE);
  const url = pathToFileURL(join(dist, "vite", "index.js")).href;
  const built = (await import(url)) /* the built twin of ./index.ts */ as { ui: typeof ui };

  manifest = JSON.parse(readFileSync(join(dist, MANIFEST), "utf8")) /* the build wrote this shape */ as Manifest;
  env = { apps: APPS, built: PACKAGE, ui: built.ui };
}, 300_000);

afterEach(async () => {
  await closeAll(servers);
});

afterAll(() => {
  removeAll(CACHE, APPS);
});

/** The classes of the listed exports, each as `[folder, name]`, sorted and without repeats. */
function classesOf(...exports: (readonly [string, string])[]): string[] {
  const classes = exports.flatMap(([folder, name]) => manifest[folder]?.[name] ?? []);

  return [...new Set(classes)].toSorted();
}

/** Starts a dev server on `app`; `afterEach` closes it. */
async function serveApp(app: string, warnings: string[] = []): Promise<ViteDevServer> {
  const server = await serve(env, app, { infos: [], warnings });

  servers.push(server);

  return server;
}

describe("the classes the plugin writes for an app's own imports", () => {
  it("lists exactly Button's classes for an app that imports Button, ignoring a git-ignored file", async () => {
    const app = makeApp(env, "button-app", "button-app");

    write(app, ".gitignore", "ignored/\n");
    write(
      app,
      join("src", "ignored", "x.tsx"),
      `import { Dialog } from "@workerstack/ui/components/dialog";\n\nexport { Dialog };\n`,
    );
    await buildCss(env, app);

    expect(generatedClasses(app)).toStrictEqual(classesOf(["components/button", "Button"]));
  }, 120_000);

  it("lists no classes for an app that imports nothing of the package", async () => {
    const app = makeApp(env, "empty-app", "empty-app");

    await buildCss(env, app);

    expect(existsSync(join(app, GENERATED))).toBe(true);
    expect(generatedClasses(app)).toStrictEqual([]);
  }, 120_000);
});

describe("the classes the plugin writes for a dependency", () => {
  it("adds DialogFooter's classes for a dependency that imports DialogFooter", async () => {
    const app = makeApp(env, "dialog-lib-app", "empty-app");

    cpSync(join(FIXTURES, "dialog-lib"), join(app, "node_modules", "dialog-lib"), { recursive: true });
    write(
      app,
      "package.json",
      `${JSON.stringify({ dependencies: { "dialog-lib": "*" }, name: "dialog-lib-app", type: "module" })}\n`,
    );
    await buildCss(env, app);

    expect(generatedClasses(app)).toStrictEqual(classesOf(["components/dialog", "DialogFooter"]));
  }, 120_000);
});

describe("the manifest", () => {
  it("holds no `{` or `}` in any manifest class, which `@source inline()` would expand", () => {
    const braced = Object.values(manifest)
      .flatMap((folder) => Object.values(folder))
      .flat()
      .filter((name) => name.includes("{") || name.includes("}"));

    expect(braced).toStrictEqual([]);
  });
});

describe("vite build with [solid(), tailwindcss(), ui()]", () => {
  it("makes CSS with Button's class and without a class only Dialog's footer sets, from a clean app", async () => {
    const app = makeApp(env, "clean-build", "button-app");

    expect(existsSync(join(app, GENERATED))).toBe(false);

    const css = await buildCss(env, app);

    expect({
      button: css.includes(`.${BUTTON_CLASS}`),
      dialog: css.includes(`.${DIALOG_ONLY_CLASS}`),
    }).toStrictEqual({ button: true, dialog: false });
  }, 120_000);
});

describe("the dev server", () => {
  it("rewrites the generated file after main.tsx starts importing Dialog", async () => {
    const app = makeApp(env, "dev-app", "button-app");

    await serveApp(app);

    expect(generatedClasses(app)).toStrictEqual(classesOf(["components/button", "Button"]));

    write(app, MAIN, BUTTON_AND_DIALOG);

    const wanted = classesOf(["components/button", "Button"], ["components/dialog", "Dialog"]);

    const classes = await until(
      () => generatedClasses(app),
      (found) => found.length === wanted.length,
    );

    expect(classes).toStrictEqual(wanted);
  }, 120_000);
});

describe("the dev server's warnings", () => {
  it("warns when no CSS file imports tailwindcss, and writes nothing", async () => {
    const app = makeApp(env, "no-tailwind", "button-app");
    const warnings: string[] = [];

    write(app, STYLES, `body {\n  margin: 0;\n}\n`);
    await serveApp(app, warnings);

    expect(warnings).toContain(`ui: no CSS file under ${app} imports "tailwindcss"; nothing to write`);
    expect(existsSync(join(app, GENERATED))).toBe(false);
  }, 120_000);
});
