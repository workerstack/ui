import { coreDir } from "./paths.ts";
import { buildCore, runCandidate } from "./run.ts";

// @workerstack/ui from packages/core's build output, as a consumer installs it.
await runCandidate({ from: coreDir(), kit: "oursKit", name: "ours", prepare: buildCore });
