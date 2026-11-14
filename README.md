# ui

Fast, SSR-ready UI library built on Solid, TanStack Form and Tailwind.

Every utility is its own subpath export: import the one you need, the rest is never loaded and is tree-shaken from your bundle.

```sh
bun add @workerstack/ui
```

| Import | What it is |
| --- | --- |
| `@workerstack/ui/lru-cache` | Bounded LRU cache with soft and hard TTLs for stale-while-revalidate |
| `@workerstack/ui/tiered-cache` | Isolate LRU → Workers KV → source cache on a TTL preset, with request bypass and tracing |

```ts
import { LruCache } from "@workerstack/ui/lru-cache";

const cache = new LruCache<string, number>({ maxSize: 100, ttlMs: 30_000, hardTtlMs: 60_000 });
cache.set("a", 1);
cache.getWithMeta("a"); // { value: 1, stale: false }
```

```ts
import { TieredCache } from "@workerstack/ui/tiered-cache";

const users = new TieredCache<User>({ name: "users", preset: "STANDARD", maxSize: 500, kv: { prefix: "user:" } });

const user = await users.get(id, { background: ctx.waitUntil.bind(ctx) }, { kv: env.CACHE, fetch: () => db.user(id) });
```

## Development

```sh
bun install
bun run fmt:check && bun run lint && bun run typecheck && bun run test && bun run build
```

## License

MIT
