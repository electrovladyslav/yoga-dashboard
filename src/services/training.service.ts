import type { Training } from '@/models/training.model';
import { getDb } from '@/lib/db';

type Result<T, E extends Error = Error> = { ok: true; value: T } | { ok: false; error: E };

export const migrateFromLocalStorage = async (): Promise<void> => {
  const raw = localStorage.getItem('trainings');
  if (!raw) return;
  try {
    const records: Training[] = JSON.parse(raw);
    const db = await getDb();
    await Promise.all(records.map((r) => db.put('trainings', r)));
    localStorage.removeItem('trainings');
  } catch {
    // noop
  }
};

export const saveTraining = async (training: Training): Promise<Result<void>> => {
  try {
    const db = await getDb();
    await db.put('trainings', training);
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
};

export const getTraining = async (date: string): Promise<Result<Training | undefined>> => {
  try {
    const db = await getDb();
    const training = await db.get('trainings', date);
    return { ok: true, value: training };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
};
