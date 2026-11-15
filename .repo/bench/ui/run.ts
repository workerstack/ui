import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

import { BUILD_ARG, COMMAND_ARG, DECIMALS, GZIP_LEVEL } from "./bench.constants.ts";
import { timePages } from "./browser.ts";
import { buildCandidate } from "./build-candidate.ts";
import type { Candidate } from "./candidate.ts";
import { coreDir, outDir } from "./paths.ts";
import { renderServer } from "./server.ts";

// Insertion into a copy: the samples are few, and this lint's lib has no toSorted.
function ascending(values: number[]): number[] {
  const sorted: number[] = [];

  for (const value of values) {
    const larger = sorted.filter((other) => other > value).length;

    sorted.splice(sorted.length - larger, 0, value);
  }

  return sorted;
}

function median(values: number[]): number {
  const sorted = ascending(values);
  const middle = Math.floor(sorted.length / 2);
  const high = sorted[middle] ?? Number.NaN;

  return sorted.length % 2 === 1 ? high : ((sorted[middle - 1] ?? Number.NaN) + high) / 2;
}

function p50(values: number[]): number {
  return Number(median(values).toFixed(DECIMALS));
}

/** Measures a built candidate and prints its metrics as the last stdout line. */
async function measureCandidate(candidate: Candidate): Promise<void> {
  const dir = outDir(candidate.name);
  const bytes = gzipSync(readFileSync(path.join(dir, "size.js")), { level: GZIP_LEVEL }).length;
  const rendered = await renderServer(dir);
  const pages = await timePages(dir, rendered);

  const metrics = {
    "artifact-bytes": bytes,
    "hydrate-p50": p50(pages.hydrate),
    "mount-p50": p50(pages.mount),
    "ssr-p50": p50(rendered.renders),
  };

  process.stdout.write(`bench: ${JSON.stringify(metrics)}\n`);
}

/** Builds the candidate with `build` as the first argument, else measures it. */
export async function runCandidate(candidate: Candidate): Promise<void> {
  await (process.argv[COMMAND_ARG] === BUILD_ARG ? buildCandidate(candidate) : measureCandidate(candidate));
}

/** Builds packages/core, so the ours candidate measures its current source. */
export function buildCore(): void {
  execFileSync("bun", ["run", "build"], { cwd: coreDir(), stdio: ["ignore", "ignore", "inherit"] });
}
