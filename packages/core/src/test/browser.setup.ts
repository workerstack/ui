import { beforeEach } from "vitest";
import { commands } from "vitest/browser";

import "./browser.css";

// The real mouse stays where the last test left it, so a part a test renders under it starts hovered and paints
// its hover color. Each test starts with the mouse off the page.
beforeEach(() => commands.movePointerAway());
