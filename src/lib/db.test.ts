import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';

describe('getDb', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns a database with a trainings object store', async () => {
    const { getDb } = await import('./db');
    const db = await getDb();
    expect(db.objectStoreNames.contains('trainings')).toBe(true);
  });

  it('returns the same instance on repeated calls', async () => {
    const { getDb } = await import('./db');
    const first = await getDb();
    const second = await getDb();
    expect(first).toBe(second);
  });
});
