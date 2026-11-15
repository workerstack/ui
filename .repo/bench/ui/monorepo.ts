import { homedir } from "node:os";
import path from "node:path";

import { runCandidate } from "./run.ts";

// The monorepo's UI from its source, resolved from its own folder and node_modules as its
// playground resolves it: @solidports/base-ui and the monorepo's Solid.
await runCandidate({
  from: path.join(homedir(), "Development", "monorepo", "packages", "frontend", "ui"),
  kit: "monorepoKit",
  name: "monorepo",
});
