import { createInMemoryStore, type DomainStore } from "@vorzop/db";

let store: DomainStore | null = null;

export function getDomainStore(): DomainStore {
  if (!store) {
    store = createInMemoryStore();
  }
  return store;
}

/** Test helper — reset singleton */
export function resetDomainStore(next?: DomainStore) {
  store = next ?? null;
}
