import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

function makeMockStorage(initial?: string): Storage {
  const store: Record<string, string> = initial ? { trainings: initial } : {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };
}

describe('migrateFromLocalStorage', () => {
  beforeEach(() => {
    vi.doUnmock('@/lib/db');
    vi.resetModules();
    vi.stubGlobal('indexedDB', new IDBFactory());
  });

  it('migrates records from localStorage into IndexedDB and removes the key', async () => {
    const records = [
      { date: '2024-01-01', steps: { 'warm-up': ['Mountain Pose'] } },
      { date: '2024-01-02', steps: { workout: ['Warrior I'] } },
    ];
    vi.stubGlobal('localStorage', makeMockStorage(JSON.stringify(records)));

    const { migrateFromLocalStorage, getTraining } = await import('./training.service');
    await migrateFromLocalStorage();

    const first = await getTraining('2024-01-01');
    const second = await getTraining('2024-01-02');
    expect(first.ok && first.value?.date).toBe('2024-01-01');
    expect(second.ok && second.value?.date).toBe('2024-01-02');
    expect(localStorage.getItem('trainings')).toBeNull();
  });

  it('is a no-op when localStorage has no trainings key', async () => {
    vi.stubGlobal('localStorage', makeMockStorage());

    const { migrateFromLocalStorage, getTraining } = await import('./training.service');
    await migrateFromLocalStorage();

    const result = await getTraining('2024-01-01');
    expect(result.ok && result.value).toBeUndefined();
  });

  it('leaves localStorage intact when JSON is malformed', async () => {
    vi.stubGlobal('localStorage', makeMockStorage('not-valid-json'));

    const { migrateFromLocalStorage } = await import('./training.service');
    await expect(migrateFromLocalStorage()).resolves.not.toThrow();
    expect(localStorage.getItem('trainings')).toBe('not-valid-json');
  });
});
