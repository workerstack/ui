import { coreDir } from "./paths.ts";
import { runCandidate } from "./run.ts";

// Bare @ui-sdk/solid parts, resolved from packages/core, which depends on them.
await runCandidate({ from: coreDir(), kit: "uiSdkKit", name: "ui-sdk" });
