import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { SRC } from "../test/bundle.ts";
import { buildCss, builtEnv, makeApp, removeAll, STYLES, write } from "../test/vite-app.ts";
import type { Env, Logs } from "../test/vite-app.ts";

// The entry CSS the plugin edits: the import of the generated file is added below `@import "tailwindcss"`, moved
// there from above it, and left alone when it already sits below.

const CACHE = join(SRC, "..", "node_modules", ".cache", "ui-vite-import");
const APPS = mkdtempSync(join(tmpdir(), "ui-vite-import-"));
const TAILWIND = `@import "tailwindcss";`;
const GENERATED_IMPORT = `@import "./ui.generated.css";`;
const BODY = `body {\n  margin: 0;\n}\n`;
const FIXED = `${TAILWIND}\n${GENERATED_IMPORT}\n\n${BODY}`;

let env: Env = { apps: APPS, built: CACHE, ui: () => ({ name: "unset" }) };

beforeAll(async () => {
  env = await builtEnv(APPS, CACHE);
}, 300_000);

afterAll(() => {
  removeAll(CACHE, APPS);
});

describe("the import of the generated file", () => {
  it("adds it right after @import tailwindcss when missing, and says so", async () => {
    const app = makeApp(env, "import-missing", "button-app");
    const logs: Logs = { infos: [], warnings: [] };

    write(app, STYLES, `${TAILWIND}\n\n${BODY}`);
    await buildCss(env, app, logs);

    expect(readFileSync(join(app, STYLES), "utf8")).toBe(FIXED);
    expect(logs.infos).toContain(`ui: added @import "./ui.generated.css" to ${STYLES}`);
  }, 120_000);

  it("moves it below tailwind when it sits above", async () => {
    const app = makeApp(env, "import-above", "button-app");

    write(app, STYLES, `${GENERATED_IMPORT}\n${TAILWIND}\n\n${BODY}`);
    await buildCss(env, app);

    expect(readFileSync(join(app, STYLES), "utf8")).toBe(FIXED);
  }, 120_000);

  it("leaves the file alone when the import is already below, and says nothing", async () => {
    const app = makeApp(env, "import-below", "button-app");
    const logs: Logs = { infos: [], warnings: [] };
    const css = `${TAILWIND}\n\n${GENERATED_IMPORT}\n`;

    write(app, STYLES, css);
    await buildCss(env, app, logs);

    expect(readFileSync(join(app, STYLES), "utf8")).toBe(css);
    expect(logs.infos.filter((line) => line.startsWith("ui: added"))).toStrictEqual([]);
  }, 120_000);
});
