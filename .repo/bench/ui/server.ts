import path from "node:path";
import { pathToFileURL } from "node:url";

import { SSR_RENDERS, SSR_WARMUP } from "./bench.constants.ts";
import { serverProblems } from "./expect.ts";

/** The server bundle's exports. */
export type Server = { hydrationScript: () => string; renderApp: () => string };

/** The server's checked HTML and its render times. */
export type Rendered = { html: string; renders: number[]; script: string };

function timeRender(server: Server): number {
  const start = performance.now();

  server.renderApp();

  return performance.now() - start;
}

/** Loads the server bundle, checks its HTML, then times SSR_RENDERS renders after SSR_WARMUP. */
export async function renderServer(dir: string): Promise<Rendered> {
  const loaded: unknown = await import(pathToFileURL(path.join(dir, "server.mjs")).href);
  const server = loaded /* the server entry exports renderApp and hydrationScript */ as Server;
  const html = server.renderApp();
  const wrong = serverProblems(html);

  if (wrong.length > 0) throw new Error(wrong.join("; "));

  const times = Array.from({ length: SSR_WARMUP + SSR_RENDERS }, () => timeRender(server));

  return { html, renders: times.slice(SSR_WARMUP), script: server.hydrationScript() };
}
