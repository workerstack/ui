import solid from "@solidjs/vite-plugin";
import type * as SolidWeb from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createServer, type ViteDevServer } from "vite";
import type { BrowserCommandContext } from "vitest/node";

import { collectWarnings } from "./src/test/warnings.ts";

// Runs in Node, called from a hydration test in the browser. Server-renders a fixture through
// Vite's SSR loader, as an SSR app's request handler does, so the browser can hydrate the HTML with
// the same fixture compiled hydratable.

/** Kept on globalThis: the config and the global setup load this module separately, and the setup's
    teardown has to close the server the command opened. */
type Shared = { workerstackSsr?: Promise<ViteDevServer> };

function shared(): Shared {
  return globalThis /* a plain object: an optional key on it is always safe to read and write */ as Shared;
}

function vite(root: string): Promise<ViteDevServer> {
  const state = shared();

  state.workerstackSsr ??= createServer({
    appType: "custom",
    configFile: false,
    logLevel: "silent",
    optimizeDeps: { noDiscovery: true },
    plugins: [solid({ refresh: false, ssr: true })],
    root,
    server: { hmr: false, middlewareMode: true, watch: null },
  });

  return state.workerstackSsr;
}

/** What the server rendered for a hydration test. */
export type ServerRendered = {
  html: string;
  /** What Solid and UI SDK warned about while rendering on the server. */
  warnings: string[];
};

type FixtureModule = Record<string, (() => JSX.Element) | undefined>;

/** Renders `name` from the fixture module at `fixture` on the server and collects its warnings. */
export async function serverRender(
  context: BrowserCommandContext,
  fixture: string,
  name: string,
): Promise<ServerRendered> {
  const ssr = await vite(context.project.config.root);
  const mod = (await ssr.ssrLoadModule(fixture)) /* a fixture module exports components */ as FixtureModule;
  const web = (await ssr.ssrLoadModule("@solidjs/web")) /* the module itself, loaded for SSR */ as typeof SolidWeb;
  const fixtureComponent = mod[name];

  if (fixtureComponent === undefined) throw new Error(`${fixture} exports no ${name}`);

  const { result: html, warnings } = collectWarnings(() =>
    web.renderToString(() => web.createComponent(fixtureComponent, {})),
  );

  return { html, warnings };
}

/** Global setup: nothing to start; the command opens the SSR server on first use. */
export function setup(): void {}

/** Global teardown: closes the SSR server so vitest can exit. */
export async function teardown(): Promise<void> {
  const state = shared();
  const server = await state.workerstackSsr;
  await server?.close();
  state.workerstackSsr = undefined;
}

declare module "vitest/browser" {
  interface BrowserCommands {
    serverRender: (fixture: string, name: string) => Promise<ServerRendered>;
  }
}
