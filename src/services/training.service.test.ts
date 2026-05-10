import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import type { Training } from '@/models/training.model';

const mockTraining: Training = {
  date: '2024-03-15',
  steps: { 'warm-up': ['Mountain Pose', 'Downward-Facing Dog'] },
};

describe('training.service', () => {
  beforeEach(() => {
    vi.doUnmock('@/lib/db');
    vi.resetModules();
    vi.stubGlobal('indexedDB', new IDBFactory());
  });

  describe('saveTraining', () => {
    it('inserts a new training record and resolves ok', async () => {
      const { saveTraining } = await import('./training.service');
      const result = await saveTraining(mockTraining);
      expect(result.ok).toBe(true);
    });

    it('upserts when saving a training for an existing date', async () => {
      const { saveTraining, getTraining } = await import('./training.service');
      const updated: Training = { ...mockTraining, steps: { workout: ['Warrior I'] } };
      await saveTraining(mockTraining);
      await saveTraining(updated);
      const result = await getTraining('2024-03-15');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value?.steps).toEqual({ workout: ['Warrior I'] });
      }
    });

    it('returns an error result when IndexedDB is unavailable', async () => {
      vi.doMock('@/lib/db', () => ({
        getDb: () => Promise.reject(new Error('IDB unavailable')),
      }));
      const { saveTraining } = await import('./training.service');
      const result = await saveTraining(mockTraining);
      expect(result.ok).toBe(false);
    });
  });

  describe('getTraining', () => {
    it('returns the training matching the given date', async () => {
      const { saveTraining, getTraining } = await import('./training.service');
      await saveTraining(mockTraining);
      const result = await getTraining('2024-03-15');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockTraining);
      }
    });

    it('returns undefined when no training exists for the date', async () => {
      const { getTraining } = await import('./training.service');
      const result = await getTraining('1999-01-01');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
    });

    it('returns an error result when IndexedDB is unavailable', async () => {
      vi.doMock('@/lib/db', () => ({
        getDb: () => Promise.reject(new Error('IDB unavailable')),
      }));
      const { getTraining } = await import('./training.service');
      const result = await getTraining('2024-03-15');
      expect(result.ok).toBe(false);
    });
  });
});
