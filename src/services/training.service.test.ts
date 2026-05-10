import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveTraining, getTrainings } from './training.service';
import type { Training } from '@/models/training.model';

const mockTraining: Training = {
  date: '2024-03-15',
  steps: {
    'warm-up': ['Mountain Pose', 'Downward-Facing Dog'],
    'workout': ['Warrior I', 'Warrior II'],
  },
};

function makeMockStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };
}

describe('training.service', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeMockStorage());
  });

  describe('saveTraining', () => {
    it('persists a training to localStorage', () => {
      saveTraining(mockTraining);
      const stored = JSON.parse(localStorage.getItem('trainings') ?? '[]') as Training[];
      expect(stored).toHaveLength(1);
      expect(stored[0].date).toBe('2024-03-15');
    });

    it('appends to existing trainings', () => {
      const second: Training = { date: '2024-03-16', steps: {} };
      saveTraining(mockTraining);
      saveTraining(second);
      const stored = JSON.parse(localStorage.getItem('trainings') ?? '[]') as Training[];
      expect(stored).toHaveLength(2);
    });
  });

  describe('getTrainings', () => {
    it('returns the training matching the date', () => {
      saveTraining(mockTraining);
      const result = getTrainings('2024-03-15');
      expect(result).toEqual(mockTraining);
    });

    it('returns undefined when no training found for the date', () => {
      saveTraining(mockTraining);
      expect(getTrainings('1999-01-01')).toBeUndefined();
    });

    it('returns undefined when localStorage is empty', () => {
      expect(getTrainings('2024-03-15')).toBeUndefined();
    });
  });
});
