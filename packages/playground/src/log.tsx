import type { JSX } from "@solidjs/web";
import { createContext, createSignal, For, useContext } from "solid-js";

/** One recorded callback. */
type Entry = {
  id: number;
  time: string;
  source: string;
  detail: string;
};

/** Records a component callback so its arguments can be checked on the page. */
export type Log = (source: string, ...args: unknown[]) => void;

/** The newest entries the panel keeps. */
const MAX_ENTRIES = 50;

type LogStore = { entries: () => Entry[]; log: Log; clear: () => void };

/** The context is its own provider component; under a member name, JSX treats it as one. */
const logContext = { Provider: /* @__PURE__ */ createContext<LogStore>() };

function createLog(): LogStore {
  const [entries, setEntries] = createSignal<Entry[]>([]);
  let nextId = 0;

  function log(source: string, ...args: unknown[]): void {
    const detail = args.map((arg) => String(arg)).join(", ");
    const time = new Date().toLocaleTimeString([], { hour12: false });
    const id = nextId;
    nextId += 1;
    setEntries((list) => [{ detail, id, source, time }, ...list].slice(0, MAX_ENTRIES));
  }

  return { clear: () => setEntries([]), entries, log };
}

/** Throws outside a LogProvider: the context has no default. */
function useLogStore(): LogStore {
  return useContext(logContext.Provider);
}

/** The page's log, shared by every section and the EventLog panel. */
export function LogProvider(props: { children: JSX.Element }): JSX.Element {
  return <logContext.Provider value={createLog()}>{props.children}</logContext.Provider>;
}

/** The `log` function of the nearest LogProvider. */
export function useLog(): Log {
  return useLogStore().log;
}

/** The panel listing the newest log entries first. */
export function EventLog(): JSX.Element {
  const store = useLogStore();

  return (
    <aside class="flex min-h-0 flex-col rounded-lg border border-border bg-popover text-popover-foreground">
      <header class="flex items-center justify-between border-b border-border px-3 py-2">
        <h2 class="text-sm font-medium">Events</h2>
        <button class="text-xs text-muted-foreground hover:text-foreground" onClick={() => store.clear()}>
          Clear
        </button>
      </header>
      <ol class="min-h-0 flex-1 overflow-auto p-2 font-mono text-xs" aria-live="polite">
        <For each={store.entries()} fallback={<li class="p-1 text-muted-foreground">Interact with a component.</li>}>
          {(entry) => (
            <li class="flex gap-2 rounded px-1 py-0.5 hover:bg-muted">
              <span class="text-muted-foreground">{entry.time}</span>
              <span class="font-semibold">{entry.source}</span>
              <span class="truncate">{entry.detail}</span>
            </li>
          )}
        </For>
      </ol>
    </aside>
  );
}
