import { say } from "../../announce/live-region.ts";

/** Speaks through the shared live region, e.g. after a menu move. */
export function announce(message: string): void {
  say(message);
}
