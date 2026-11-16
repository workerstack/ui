// Runs a task one at a time. A call made while it runs makes it run once more, so the last change is always seen.

/** Runs `task` until no call came in while it ran. */
async function drain(task: () => Promise<void>, requests: () => number): Promise<void> {
  const seen = requests();

  await task();

  if (seen !== requests()) await drain(task, requests);
}

/** Starts `task` for each call, never two at once; resolves with the message of a failure, or undefined. */
export function serialized(task: () => Promise<void>): () => Promise<string | undefined> {
  let isWorking = false;
  let requests = 0;

  return async () => {
    requests += 1;

    if (isWorking) return undefined;

    isWorking = true;

    try {
      await drain(task, () => requests);

      return undefined;
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    } finally {
      isWorking = false;
    }
  };
}
