import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

const DB_NAME = 'yoga-dashboard';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export const getDb = (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('trainings')) {
          db.createObjectStore('trainings', { keyPath: 'date' });
        }
      },
    });
  }
  return dbPromise;
};
