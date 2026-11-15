import { createSignal, onSettled } from "solid-js";

const SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

/** Under this many seconds reads as "now". */
const NOW_WITHIN = 45;

/** How often a shown relative time is brought up to date. */
const TICK = 30_000;

/** How long before `now` the time `then` was, as a person says it ("now", "2 minutes ago"). */
export function relativeTime(then: number, now: number, locale: string): string {
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const seconds = Math.round((then - Math.max(now, then)) / SECOND);

  if (Math.abs(seconds) < NOW_WITHIN) return format.format(0, "second");

  const minutes = Math.round(seconds / SECONDS_PER_MINUTE);

  if (Math.abs(minutes) < MINUTES_PER_HOUR) return format.format(minutes, "minute");

  const hours = Math.round(minutes / MINUTES_PER_HOUR);

  if (Math.abs(hours) < HOURS_PER_DAY) return format.format(hours, "hour");

  return format.format(Math.round(hours / HOURS_PER_DAY), "day");
}

/** The time now, ticking every 30 seconds after mount, for a relative time that stays current. */
export function useNow(): () => number {
  // Written from the interval.
  const [now, setNow] = createSignal(Date.now(), { ownedWrite: true });

  onSettled(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK);

    return () => clearInterval(timer);
  });

  return now;
}
