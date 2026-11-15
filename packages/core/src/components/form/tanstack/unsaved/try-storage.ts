// Where drafts live: this device's localStorage. Storage that can't be used (a private window, a
// blocked origin, a full quota) throws, so every call goes through `tryStorage`. Only called after
// mount: a server render never reaches it.

function draftStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** Runs `run` on this device's localStorage; `false` when storage can't be used or refused the call. */
export function tryStorage(run: (storage: Storage) => void): boolean {
  const storage = draftStorage();

  if (storage === undefined) return false;

  try {
    run(storage);

    return true;
  } catch {
    return false;
  }
}
